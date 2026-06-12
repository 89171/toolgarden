import { FormatOutcome, parseLooseJSON, stringifyJSONValue } from './json';

type JsonSchema = Record<string, unknown>;

/** 从 JSON 值递归推断 JSON Schema */
function inferSchema(value: unknown): JsonSchema {
  if (value === null) return { type: 'null' };

  if (Array.isArray(value)) {
    if (value.length === 0) return { type: 'array', items: {} };
    // 合并所有元素的 schema
    const itemSchemas = value.map((item) => inferSchema(item));
    const merged = itemSchemas.length === 1
      ? itemSchemas[0]
      : { oneOf: itemSchemas };
    return { type: 'array', items: merged };
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const properties: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      properties[k] = inferSchema(v);
    }
    const schema: JsonSchema = {
      type: 'object',
      properties,
    };
    if (Object.keys(properties).length > 0) {
      schema.required = Object.keys(properties);
    }
    return schema;
  }

  if (typeof value === 'string') {
    // 尝试检测常见格式
    const schema: JsonSchema = { type: 'string' };
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) schema.format = 'date-time';
    else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) schema.format = 'date';
    else if (/^[\w._%+-]+@[\w.-]+\.[a-z]{2,}$/i.test(value)) schema.format = 'email';
    else if (/^https?:\/\//.test(value)) schema.format = 'uri';
    return schema;
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
  }

  if (typeof value === 'boolean') return { type: 'boolean' };

  return {};
}

/** 从 JSON 字符串生成 JSON Schema */
export function generateSchema(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = parseLooseJSON(input);
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      ...inferSchema(parsed),
    };
    return { ok: true, output: stringifyJSONValue(schema, 2), parsed: schema };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export interface SchemaValidationError {
  path: string;
  message: string;
}

export type SchemaValidationOutcome =
  | { ok: true; valid: boolean; errors: SchemaValidationError[]; output: string; parsed: unknown }
  | { ok: false; message: string };

function getJsonType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function typeMatches(value: unknown, expected: string): boolean {
  if (expected === 'integer') return typeof value === 'number' && Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number';
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
  if (expected === 'null') return value === null;
  return typeof value === expected;
}

function asSchema(value: unknown): JsonSchema | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonSchema
    : null;
}

function formatPath(path: string): string {
  return path || '$';
}

function isEmail(value: string): boolean {
  return /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i.test(value);
}

function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
}

function isUri(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function addError(errors: SchemaValidationError[], path: string, message: string) {
  errors.push({ path: formatPath(path), message });
}

function validateAgainstSchema(value: unknown, schema: JsonSchema, path: string, errors: SchemaValidationError[]) {
  const expectedType = schema.type;
  if (typeof expectedType === 'string' || Array.isArray(expectedType)) {
    const types = Array.isArray(expectedType) ? expectedType : [expectedType];
    if (!types.some((type) => typeMatches(value, type))) {
      addError(errors, path, `Expected ${types.join(' or ')}, got ${getJsonType(value)}`);
      return;
    }
  }

  if ('const' in schema && stringifyJSONValue(value) !== stringifyJSONValue(schema.const)) {
    addError(errors, path, `Expected constant ${stringifyJSONValue(schema.const)}`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((item) => stringifyJSONValue(item) === stringifyJSONValue(value))) {
    addError(errors, path, `Expected one of ${stringifyJSONValue(schema.enum)}`);
  }

  const allOf = Array.isArray(schema.allOf) ? schema.allOf : [];
  for (const item of allOf) {
    const childSchema = asSchema(item);
    if (childSchema) validateAgainstSchema(value, childSchema, path, errors);
  }

  const anyOf = Array.isArray(schema.anyOf) ? schema.anyOf : [];
  if (anyOf.length > 0) {
    const matched = anyOf.some((item) => {
      const childSchema = asSchema(item);
      if (!childSchema) return false;
      const childErrors: SchemaValidationError[] = [];
      validateAgainstSchema(value, childSchema, path, childErrors);
      return childErrors.length === 0;
    });
    if (!matched) addError(errors, path, 'Value does not match any schema in anyOf');
  }

  const oneOf = Array.isArray(schema.oneOf) ? schema.oneOf : [];
  if (oneOf.length > 0) {
    const matchCount = oneOf.filter((item) => {
      const childSchema = asSchema(item);
      if (!childSchema) return false;
      const childErrors: SchemaValidationError[] = [];
      validateAgainstSchema(value, childSchema, path, childErrors);
      return childErrors.length === 0;
    }).length;
    if (matchCount !== 1) addError(errors, path, `Expected exactly one oneOf match, got ${matchCount}`);
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      addError(errors, path, `Expected at least ${schema.minLength} characters`);
    }
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      addError(errors, path, `Expected at most ${schema.maxLength} characters`);
    }
    if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern).test(value)) {
      addError(errors, path, `Expected string to match /${schema.pattern}/`);
    }
    if (schema.format === 'email' && !isEmail(value)) addError(errors, path, 'Expected email format');
    if (schema.format === 'date' && !isDate(value)) addError(errors, path, 'Expected date format');
    if (schema.format === 'date-time' && !isDateTime(value)) addError(errors, path, 'Expected date-time format');
    if (schema.format === 'uri' && !isUri(value)) addError(errors, path, 'Expected URI format');
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) addError(errors, path, `Expected >= ${schema.minimum}`);
    if (typeof schema.maximum === 'number' && value > schema.maximum) addError(errors, path, `Expected <= ${schema.maximum}`);
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) addError(errors, path, `Expected > ${schema.exclusiveMinimum}`);
    if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum) addError(errors, path, `Expected < ${schema.exclusiveMaximum}`);
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) addError(errors, path, `Expected at least ${schema.minItems} items`);
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) addError(errors, path, `Expected at most ${schema.maxItems} items`);

    const itemSchema = asSchema(schema.items);
    if (itemSchema) {
      value.forEach((item, index) => validateAgainstSchema(item, itemSchema, `${path}[${index}]`, errors));
    }
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === 'string') : [];
    for (const key of required) {
      if (!(key in obj)) addError(errors, `${path}.${key}`, 'Missing required property');
    }

    const properties = asSchema(schema.properties) ?? {};
    for (const [key, propertySchema] of Object.entries(properties)) {
      const childSchema = asSchema(propertySchema);
      if (childSchema && key in obj) validateAgainstSchema(obj[key], childSchema, `${path}.${key}`, errors);
    }

    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(properties));
      for (const key of Object.keys(obj)) {
        if (!allowedKeys.has(key)) addError(errors, `${path}.${key}`, 'Unexpected additional property');
      }
    } else {
      const additionalSchema = asSchema(schema.additionalProperties);
      if (additionalSchema) {
        const knownKeys = new Set(Object.keys(properties));
        for (const [key, childValue] of Object.entries(obj)) {
          if (!knownKeys.has(key)) validateAgainstSchema(childValue, additionalSchema, `${path}.${key}`, errors);
        }
      }
    }

    if (typeof schema.minProperties === 'number' && Object.keys(obj).length < schema.minProperties) {
      addError(errors, path, `Expected at least ${schema.minProperties} properties`);
    }
    if (typeof schema.maxProperties === 'number' && Object.keys(obj).length > schema.maxProperties) {
      addError(errors, path, `Expected at most ${schema.maxProperties} properties`);
    }
  }
}

export function validateJsonSchema(jsonInput: string, schemaInput: string): SchemaValidationOutcome {
  if (!jsonInput.trim()) return { ok: false, message: '请输入 JSON 数据' };
  if (!schemaInput.trim()) return { ok: false, message: '请输入 JSON Schema' };

  try {
    const parsed = parseLooseJSON(jsonInput);
    const schema = parseLooseJSON(schemaInput);
    const rootSchema = asSchema(schema);

    if (!rootSchema) return { ok: false, message: 'Schema 必须是 JSON 对象' };

    const errors: SchemaValidationError[] = [];
    validateAgainstSchema(parsed, rootSchema, '$', errors);

    const valid = errors.length === 0;
    return {
      ok: true,
      valid,
      errors,
      output: valid
        ? 'Valid: JSON matches the schema.'
        : stringifyJSONValue(errors, 2),
      parsed,
    };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

import { parseLooseJSON, stringifyJSONValue } from './json';

export type Needle2SchemaResult =
  | {
      ok: true;
      schema: Record<string, unknown>;
      tools: Array<Record<string, unknown>>;
    }
  | {
      ok: false;
      message: string;
    };

export interface Needle2FunctionCall {
  name?: string;
  arguments?: unknown;
}

export interface Needle2Response {
  type?: string;
  error?: string;
  function_calls?: Needle2FunctionCall[];
  reasoning?: string;
  confidence?: number | null;
  decode_tps?: number;
  prefill_tps?: number;
  peak_ram_mb?: number;
  [key: string]: unknown;
}

export type Needle2CompletionOutcome =
  | {
      ok: true;
      response: Needle2Response;
      output: string;
      parsed: unknown;
    }
  | {
      ok: false;
      code?: 'proxy_missing';
      message: string;
    };

/**
 * 将用户提供的记录 schema 转成 Needle 2 的单工具提取契约。
 * Needle 2 没有单独的 JSON mode：结构化提取就是声明一个唯一工具。
 */
export function parseNeedle2Schema(input: string): Needle2SchemaResult {
  if (!input.trim()) return { ok: false, message: '' };

  try {
    const parsed = parseLooseJSON(input);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ok: false, message: 'Schema must be a JSON object.' };
    }

    const schema = parsed as Record<string, unknown>;
    if (schema.type !== 'object') {
      return { ok: false, message: 'The root schema type must be object.' };
    }

    const properties = schema.properties;
    if (properties !== undefined &&
        (typeof properties !== 'object' || properties === null || Array.isArray(properties))) {
      return { ok: false, message: 'Schema properties must be an object.' };
    }

    const required = schema.required;
    if (required !== undefined &&
        (!Array.isArray(required) || required.some((item) => typeof item !== 'string'))) {
      return { ok: false, message: 'Schema required must be an array of strings.' };
    }

    return {
      ok: true,
      schema,
      tools: [{
        name: 'structured_data',
        description: 'Extract a structured record from the input text using this schema.',
        parameters: schema,
      }],
    };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

/** 调用兼容 Needle 2 playground `/complete` 契约的 endpoint。 */
export async function completeWithNeedle2(
  endpoint: string,
  query: string,
  schema: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Needle2CompletionOutcome> {
  if (!query.trim()) return { ok: false, message: 'Input text is empty.' };

  let url: URL;
  try {
    url = new URL(endpoint.trim(), typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol.');
  } catch {
    return { ok: false, message: 'Enter a valid HTTP(S) endpoint.' };
  }

  try {
    const schemaResult = parseNeedle2Schema(stringifyJSONValue(schema));
    if (!schemaResult.ok) return schemaResult;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tools: schemaResult.tools }),
      signal,
    });
    const rawPayload = await response.text();
    if (response.status === 404 && endpoint.trim() === '/api/needle-2') {
      return {
        ok: false,
        code: 'proxy_missing',
        message: 'The local proxy is unavailable in this deployment.',
      };
    }

    let payload: Needle2Response;
    try {
      const parsedPayload = parseLooseJSON(rawPayload);
      if (typeof parsedPayload !== 'object' || parsedPayload === null || Array.isArray(parsedPayload)) {
        return { ok: false, message: `Endpoint returned an invalid JSON object (${response.status}).` };
      }
      payload = parsedPayload as Needle2Response;
    } catch {
      return { ok: false, message: `Endpoint returned a non-JSON response (${response.status}).` };
    }

    if (!response.ok || payload.error) {
      return { ok: false, message: payload.error || `Request failed (${response.status}).` };
    }

    const call = Array.isArray(payload.function_calls) ? payload.function_calls[0] : undefined;
    const parsed = call?.arguments ?? null;

    return {
      ok: true,
      response: payload,
      parsed,
      output: call?.arguments === undefined ? '' : stringifyJSONValue(call.arguments, 2),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    if (error instanceof TypeError && /fetch/i.test(error.message)) {
      return {
        ok: false,
        message: 'Unable to reach the endpoint. Start Needle playground or check its CORS settings.',
      };
    }
    return { ok: false, message: (error as Error).message };
  }
}

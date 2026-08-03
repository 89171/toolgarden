'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { validateJsonSchema, SchemaValidationError } from '@/lib/utils/schema';
import { stringifyJSONValue } from '@/lib/utils/json';
import { jsonSchemaValidateContent } from '@/lib/tools/content/json-schema-validate';

const EXAMPLE_JSON = stringifyJSONValue({
  id: 1,
  name: '张三',
  email: 'zhang@example.com',
}, 2);

const EXAMPLE_SCHEMA = stringifyJSONValue({
  type: 'object',
  required: ['id', 'email'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
}, 2);

export default function JsonSchemaValidatePage() {
  const t = useTranslations('tools.json-schema-validate');
  const tc = useTranslations('common');
  const [jsonInput, setJsonInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!jsonInput.trim() && !schemaInput.trim()) return null;
    return validateJsonSchema(jsonInput, schemaInput);
  }, [jsonInput, schemaInput]);
  const valid = result?.ok ? result.valid : null;
  const errors: SchemaValidationError[] = result?.ok ? result.errors : [];
  const output = result?.ok ? result.output : '';
  const error = result && !result.ok ? result.message : '';

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    setJsonInput(EXAMPLE_JSON);
    setSchemaInput(EXAMPLE_SCHEMA);
  };

  const clear = () => {
    setJsonInput('');
    setSchemaInput('');
  };

  return (
    <ToolLayout toolId="json-schema-validate" content={jsonSchemaValidateContent}>
      <div className="flex-grow flex flex-col gap-4 min-h-0">
        <div className="grid min-h-0 grid-cols-1 gap-4 sm:gap-6 lg:min-h-[40dvh] lg:grid-cols-2">
          <Panel title={t('json_title')} className="min-h-64">
            <textarea
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
              placeholder={t('json_placeholder')}
            />
          </Panel>
          <Panel title={t('schema_title')} className="min-h-64">
            <textarea
              value={schemaInput}
              onChange={(event) => setSchemaInput(event.target.value)}
              className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
              placeholder={t('schema_placeholder')}
            />
          </Panel>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={loadExample}>{tc('example')}</Button>
          <Button variant="secondary" onClick={clear}>{tc('clear')}</Button>
          {valid !== null && (
            <span className={`text-sm font-medium ${valid ? 'text-syntax-string' : 'text-syntax-null'}`}>
              {valid ? t('valid') : t('invalid')}
            </span>
          )}
        </div>

        <Panel title={t('result_title')} actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>} className="flex-grow min-h-64">
          <div className="border border-border-input rounded flex-grow p-3 bg-surface-raised overflow-auto">
            {error ? <p className="text-syntax-null text-sm">{error}</p>
              : valid === null ? <p className="text-content-faint text-sm flex items-center justify-center h-full">{t('empty_output')}</p>
              : valid ? <p className="text-syntax-string text-sm">{output}</p>
              : (
                <div className="flex flex-col gap-2">
                  {errors.map((item) => (
                    <div key={`${item.path}-${item.message}`} className="rounded border border-border-base bg-surface p-3">
                      <p className="font-mono text-xs text-content-secondary">{item.path}</p>
                      <p className="text-sm text-syntax-null mt-1">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}

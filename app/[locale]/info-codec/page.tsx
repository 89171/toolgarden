'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  InfoCodecOperation,
  runInfoCodecOperation,
} from '@/lib/utils/info-codec';
import { infoCodecContent } from '@/lib/tools/content/info-codec';

const ENCODE_OPERATIONS: InfoCodecOperation[] = [
  'legacy-encode',
  'unicode-encode',
  'url-encode',
  'utf16-encode',
  'base64-encode',
  'md5',
  'hex-encode',
  'sha1',
  'string-escape',
];

const DECODE_OPERATIONS: InfoCodecOperation[] = [
  'unicode-decode',
  'url-decode',
  'utf16-decode',
  'base64-decode',
  'hex-decode',
  'html-entity-decode',
  'url-params-parse',
  'jwt-decode',
  'cookie-format',
  'gzip-decompress',
  'string-unescape',
];

const OPERATION_EXAMPLES: Record<InfoCodecOperation, string> = {
  'legacy-encode': '信息编码 Encode',
  'unicode-encode': '信息编码',
  'url-encode': 'https://example.com/search?q=信息编码&lang=zh',
  'utf16-encode': '信息编码',
  'base64-encode': 'Hello, JSON Toolkit',
  md5: 'Hello, JSON Toolkit',
  'hex-encode': 'Hello, JSON Toolkit',
  sha1: 'Hello, JSON Toolkit',
  'string-escape': 'Line 1\nLine 2 "quoted"',
  'unicode-decode': '\\u4fe1\\u606f\\u7f16\\u7801',
  'url-decode': 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3D%E4%BF%A1%E6%81%AF%E7%BC%96%E7%A0%81',
  'utf16-decode': '\\xe4\\xbf\\xa1\\xe6\\x81\\xaf\\xe7\\xbc\\x96\\xe7\\xa0\\x81',
  'base64-decode': 'SGVsbG8sIEpTT04gVG9vbGtpdA==',
  'hex-decode': '48656c6c6f2c204a534f4e20546f6f6c6b6974',
  'html-entity-decode': '&lt;span title=&quot;JSON&quot;&gt;Toolkit&lt;/span&gt;',
  'url-params-parse': 'https://example.com/search?q=json&tag=tool&tag=encode',
  'jwt-decode':
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8gOS4iSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  'cookie-format': 'session=abc123; theme=dark; locale=zh-CN',
  'gzip-decompress': 'H4sIAAimOGoAA/NIzcnJ11HwCvb3UwjJz8/JziwBAEdPt/8TAAAA',
  'string-unescape': 'Line 1\\nLine 2 \\"quoted\\"',
};

export default function InfoCodecPage() {
  const t = useTranslations('tools.info-codec');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [operation, setOperation] = useState<InfoCodecOperation>('legacy-encode');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => runInfoCodecOperation(input, operation), [input, operation]);
  const output = result.ok ? result.output : '';
  const error = result.ok ? '' : t(`errors.${result.code}`);
  const currentOperationLabel = t(`operations.${operation}`);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectOperation = (nextOperation: InfoCodecOperation) => {
    setOperation(nextOperation);
    setCopied(false);
  };

  const renderOperationButtons = (operations: InfoCodecOperation[]) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {operations.map((item) => (
        <Button
          key={item}
          type="button"
          variant={operation === item ? 'primary' : 'secondary'}
          className="min-h-9 justify-center whitespace-normal px-2 text-center leading-snug"
          aria-pressed={operation === item}
          onClick={() => selectOperation(item)}
        >
          {t(`operations.${item}`)}
        </Button>
      ))}
    </div>
  );

  return (
    <ToolLayout toolId="info-codec" content={infoCodecContent}>
      <div className="flex-grow grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-h-0">
        <div className="flex min-h-0 flex-col gap-4">
          <Panel
            title={t('input_title')}
            actions={(
              <>
                <Button variant="secondary" onClick={() => setInput(OPERATION_EXAMPLES[operation])}>
                  {tc('example')}
                </Button>
                <Button variant="secondary" onClick={() => setInput('')}>
                  {tc('clear')}
                </Button>
              </>
            )}
            className="min-h-64"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="w-full flex-grow resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              placeholder={t('placeholder')}
            />
          </Panel>

          <Panel title={t('operation_title')} className="min-h-fit">
            <div className="flex flex-col gap-4">
              <section aria-labelledby="info-codec-encode">
                <h2 id="info-codec-encode" className="mb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {t('encode_group')}
                </h2>
                {renderOperationButtons(ENCODE_OPERATIONS)}
              </section>
              <section aria-labelledby="info-codec-decode">
                <h2 id="info-codec-decode" className="mb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {t('decode_group')}
                </h2>
                {renderOperationButtons(DECODE_OPERATIONS)}
              </section>
            </div>
          </Panel>
        </div>

        <Panel
          title={`${t('output_title')} · ${currentOperationLabel}`}
          actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>}
          className="min-h-80"
        >
          <div className="min-h-0 flex-grow overflow-auto rounded border border-border-input bg-surface-raised p-3">
            {error ? (
              <p className="text-sm text-syntax-null">{error}</p>
            ) : output ? (
              <pre className="whitespace-pre-wrap break-all font-mono text-sm text-content-secondary">{output}</pre>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-content-faint">{tc('empty')}</p>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}

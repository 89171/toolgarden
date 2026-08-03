'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { decodeJwt, verifyJwtHs256 } from '@/lib/utils/jwt';
import { stringifyJSONValue } from '@/lib/utils/json';
import { jwtContent } from '@/lib/tools/content/jwt';

const EXAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8gOS4iSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export default function JwtPage() {
  const t = useTranslations('tools.jwt');
  const tc = useTranslations('common');
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyResult, setVerifyResult] = useState('');
  const [verifying, setVerifying] = useState(false);

  const decoded = useMemo(() => (token.trim() ? decodeJwt(token) : null), [token]);

  const updateToken = (value: string) => {
    setToken(value);
    setVerifyResult('');
  };

  const verify = async () => {
    if (!secret.trim()) { setVerifyResult(t('no_secret')); return; }
    setVerifying(true);
    const r = await verifyJwtHs256(token, secret);
    setVerifying(false);
    if (!r.ok) setVerifyResult(`${t('invalid')}: ${r.message}`);
    else setVerifyResult(r.valid ? t('valid') : t('invalid'));
  };

  const ok = decoded?.ok ? decoded : null;

  return (
    <ToolLayout toolId="jwt" content={jwtContent}>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col gap-4">
          <Panel title={t('token_title')}>
            <textarea value={token}
              onChange={(e) => updateToken(e.target.value)}
              rows={5}
              className="w-full p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-xs bg-surface-raised text-content-secondary"
              placeholder={t('placeholder')} />
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => updateToken(EXAMPLE_TOKEN)}>{tc('example')}</Button>
              <Button variant="secondary" onClick={() => updateToken('')}>{tc('clear')}</Button>
            </div>
          </Panel>
          <Panel title={t('verify_title')}>
            <input value={secret} onChange={(e) => setSecret(e.target.value)}
              className="w-full p-2 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action font-mono text-sm bg-surface-raised text-content-secondary"
              placeholder={t('secret_placeholder')} />
            <div className="mt-3 flex items-center gap-3">
              <Button onClick={verify} disabled={!token.trim() || verifying}>
                {verifying ? t('verifying') : t('verify')}
              </Button>
              {verifyResult && (
                <span className={`text-sm font-medium ${verifyResult.startsWith('✅') ? 'text-syntax-string' : 'text-syntax-null'}`}>
                  {verifyResult}
                </span>
              )}
            </div>
          </Panel>
        </div>
        <div className="flex flex-col gap-4 overflow-auto">
          {decoded && !decoded.ok && (
            <div className="bg-danger-surface border border-border-base rounded p-3 text-syntax-null text-sm">{decoded.message}</div>
          )}
          {ok && (
            <>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-content-muted">alg: {ok.decoded.header.alg as string}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-content-muted">typ: {ok.decoded.header.typ as string}</span>
                {ok.decoded.expiry && (
                  <span className={`text-xs px-2 py-0.5 rounded ${ok.decoded.isExpired ? 'bg-danger-surface text-danger-content' : 'bg-surface-hover text-syntax-string'}`}>
                    {ok.decoded.isExpired ? t('expired') : t('not_expired')}: {ok.decoded.expiry}
                  </span>
                )}
              </div>
              {(['header', 'payload'] as const).map((part) => (
                <div key={part} className="bg-surface rounded-lg border border-border-base p-4">
                  <p className="text-xs font-semibold text-content-muted mb-2">{t(part.toUpperCase() as 'header' | 'payload')}</p>
                  <pre className="font-mono text-sm text-content-secondary whitespace-pre-wrap">
                    {stringifyJSONValue(ok.decoded[part], 2)}
                  </pre>
                </div>
              ))}
              <div className="bg-surface rounded-lg border border-border-base p-4">
                <p className="text-xs font-semibold text-content-muted mb-2">{t('signature')}</p>
                <p className="font-mono text-xs text-content-faint break-all">{ok.decoded.signature}</p>
              </div>
            </>
          )}
          {!decoded && (
            <div className="flex-grow border border-border-base rounded bg-surface flex items-center justify-center text-content-faint text-sm">
              {t('empty_output')}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

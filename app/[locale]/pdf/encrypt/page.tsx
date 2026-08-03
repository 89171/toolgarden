'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { decryptPdf, encryptPdf } from '@/lib/utils/pdf-encrypt';
import { pdfEncryptContent } from '@/lib/tools/content/pdf-encrypt';

type Mode = 'encrypt' | 'decrypt';

export default function PdfEncryptPage() {
  const t = useTranslations('tools.pdf-encrypt');
  const [mode, setMode] = useState<Mode>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [permissions, setPermissions] = useState({ printing: true, copying: true, modifying: false, annotating: false });
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!file || !userPassword) return;
    setBusy(true);
    setError('');
    setResultUrl('');
    try {
      const blob = await encryptPdf(file, { userPassword, ownerPassword, permissions });
      if (blob) setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  const handleDecrypt = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setResultUrl('');
    const outcome = await decryptPdf(file, currentPassword);
    if (outcome.ok) setResultUrl(URL.createObjectURL(outcome.blob));
    else setError(t('wrong_password'));
    setBusy(false);
  };

  const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'pdf';
  const downloadName = `${baseName}-${mode === 'encrypt' ? 'encrypted' : 'decrypted'}.pdf`;

  return (
    <ToolLayout toolId="pdf-encrypt" content={pdfEncryptContent}>
      <div className="mb-4 inline-flex overflow-hidden rounded border border-border-input">
        <button
          type="button"
          className={`px-4 py-2 text-sm ${mode === 'encrypt' ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
          onClick={() => { setMode('encrypt'); setResultUrl(''); setError(''); }}
        >
          {t('mode_encrypt')}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm ${mode === 'decrypt' ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
          onClick={() => { setMode('decrypt'); setResultUrl(''); setError(''); }}
        >
          {t('mode_decrypt')}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('upload_title')}</h2>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised p-6 text-center hover:border-border-strong">
            <span className="text-sm text-content-secondary">{t('drop_title')}</span>
            <span className="text-xs text-content-faint">{t('drop_hint')}</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file && <p className="text-xs text-content-muted">{file.name}</p>}

          <h2 className="mt-2 text-lg font-semibold text-content">{t('settings_title')}</h2>
          {mode === 'encrypt' ? (
            <>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('user_password_label')}</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('owner_password_label')}</label>
                <input
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('permissions_label')}</label>
                <div className="mt-2 flex flex-col gap-1.5">
                  {(['printing', 'copying', 'modifying', 'annotating'] as const).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-content-secondary">
                      <input
                        type="checkbox"
                        checked={permissions[key]}
                        onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                      />
                      {t(`permission_${key}`)}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleEncrypt} disabled={!file || !userPassword || busy}>
                {busy ? t('processing') : t('encrypt')}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('current_password_label')}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={handleDecrypt} disabled={!file || busy}>
                {busy ? t('processing') : t('decrypt')}
              </Button>
            </>
          )}
          {error && <p className="text-sm text-danger-content">{error}</p>}
        </section>

        <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
          {resultUrl ? (
            <a
              href={resultUrl}
              download={downloadName}
              className="self-start rounded bg-action px-4 py-2 text-sm text-white hover:opacity-90"
            >
              {downloadName}
            </a>
          ) : (
            <p className="text-sm text-content-faint">{t('empty_state')}</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}

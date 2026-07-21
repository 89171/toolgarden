'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SITE_CONTACT_EMAIL } from '@/lib/site/registry';

type CopyStatus = 'idle' | 'copied' | 'failed';

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

async function copyEmailToClipboard() {
  if (fallbackCopy(SITE_CONTACT_EMAIL)) return true;

  try {
    await navigator.clipboard.writeText(SITE_CONTACT_EMAIL);
    return true;
  } catch {
    return false;
  }
}

export function FeedbackButton() {
  const t = useTranslations('feedback');
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  async function openFeedbackDialog() {
    setIsOpen(true);
    setCopyStatus((await copyEmailToClipboard()) ? 'copied' : 'failed');
  }

  function closeDialog() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label={t('button_aria')}
        className="fixed bottom-4 right-4 z-40 inline-flex h-11 items-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-3 text-sm font-medium text-brand-fg shadow-lg transition-[background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-border-strong hover:bg-brand-bg-hover hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong sm:bottom-6 sm:right-6"
        onClick={openFeedbackDialog}
      >
        <span aria-hidden="true" className="font-mono text-xs font-semibold text-brand-tld">
          @
        </span>
        <span>{t('button')}</span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 px-4 py-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            aria-describedby={dialogDescriptionId}
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="w-full max-w-sm rounded-lg border border-border-base bg-surface-raised p-5 shadow-xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={dialogTitleId} className="text-lg font-semibold text-content">
                  {copyStatus === 'copied' ? t('copied_title') : t('title')}
                </h2>
                <p id={dialogDescriptionId} className="mt-1 text-sm leading-relaxed text-content-muted">
                  {copyStatus === 'failed' ? t('copy_failed') : t('description')}
                </p>
              </div>
              <button
                type="button"
                aria-label={t('close')}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border-subtle bg-surface text-content-muted transition-colors hover:border-border-base hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                onClick={closeDialog}
              >
                <span aria-hidden="true" className="font-mono text-base leading-none">
                  x
                </span>
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-border-base bg-surface p-3">
              <p className="text-xs font-medium uppercase tracking-normal text-content-faint">
                {t('email_label')}
              </p>
              <a
                href={`mailto:${SITE_CONTACT_EMAIL}`}
                className="mt-1 block break-all font-mono text-sm font-semibold text-content-secondary underline-offset-4 hover:text-content hover:underline"
              >
                {SITE_CONTACT_EMAIL}
              </a>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                onClick={openFeedbackDialog}
              >
                {copyStatus === 'copied' ? t('copied') : t('copy_email')}
              </button>
              <button
                type="button"
                className="rounded bg-brand-bg px-4 py-2 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                onClick={closeDialog}
              >
                {t('close_action')}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToolSwitchLinks } from '@/components/ToolSwitchLinks';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  convertMarkdownTextToPdf,
  copyText,
  downloadBlob,
  downloadTextFile,
} from '@/lib/utils/markdown-browser';
import { markdownToHtml } from '@/lib/utils/markdown';

type MarkdownConverterMode = 'pdf' | 'html';
type OutputView = 'preview' | 'code';

interface MarkdownConverterProps {
  mode: MarkdownConverterMode;
}

export function MarkdownConverter({ mode }: MarkdownConverterProps) {
  const locale = useLocale();
  const t = useTranslations('markdown_converter');
  const tc = useTranslations('common');
  const [markdown, setMarkdown] = useState('');
  const [outputView, setOutputView] = useState<OutputView>(mode === 'html' ? 'code' : 'preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const htmlOutcome = useMemo(
    () => markdownToHtml(markdown, {
      fallbackTitle: t('fallback_title'),
      lang: locale === 'zh' ? 'zh-CN' : 'en',
    }),
    [locale, markdown, t]
  );

  const switchLinks = [
    {
      key: 'pdf',
      href: `/${locale}/text/markdown-to-pdf`,
      label: t('to_pdf'),
    },
    {
      key: 'html',
      href: `/${locale}/text/markdown-to-html`,
      label: t('to_html'),
    },
  ];

  function updateMarkdown(value: string) {
    setMarkdown(value);
    setStatusMessage('');
  }

  async function handleCopyHtml() {
    if (!htmlOutcome.ok) return;
    const copied = await copyText(htmlOutcome.document);
    setStatusMessage(copied ? t('copied_html') : t('copy_error'));
  }

  function handleDownloadHtml() {
    if (!htmlOutcome.ok) return;
    downloadTextFile(htmlOutcome.document, `${htmlOutcome.filenameStem}.html`);
    setStatusMessage(t('downloaded_html'));
  }

  async function handleDownloadPdf() {
    if (!htmlOutcome.ok || isGenerating) return;
    setIsGenerating(true);
    setStatusMessage(t('generating_pdf'));

    const outcome = await convertMarkdownTextToPdf(markdown, htmlOutcome.filenameStem);
    if (outcome.ok) {
      downloadBlob(outcome.blob, outcome.filename);
      setStatusMessage(t('downloaded_pdf', { count: outcome.pageCount }));
    } else {
      setStatusMessage(
        outcome.code === 'empty_document' ? t('empty_error') : t('pdf_error')
      );
    }

    setIsGenerating(false);
  }

  const outputActions = mode === 'html' ? (
    <>
      <Button
        type="button"
        variant={outputView === 'preview' ? 'primary' : 'secondary'}
        onClick={() => setOutputView('preview')}
      >
        {t('preview')}
      </Button>
      <Button
        type="button"
        variant={outputView === 'code' ? 'primary' : 'secondary'}
        onClick={() => setOutputView('code')}
      >
        {t('html_code')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={handleCopyHtml}
        disabled={!htmlOutcome.ok}
      >
        {t('copy_html')}
      </Button>
      <Button
        type="button"
        onClick={handleDownloadHtml}
        disabled={!htmlOutcome.ok}
      >
        {t('download_html')}
      </Button>
    </>
  ) : (
    <Button
      type="button"
      size="md"
      onClick={handleDownloadPdf}
      disabled={!htmlOutcome.ok || isGenerating}
    >
      {isGenerating ? t('generating') : t('download_pdf')}
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-grow flex-col">
      <ToolSwitchLinks
        ariaLabel={t('switch_label')}
        currentKey={mode}
        links={switchLinks}
      />

      <div className="mb-4 flex flex-col gap-1 rounded-lg border border-border-subtle bg-surface px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-content-muted">
          {mode === 'pdf' ? t('pdf_local_note') : t('html_local_note')}
        </p>
        {htmlOutcome.ok ? (
          <p className="shrink-0 font-mono text-xs text-content-faint">
            {mode === 'pdf'
              ? `${htmlOutcome.filenameStem}.pdf`
              : `${htmlOutcome.filenameStem}.html`}
          </p>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-grow gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Panel
          title={t('input_title')}
          className="min-h-[30rem] border border-border-base lg:min-h-[38rem]"
          actions={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateMarkdown(t('sample'))}
              >
                {tc('example')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateMarkdown('')}
                disabled={!markdown}
              >
                {tc('clear')}
              </Button>
            </>
          }
        >
          <label htmlFor={`markdown-${mode}`} className="sr-only">
            {t('input_title')}
          </label>
          <textarea
            id={`markdown-${mode}`}
            value={markdown}
            onChange={(event) => updateMarkdown(event.target.value)}
            placeholder={t('placeholder')}
            spellCheck={false}
            className="min-h-0 flex-grow resize-none rounded border border-border-input bg-surface-raised p-4 font-mono text-sm leading-6 text-content-secondary placeholder:text-content-faint focus:outline-none focus:ring-2 focus:ring-action"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-content-faint">
            <span>{t('supports')}</span>
            <span className="shrink-0">{t('characters', { count: Array.from(markdown).length })}</span>
          </div>
        </Panel>

        <Panel
          title={mode === 'html' && outputView === 'code' ? t('code_title') : t('preview_title')}
          className="min-h-[30rem] border border-border-base lg:min-h-[38rem]"
          actions={outputActions}
        >
          {htmlOutcome.ok ? (
            mode === 'html' && outputView === 'code' ? (
              <pre className="min-h-0 flex-grow overflow-auto rounded border border-border-input bg-surface-raised p-4 text-content-secondary">
                <code className="font-mono text-xs leading-6">{htmlOutcome.document}</code>
              </pre>
            ) : (
              <iframe
                title={t('preview_frame_title')}
                srcDoc={htmlOutcome.document}
                sandbox=""
                referrerPolicy="no-referrer"
                className="min-h-[26rem] flex-grow rounded border border-border-input bg-surface-raised"
              />
            )
          ) : (
            <div className="flex min-h-[26rem] flex-grow flex-col items-center justify-center rounded border border-dashed border-border-input bg-surface-raised px-6 text-center">
              <span aria-hidden="true" className="font-mono text-2xl font-semibold text-content-faint">
                {mode === 'pdf' ? 'PDF' : 'HTML'}
              </span>
              <h2 className="mt-4 text-base font-semibold text-content">{t('empty_title')}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-content-muted">
                {t('empty_body')}
              </p>
            </div>
          )}

          <p
            aria-live="polite"
            className={`mt-2 min-h-5 text-xs ${
              statusMessage === t('copy_error') || statusMessage === t('pdf_error')
                ? 'text-danger-content'
                : 'text-content-muted'
            }`}
          >
            {statusMessage}
          </p>
        </Panel>
      </div>
    </div>
  );
}

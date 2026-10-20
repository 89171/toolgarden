'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { FONT_PREVIEW_ACCEPT, validatePreviewFont, type FontPreviewError } from '@/lib/utils/font-preview';
import { fontPreviewContent } from '@/lib/tools/content/font-preview';

export function FontPreviewTool() {
  const t = useTranslations('font_preview');
  const input = useRef<HTMLInputElement>(null);
  const activeFace = useRef<FontFace | null>(null);
  const generation = useRef(0);
  const [family, setFamily] = useState('');
  const [filename, setFilename] = useState('');
  const [text, setText] = useState(() => t('sample'));
  const [size, setSize] = useState(48);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [spacing, setSpacing] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FontPreviewError | null>(null);

  useEffect(() => () => {
    generation.current += 1;
    if (activeFace.current) document.fonts.delete(activeFace.current);
  }, []);

  function releaseFont() {
    if (activeFace.current) document.fonts.delete(activeFace.current);
    activeFace.current = null;
    setFamily('');
    setFilename('');
  }

  async function selectFont(file?: File) {
    if (!file) return;
    const request = ++generation.current;
    releaseFont();
    setError(null);
    setLoading(false);
    const validation = validatePreviewFont(file);
    if (!validation.ok) { setError(validation.code); return; }
    setLoading(true);
    try {
      const name = `preview-${crypto.randomUUID()}`;
      const face = new FontFace(name, await file.arrayBuffer());
      await face.load();
      if (request !== generation.current) return;
      document.fonts.add(face);
      activeFace.current = face;
      setFamily(name);
      setFilename(file.name);
    } catch {
      if (request === generation.current) setError('load');
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }

  function clear() {
    generation.current += 1;
    releaseFont();
    setLoading(false);
    setError(null);
    if (input.current) input.current.value = '';
  }

  const field = 'w-full rounded border border-border-input bg-surface-raised p-3 text-content focus:outline focus:outline-2 focus:outline-border-strong';

  return (
    <ToolLayout toolId="font-preview" content={fontPreviewContent}>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <Panel title={t('settings')} actions={<Button variant="secondary" onClick={clear} disabled={!family && !loading && !error}>{t('clear')}</Button>}>
          <label className="mb-2 text-sm text-content-secondary" htmlFor="preview-font-file">{t('upload')}</label>
          <input ref={input} id="preview-font-file" type="file" accept={FONT_PREVIEW_ACCEPT}
            className={field} onChange={(event) => { void selectFont(event.target.files?.[0]); event.target.value = ''; }} />
          <p className="mt-2 text-xs text-content-muted">{t('formats')}</p>
          <div role="status" aria-live="polite" className="mt-3 break-all text-sm text-content-secondary">
            {loading ? t('loading') : filename ? t('loaded', { name: filename }) : t('no_font')}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-danger-content">{t(`errors.${error}`)}</p>}
          <label htmlFor="preview-text" className="mb-2 mt-6 text-sm text-content-secondary">{t('text')}</label>
          <textarea id="preview-text" value={text} onChange={(event) => setText(event.target.value)} rows={6} className={`${field} min-h-36 resize-y`} placeholder={t('placeholder')} />
          <div className="mt-2"><Button variant="secondary" onClick={() => setText(t('sample'))}>{t('reset_text')}</Button></div>
          <label className="mt-6 text-sm text-content-secondary" htmlFor="preview-size">{t('size', { value: size })}</label>
          <input id="preview-size" type="range" min={12} max={144} value={size} onChange={(event) => setSize(Number(event.target.value))} className="mt-3 w-full" />
          <label className="mt-5 text-sm text-content-secondary" htmlFor="preview-line-height">{t('line_height', { value: lineHeight })}</label>
          <input id="preview-line-height" type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} className="mt-3 w-full" />
          <label className="mt-5 text-sm text-content-secondary" htmlFor="preview-spacing">{t('spacing', { value: spacing })}</label>
          <input id="preview-spacing" type="range" min={-2} max={12} step={0.5} value={spacing} onChange={(event) => setSpacing(Number(event.target.value))} className="mt-3 w-full" />
          <p className="mt-6 text-xs leading-relaxed text-content-muted">{t('privacy')}</p>
        </Panel>
        <Panel title={t('preview')}>
          <p className="mb-4 text-xs text-content-muted">{t('fallback')}</p>
          {family ? (
            <div data-testid="font-preview" dir="auto" className="min-h-80 flex-1 whitespace-pre-wrap break-words rounded border border-border-subtle bg-surface-raised p-5 text-content sm:p-8 [overflow-wrap:anywhere]"
              style={{ fontFamily: `"${family}", sans-serif`, fontSize: size, lineHeight, letterSpacing: spacing, fontSynthesis: 'none' }}>{text}</div>
          ) : (
            <div className="flex min-h-80 flex-1 items-center justify-center rounded border border-border-subtle bg-surface-raised p-8 text-center text-content-muted">{loading ? t('loading') : t('empty_preview')}</div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}

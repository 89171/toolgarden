'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import {
  createMindMapHtmlSnapshot,
  createMindMapData,
  createMindMapNode,
  jsonToMindElixirData,
  markdownToMindElixirData,
  mindElixirDataToMarkdown,
  mindElixirDataToJson,
} from '@/lib/utils/mind-map';
import type { MindElixirData, MindElixirInstance, Theme, Topic } from 'mind-elixir';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

function downloadTextFile(content: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}

const toolGardenMindMapTheme: Theme = {
  name: 'ToolGarden',
  palette: [
    '#2563eb',
    '#2563eb',
    '#2563eb',
    '#2563eb',
    '#2563eb',
    '#2563eb',
  ],
  cssVar: {
    '--bgcolor': '#ffffff',
    '--color': '#475569',
    '--main-bgcolor': '#ffffff',
    '--main-bgcolor-transparent': 'rgba(255, 255, 255, 0.92)',
    '--main-color': '#334155',
    '--main-border': '1px solid #cbd5e1',
    '--root-bgcolor': '#2563eb',
    '--root-color': '#ffffff',
    '--root-border-color': '#2563eb',
    '--selected': '#2563eb',
    '--accent-color': '#2563eb',
    '--panel-bgcolor': '#ffffff',
    '--panel-color': '#0f172a',
    '--panel-border-color': '#cbd5e1',
    '--root-radius': '8px',
    '--main-radius': '8px',
    '--topic-padding': '5px 10px',
    '--map-padding': '48px 64px',
  },
};

type LinkMode = 'one-way' | 'two-way';
type MindMapLayout = 'left' | 'side' | 'right';

type EditorSnapshot = {
  markdown: string;
  selectedTopic: string;
  selectedCount: number;
  canDelete: boolean;
  canFocus: boolean;
  canCreateSummary: boolean;
  isFocusMode: boolean;
  scale: number;
  layout: MindMapLayout;
};

type CanvasPanState = {
  pointerId: number;
  lastX: number;
  lastY: number;
};

function getLayoutFromDirection(direction: number): MindMapLayout {
  if (direction === 0) return 'left';
  if (direction === 1) return 'right';
  return 'side';
}

function getSelectedTopics(mind: MindElixirInstance): Topic[] {
  if (mind.currentNodes.length > 0) return mind.currentNodes;
  return mind.currentNode ? [mind.currentNode] : [];
}

function getRootTopic(mind: MindElixirInstance): Topic | undefined {
  try {
    return mind.findEle(mind.nodeData.id, mind.map);
  } catch {
    return undefined;
  }
}

function getActionTarget(mind: MindElixirInstance): Topic | undefined {
  if (mind.currentNode) return mind.currentNode;
  return getRootTopic(mind);
}

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  if (target.closest('input, textarea, select')) return true;

  const editableElement = target.closest('[contenteditable]');
  const contentEditable = editableElement?.getAttribute('contenteditable')?.toLowerCase();
  return Boolean(contentEditable && contentEditable !== 'false');
}

function getTopicFromEventTarget(target: EventTarget | null): Topic | undefined {
  if (!(target instanceof Element)) return undefined;
  return target.closest<Topic>('me-tpc') ?? undefined;
}

function isCanvasPanTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (getTopicFromEventTarget(target)) return false;

  return !target.closest('#input-box, .context-menu, .svg-label, .topiclinks, .summary, .circle, me-epd, button, input, textarea, select');
}

function focusMindContainer(mind: MindElixirInstance) {
  window.setTimeout(() => {
    if (mind.container.querySelector('#input-box')) return;
    mind.container.tabIndex = 0;
    mind.container.focus({ preventScroll: true });
  }, 0);
}

function focusLatestTopicEditor(mind: MindElixirInstance) {
  window.setTimeout(() => {
    const editor = mind.container.querySelector<HTMLElement>('#input-box');
    if (!editor) return;

    editor.focus({ preventScroll: true });
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, 0);
}

function finishActiveTopicEditor(mind: MindElixirInstance, options?: { restoreOriginal?: boolean }) {
  const editor = mind.container.querySelector<HTMLElement>('#input-box');
  if (!editor) return false;

  const topic = mind.currentNode ?? getSelectedTopics(mind).find((selectedTopic) => selectedTopic.style.opacity === '0');
  const origin = topic?.nodeObj.topic ?? '';
  const typedTopic = (editor.innerText || editor.textContent || '').trim();
  const nextTopic = options?.restoreOriginal ? origin : typedTopic;

  if (topic) topic.style.opacity = '1';
  editor.textContent = nextTopic || origin;
  editor.blur();
  if (editor.isConnected) editor.remove();

  if (topic && nextTopic && nextTopic !== origin && topic.nodeObj.topic !== nextTopic) {
    topic.nodeObj.topic = nextTopic;
    topic.text.textContent = nextTopic;
    mind.linkDiv();
    mind.bus.fire('operation', {
      name: 'finishEdit',
      obj: topic.nodeObj,
      origin,
    });
  }

  focusMindContainer(mind);
  return true;
}

async function addChildToMind(mind: MindElixirInstance, topicName: string) {
  await mind.addChild(getActionTarget(mind), createMindMapNode(topicName));
  await mind.beginEdit();
  focusLatestTopicEditor(mind);
}

async function addSiblingToMind(mind: MindElixirInstance, topicName: string) {
  const target = getActionTarget(mind);
  if (!target || target.nodeObj.id === mind.nodeData.id) {
    await mind.addChild(target, createMindMapNode(topicName));
  } else {
    await mind.insertSibling('after', target, createMindMapNode(topicName));
  }
  await mind.beginEdit();
  focusLatestTopicEditor(mind);
}

async function editTopicInMind(mind: MindElixirInstance) {
  await mind.beginEdit(getActionTarget(mind));
  focusLatestTopicEditor(mind);
}

async function removeSelectedTopics(mind: MindElixirInstance) {
  const rootId = mind.nodeData.id;
  const removableTopics = getSelectedTopics(mind).filter((topic) => topic.nodeObj.id !== rootId);
  if (removableTopics.length === 0) return;
  await mind.removeNodes(removableTopics);
}

function createSnapshot(mind: MindElixirInstance): EditorSnapshot {
  const selectedTopics = getSelectedTopics(mind);
  const selectedTopic = mind.currentNode?.nodeObj.topic ?? '';
  const rootId = mind.nodeData.id;
  const hasSelectedNonRootTopic = selectedTopics.some((topic) => topic.nodeObj.id !== rootId);

  return {
    markdown: mindElixirDataToMarkdown(mind.getData()),
    selectedTopic,
    selectedCount: selectedTopics.length,
    canDelete: hasSelectedNonRootTopic,
    canFocus: Boolean(mind.currentNode && mind.currentNode.nodeObj.id !== rootId),
    canCreateSummary: hasSelectedNonRootTopic,
    isFocusMode: Boolean(mind.isFocusMode),
    scale: Math.round(mind.scaleVal * 100),
    layout: getLayoutFromDirection(mind.tempDirection ?? mind.direction),
  };
}

export function MindMapTool() {
  const t = useTranslations('mind_map_tool');
  const locale = useLocale();
  const sampleMarkdown = t('sample_markdown');
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mindRef = useRef<MindElixirInstance | null>(null);
  const importJsonInputRef = useRef<HTMLInputElement | null>(null);
  const outlineOpenRef = useRef(false);
  const latestMarkdownRef = useRef(sampleMarkdown);
  const linkModeRef = useRef<LinkMode | null>(null);
  const linkSourceRef = useRef<Topic | null>(null);

  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [outlineDraft, setOutlineDraft] = useState(sampleMarkdown);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [canDelete, setCanDelete] = useState(false);
  const [canFocus, setCanFocus] = useState(false);
  const [canCreateSummary, setCanCreateSummary] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [scale, setScale] = useState(100);
  const [error, setError] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenFallback, setIsFullscreenFallback] = useState(false);
  const [layout, setLayout] = useState<MindMapLayout>('side');

  useEffect(() => {
    latestMarkdownRef.current = markdown;
  }, [markdown]);

  useEffect(() => {
    outlineOpenRef.current = isOutlineOpen;
  }, [isOutlineOpen]);

  useEffect(() => {
    const syncFullscreenState = () => {
      const isActive = document.fullscreenElement === fullscreenRef.current;
      setIsFullscreen(isActive);
      if (isActive) setIsFullscreenFallback(false);
      window.setTimeout(() => mindRef.current?.scaleFit(), 0);
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    if (!isFullscreenFallback) return;

    const previousOverflow = document.body.style.overflow;
    const exitFallbackOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      setIsFullscreenFallback(false);
      window.setTimeout(() => mindRef.current?.scaleFit(), 0);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', exitFallbackOnEscape);
    window.setTimeout(() => mindRef.current?.scaleFit(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', exitFallbackOnEscape);
      window.setTimeout(() => mindRef.current?.scaleFit(), 0);
    };
  }, [isFullscreenFallback]);

  const syncSnapshot = useCallback((options?: { syncDraft?: boolean }) => {
    const mind = mindRef.current;
    if (!mind) return;

    const snapshot = createSnapshot(mind);
    latestMarkdownRef.current = snapshot.markdown;
    setMarkdown(snapshot.markdown);
    setSelectedTopic(snapshot.selectedTopic);
    setSelectedCount(snapshot.selectedCount);
    setCanDelete(snapshot.canDelete);
    setCanFocus(snapshot.canFocus);
    setCanCreateSummary(snapshot.canCreateSummary);
    setIsFocusMode(snapshot.isFocusMode);
    setScale(snapshot.scale);
    setLayout(snapshot.layout);

    if (options?.syncDraft || !outlineOpenRef.current) {
      setOutlineDraft(snapshot.markdown);
    }
  }, []);

  const refreshMap = useCallback((data: MindElixirData, options?: { syncDraft?: boolean }) => {
    const mind = mindRef.current;
    if (!mind) return;

    setError('');
    setIsRendering(true);
    linkModeRef.current = null;
    linkSourceRef.current = null;
    setIsLinking(false);
    try {
      mind.refresh(data);
      mind.clearHistory?.();
      window.setTimeout(() => {
        mind.scaleFit();
        const rootTopic = getRootTopic(mind);
        if (rootTopic) mind.selectNode(rootTopic);
        focusMindContainer(mind);
        syncSnapshot(options);
      }, 0);
    } catch (renderError) {
      setError(renderError instanceof Error ? renderError.message : t('render_error'));
    } finally {
      setIsRendering(false);
    }
  }, [syncSnapshot, t]);

  const runMapAction = useCallback(async (
    action: (mind: MindElixirInstance) => Promise<void> | void,
    options?: { refocus?: boolean },
  ) => {
    const mind = mindRef.current;
    if (!mind || !isReady) return;

    setError('');
    try {
      await action(mind);
      window.setTimeout(() => {
        syncSnapshot();
        if (options?.refocus !== false) focusMindContainer(mind);
      }, 0);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : t('render_error'));
    }
  }, [isReady, syncSnapshot, t]);

  useEffect(() => {
    let disposed = false;
    let removeListeners: Array<() => void> = [];
    let resizeObserver: ResizeObserver | undefined;
    let canvasPanState: CanvasPanState | null = null;

    const initMindMap = async () => {
      const host = mapHostRef.current;
      if (!host) return;

      setIsReady(false);
      setIsRendering(true);
      setError('');

      try {
        const [{ default: MindElixir }, i18n] = await Promise.all([
          import('mind-elixir'),
          import('mind-elixir/i18n'),
        ]);
        if (disposed) return;

        const outcome = markdownToMindElixirData(latestMarkdownRef.current, t('default_root'));
        if (!outcome.ok) {
          setError(outcome.message);
          return;
        }

        const mind = new MindElixir({
          el: host,
          direction: MindElixir.SIDE,
          editable: true,
          contextMenu: {
            locale: locale === 'zh' ? i18n.zh_CN : i18n.en,
            focus: true,
            link: true,
          },
          toolBar: false,
          keypress: true,
          mouseSelectionButton: 0,
          overflowHidden: true,
          alignment: 'nodes',
          theme: toolGardenMindMapTheme,
          newTopicName: t('new_topic'),
        });

        mind.init(outcome.data);
        mind.container.tabIndex = 0;
        mind.container.setAttribute('aria-label', t('canvas_label'));
        mind.scaleFit();
        mind.clearHistory?.();
        mindRef.current = mind;

        const rootTopic = getActionTarget(mind);
        if (rootTopic) mind.selectNode(rootTopic);
        focusMindContainer(mind);

        const syncSoon = () => window.setTimeout(() => syncSnapshot(), 0);
        const syncOperationSoon = (operation?: { name?: string }) => {
          if (operation?.name === 'beginEdit') focusLatestTopicEditor(mind);
          window.setTimeout(() => syncSnapshot(), 0);
        };
        const syncDraftSoon = () => window.setTimeout(() => syncSnapshot({ syncDraft: true }), 0);
        const syncScale = () => setScale(Math.round(mind.scaleVal * 100));
        const focusAfterPointerDown = (event: PointerEvent) => {
          if (disposed || isEditableShortcutTarget(event.target)) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          focusMindContainer(mind);
        };
        const startCanvasPan = (event: PointerEvent) => {
          if (disposed || isEditableShortcutTarget(event.target) || !isCanvasPanTarget(event.target)) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;

          canvasPanState = {
            pointerId: event.pointerId,
            lastX: event.clientX,
            lastY: event.clientY,
          };
          mind.container.style.cursor = 'grabbing';
          mind.container.setPointerCapture?.(event.pointerId);
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };
        const moveCanvasPan = (event: PointerEvent) => {
          if (!canvasPanState || canvasPanState.pointerId !== event.pointerId) return;

          const dx = event.clientX - canvasPanState.lastX;
          const dy = event.clientY - canvasPanState.lastY;
          canvasPanState = {
            pointerId: event.pointerId,
            lastX: event.clientX,
            lastY: event.clientY,
          };

          if (dx !== 0 || dy !== 0) {
            mind.move(dx, dy);
          }

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };
        const stopCanvasPan = (event: PointerEvent) => {
          if (!canvasPanState || canvasPanState.pointerId !== event.pointerId) return;

          canvasPanState = null;
          mind.container.style.cursor = '';
          if (mind.container.hasPointerCapture?.(event.pointerId)) {
            mind.container.releasePointerCapture(event.pointerId);
          }
          focusMindContainer(mind);
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };
        const selectTopicAfterClick = (event: MouseEvent) => {
          if (disposed || linkModeRef.current || isEditableShortcutTarget(event.target)) return;

          const topic = getTopicFromEventTarget(event.target);
          if (!topic || !mind.container.contains(topic)) return;

          if (!topic.classList.contains('selected')) {
            mind.selectNode(topic);
          }
          focusMindContainer(mind);
          window.setTimeout(() => syncSnapshot(), 0);
        };
        const editTopicAfterDoubleClick = (event: MouseEvent) => {
          if (disposed || isEditableShortcutTarget(event.target)) return;

          const topic = getTopicFromEventTarget(event.target);
          if (!topic || !mind.container.contains(topic)) return;
          event.preventDefault();

          if (mind.container.querySelector('#input-box')) {
            focusLatestTopicEditor(mind);
            return;
          }

          void (async () => {
            try {
              if (!topic.classList.contains('selected')) {
                mind.selectNode(topic);
              }
              await mind.beginEdit(topic);
              focusLatestTopicEditor(mind);
              window.setTimeout(() => syncSnapshot(), 0);
            } catch (editError) {
              setError(editError instanceof Error ? editError.message : t('render_error'));
            }
          })();
        };
        const createLinkToClickedTopic = (event: MouseEvent) => {
          const linkMode = linkModeRef.current;
          const sourceTopic = linkSourceRef.current;
          if (!linkMode || !sourceTopic || disposed || isEditableShortcutTarget(event.target)) return;

          const targetTopic = getTopicFromEventTarget(event.target);
          if (!targetTopic || !mind.container.contains(targetTopic)) return;

          event.preventDefault();
          event.stopPropagation();

          if (targetTopic.nodeObj.id !== sourceTopic.nodeObj.id) {
            try {
              mind.createArrow(sourceTopic, targetTopic, linkMode === 'two-way' ? { bidirectional: true } : undefined);
              window.setTimeout(() => syncSnapshot(), 0);
            } catch (linkError) {
              setError(linkError instanceof Error ? linkError.message : t('render_error'));
            }
          }

          linkModeRef.current = null;
          linkSourceRef.current = null;
          setIsLinking(false);
          focusMindContainer(mind);
        };
        const commitEditorBeforeGlobalShortcut = (event: KeyboardEvent) => {
          const shouldCommit = (event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey;
          const shouldCancel = event.key === 'Escape';
          if (!shouldCommit && !shouldCancel) return;

          const didCommit = finishActiveTopicEditor(mind, { restoreOriginal: shouldCancel });
          if (!didCommit) return;

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          window.setTimeout(() => syncSnapshot({ syncDraft: true }), 0);
        };

        mind.bus.addListener('operation', syncOperationSoon);
        mind.bus.addListener('selectNewNode', syncDraftSoon);
        mind.bus.addListener('selectNodes', syncSoon);
        mind.bus.addListener('unselectNodes', syncSoon);
        mind.bus.addListener('scale', syncScale);
        mind.container.addEventListener('pointerdown', startCanvasPan, true);
        mind.container.addEventListener('pointermove', moveCanvasPan, true);
        mind.container.addEventListener('pointerup', stopCanvasPan, true);
        mind.container.addEventListener('pointercancel', stopCanvasPan, true);
        mind.container.addEventListener('keydown', commitEditorBeforeGlobalShortcut, true);
        mind.container.addEventListener('click', selectTopicAfterClick);
        mind.container.addEventListener('dblclick', editTopicAfterDoubleClick);
        mind.container.addEventListener('click', createLinkToClickedTopic, true);
        host.addEventListener('pointerdown', focusAfterPointerDown);
        removeListeners = [
          () => mind.bus.removeListener('operation', syncOperationSoon),
          () => mind.bus.removeListener('selectNewNode', syncDraftSoon),
          () => mind.bus.removeListener('selectNodes', syncSoon),
          () => mind.bus.removeListener('unselectNodes', syncSoon),
          () => mind.bus.removeListener('scale', syncScale),
          () => mind.container.removeEventListener('pointerdown', startCanvasPan, true),
          () => mind.container.removeEventListener('pointermove', moveCanvasPan, true),
          () => mind.container.removeEventListener('pointerup', stopCanvasPan, true),
          () => mind.container.removeEventListener('pointercancel', stopCanvasPan, true),
          () => mind.container.removeEventListener('keydown', commitEditorBeforeGlobalShortcut, true),
          () => mind.container.removeEventListener('click', selectTopicAfterClick),
          () => mind.container.removeEventListener('dblclick', editTopicAfterDoubleClick),
          () => mind.container.removeEventListener('click', createLinkToClickedTopic, true),
          () => host.removeEventListener('pointerdown', focusAfterPointerDown),
        ];

        resizeObserver = new ResizeObserver(() => {
          window.setTimeout(() => mind.scaleFit(), 0);
        });
        resizeObserver.observe(host);

        setIsReady(true);
        syncSnapshot({ syncDraft: true });
      } catch (renderError) {
        if (!disposed) {
          setError(renderError instanceof Error ? renderError.message : t('render_error'));
        }
      } finally {
        if (!disposed) setIsRendering(false);
      }
    };

    void initMindMap();

    return () => {
      disposed = true;
      canvasPanState = null;
      linkModeRef.current = null;
      linkSourceRef.current = null;
      if (mindRef.current?.container) {
        mindRef.current.container.style.cursor = '';
      }
      removeListeners.forEach((removeListener) => removeListener());
      resizeObserver?.disconnect();
      mindRef.current?.destroy();
      mindRef.current = null;
    };
  }, [locale, syncSnapshot, t]);

  const createBlankMap = () => {
    refreshMap(createMindMapData(t('default_root')), { syncDraft: true });
  };

  const resetSample = () => {
    const outcome = markdownToMindElixirData(sampleMarkdown, t('default_root'));
    if (!outcome.ok) {
      setError(outcome.message);
      return;
    }
    refreshMap(outcome.data, { syncDraft: true });
  };

  const addChildTopic = () => void runMapAction(async (mind) => {
    await addChildToMind(mind, t('new_topic'));
  }, { refocus: false });

  const addSiblingTopic = () => void runMapAction(async (mind) => {
    await addSiblingToMind(mind, t('new_topic'));
  }, { refocus: false });

  const editSelectedTopic = () => void runMapAction(async (mind) => {
    await editTopicInMind(mind);
  }, { refocus: false });

  const deleteSelectedTopics = () => void runMapAction(async (mind) => {
    await removeSelectedTopics(mind);
  });

  const undo = () => void runMapAction((mind) => {
    mind.undo();
  });

  const redo = () => void runMapAction((mind) => {
    mind.redo();
  });

  const fitMap = () => void runMapAction((mind) => {
    mind.scaleFit();
  });

  const changeLayout = (nextLayout: MindMapLayout) => void runMapAction((mind) => {
    if (nextLayout === 'left') {
      mind.initLeft();
    } else if (nextLayout === 'right') {
      mind.initRight();
    } else {
      mind.initSide();
    }
    setLayout(nextLayout);
    window.setTimeout(() => mind.scaleFit(), 0);
  });

  const toggleFullscreen = () => {
    const fullscreenElement = fullscreenRef.current;
    if (!fullscreenElement) return;

    void (async () => {
      try {
        if (document.fullscreenElement === fullscreenElement) {
          await document.exitFullscreen();
          return;
        }
        if (isFullscreenFallback) {
          setIsFullscreenFallback(false);
          window.setTimeout(() => mindRef.current?.scaleFit(), 0);
          return;
        }
        await fullscreenElement.requestFullscreen();
      } catch {
        setIsFullscreenFallback(true);
      }
    })();
  };

  const isFullscreenActive = isFullscreen || isFullscreenFallback;

  const focusSelectedTopic = () => void runMapAction((mind) => {
    const target = getActionTarget(mind);
    if (!target || target.nodeObj.id === mind.nodeData.id) return;
    mind.focusNode(target);
  });

  const exitFocusMode = () => void runMapAction((mind) => {
    mind.cancelFocus();
    window.setTimeout(() => {
      const rootTopic = getRootTopic(mind);
      if (rootTopic) mind.selectNode(rootTopic);
    }, 0);
  });

  const createSummaryForSelection = () => void runMapAction((mind) => {
    mind.createSummary();
  }, { refocus: false });

  const startLinkMode = (mode: LinkMode) => {
    const mind = mindRef.current;
    if (!mind || !isReady) return;

    const sourceTopic = getActionTarget(mind);
    if (!sourceTopic) return;

    linkModeRef.current = mode;
    linkSourceRef.current = sourceTopic;
    setIsLinking(true);
    setError('');
    focusMindContainer(mind);
  };

  const cancelLinkMode = () => {
    linkModeRef.current = null;
    linkSourceRef.current = null;
    setIsLinking(false);
    const mind = mindRef.current;
    if (mind) focusMindContainer(mind);
  };

  const toggleOutline = () => {
    setIsOutlineOpen((isOpen) => {
      const nextIsOpen = !isOpen;
      if (nextIsOpen) {
        setOutlineDraft(latestMarkdownRef.current);
      }
      return nextIsOpen;
    });
  };

  const importMarkdown = () => {
    const outcome = markdownToMindElixirData(outlineDraft, t('default_root'));
    if (!outcome.ok) {
      setError(outcome.message);
      return;
    }
    refreshMap(outcome.data, { syncDraft: true });
  };

  const importJsonFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const outcome = jsonToMindElixirData(text);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      refreshMap(outcome.data, { syncDraft: true });
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : t('import_error'));
    }
  };

  const exportMarkdown = () => {
    const currentData: MindElixirData | null = mindRef.current?.getData() ?? null;
    const output = currentData
      ? mindElixirDataToMarkdown(currentData)
      : latestMarkdownRef.current.trimEnd() + '\n';
    latestMarkdownRef.current = output;
    setMarkdown(output);
    setOutlineDraft(output);
    downloadTextFile(output, 'toolgarden-mind-map.md', 'text/markdown;charset=utf-8');
  };

  const exportNativeJson = () => {
    const currentData: MindElixirData | null = mindRef.current?.getData() ?? null;
    if (!currentData) return;

    const outcome = mindElixirDataToJson(currentData);
    if (!outcome.ok) {
      setError(outcome.message);
      return;
    }

    downloadTextFile(outcome.output, 'toolgarden-mind-map.json', 'application/json;charset=utf-8');
  };

  const exportSvg = () => void runMapAction((mind) => {
    const blob = mind.exportSvg(true);
    downloadBlob(blob, 'toolgarden-mind-map.svg');
  });

  const exportPng = () => void runMapAction(async (mind) => {
    const blob = await mind.exportPng(true);
    if (!blob) {
      setError(t('export_error'));
      return;
    }
    downloadBlob(blob, 'toolgarden-mind-map.png');
  });

  const exportHtml = () => void runMapAction(async (mind) => {
    const svgMarkup = await mind.exportSvg(true).text();
    const outline = mindElixirDataToMarkdown(mind.getData());
    const html = createMindMapHtmlSnapshot(t('preview_title'), svgMarkup, outline);
    downloadTextFile(html, 'toolgarden-mind-map.html', 'text/html;charset=utf-8');
  });

  return (
    <ToolLayout toolId="mind-map">
      <div
        ref={fullscreenRef}
        className={`flex min-h-0 flex-1 flex-col gap-3 bg-background ${isFullscreenActive ? 'fixed inset-0 z-50 h-screen overflow-hidden p-3' : ''}`}
      >
        <input
          ref={importJsonInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => void importJsonFile(event)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-base bg-surface p-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={createBlankMap} disabled={!isReady} title={t('new_map')}>
              {t('new_map')}
            </Button>
            <Button type="button" variant="secondary" onClick={resetSample} disabled={!isReady} title={t('reset_sample')}>
              {t('reset_sample')}
            </Button>
            <span className="mx-1 hidden h-7 w-px bg-border-base sm:inline-flex" />
            <Button type="button" onClick={addChildTopic} disabled={!isReady} title={t('add_child')}>
              {t('add_child')}
            </Button>
            <Button type="button" variant="secondary" onClick={addSiblingTopic} disabled={!isReady} title={t('add_sibling')}>
              {t('add_sibling')}
            </Button>
            <Button type="button" variant="secondary" onClick={editSelectedTopic} disabled={!isReady} title={t('edit_node')}>
              {t('edit_node')}
            </Button>
            <Button type="button" variant="danger" onClick={deleteSelectedTopics} disabled={!isReady || !canDelete} title={t('delete_node')}>
              {t('delete_node')}
            </Button>
            <Button type="button" variant="secondary" onClick={createSummaryForSelection} disabled={!isReady || !canCreateSummary} title={t('create_summary')}>
              {t('create_summary')}
            </Button>
            <Button type="button" variant="secondary" onClick={focusSelectedTopic} disabled={!isReady || !canFocus} title={t('focus_node')}>
              {t('focus_node')}
            </Button>
            <Button type="button" variant="secondary" onClick={exitFocusMode} disabled={!isReady || !isFocusMode} title={t('exit_focus')}>
              {t('exit_focus')}
            </Button>
            <Button type="button" variant={isLinking ? 'primary' : 'secondary'} onClick={() => startLinkMode('one-way')} disabled={!isReady || selectedCount === 0} title={t('link_node')}>
              {t('link_node')}
            </Button>
            <Button type="button" variant={isLinking ? 'primary' : 'secondary'} onClick={() => startLinkMode('two-way')} disabled={!isReady || selectedCount === 0} title={t('link_bidirectional')}>
              {t('link_bidirectional')}
            </Button>
            {isLinking && (
              <Button type="button" variant="secondary" onClick={cancelLinkMode} title={t('cancel_link')}>
                {t('cancel_link')}
              </Button>
            )}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={undo} disabled={!isReady} title={t('undo')}>
              {t('undo')}
            </Button>
            <Button type="button" variant="secondary" onClick={redo} disabled={!isReady} title={t('redo')}>
              {t('redo')}
            </Button>
            <Button type="button" variant="secondary" onClick={fitMap} disabled={!isReady} title={t('fit')}>
              {t('fit')}
            </Button>
            <div className="flex items-center gap-1" aria-label={t('layout_group')}>
              <Button type="button" variant={layout === 'left' ? 'primary' : 'secondary'} onClick={() => changeLayout('left')} disabled={!isReady || isFocusMode} title={t('layout_left')}>
                {t('layout_left')}
              </Button>
              <Button type="button" variant={layout === 'side' ? 'primary' : 'secondary'} onClick={() => changeLayout('side')} disabled={!isReady || isFocusMode} title={t('layout_side')}>
                {t('layout_side')}
              </Button>
              <Button type="button" variant={layout === 'right' ? 'primary' : 'secondary'} onClick={() => changeLayout('right')} disabled={!isReady || isFocusMode} title={t('layout_right')}>
                {t('layout_right')}
              </Button>
            </div>
            <Button type="button" variant="secondary" onClick={toggleFullscreen} disabled={!isReady} title={isFullscreenActive ? t('exit_fullscreen') : t('fullscreen')}>
              {isFullscreenActive ? t('exit_fullscreen') : t('fullscreen')}
            </Button>
            <Button type="button" variant="secondary" onClick={toggleOutline} disabled={!isReady} title={isOutlineOpen ? t('hide_markdown') : t('show_markdown')}>
              {isOutlineOpen ? t('hide_markdown') : t('show_markdown')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => importJsonInputRef.current?.click()} disabled={!isReady} title={t('import_json')}>
              {t('import_json')}
            </Button>
            <Button type="button" variant="secondary" onClick={exportNativeJson} disabled={!isReady} title={t('export_json')}>
              {t('export_json')}
            </Button>
            <Button type="button" variant="secondary" onClick={exportSvg} disabled={!isReady} title={t('export_svg')}>
              {t('export_svg')}
            </Button>
            <Button type="button" variant="secondary" onClick={exportPng} disabled={!isReady} title={t('export_png')}>
              {t('export_png')}
            </Button>
            <Button type="button" variant="secondary" onClick={exportHtml} disabled={!isReady} title={t('export_html')}>
              {t('export_html')}
            </Button>
            <Button type="button" onClick={exportMarkdown} disabled={!isReady} title={t('export_markdown')}>
              {t('export_markdown')}
            </Button>
          </div>
        </div>

        <div className={`grid min-h-0 flex-1 gap-3 ${isOutlineOpen ? 'xl:grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-1'}`}>
          <section className="relative flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-lg border border-border-base bg-surface-raised shadow-sm">
            <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border-subtle bg-surface px-3 py-2 text-sm">
              <div className="min-w-0 truncate text-content-secondary">
                {isLinking
                  ? t('link_hint')
                  : selectedTopic
                  ? t('selected_topic', { topic: selectedTopic, count: selectedCount })
                  : t('no_selection')}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-content-faint">
                <span className="hidden md:inline">{t('keyboard_hint')}</span>
                <span>{scale}%</span>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
              <div ref={mapHostRef} className="h-full min-h-[560px] w-full" aria-label={t('canvas_label')} />
              {isRendering && (
                <div className="absolute right-3 top-3 rounded border border-border-subtle bg-surface px-2 py-1 text-xs text-content-muted shadow-sm">
                  {t('rendering')}
                </div>
              )}
              {error && (
                <div className="absolute inset-x-3 bottom-3 rounded border border-border-base bg-surface px-3 py-2 text-sm text-content-secondary shadow-sm">
                  {t('render_error')} {error}
                </div>
              )}
            </div>
          </section>

          {isOutlineOpen && (
            <aside className="flex min-h-[360px] min-w-0 flex-col rounded-lg border border-border-base bg-surface p-3 shadow-sm xl:min-h-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content">{t('markdown_title')}</h2>
                <Button type="button" variant="secondary" onClick={importMarkdown} disabled={!isReady}>
                  {t('import_markdown')}
                </Button>
              </div>
              <textarea
                value={outlineDraft}
                onChange={(event) => setOutlineDraft(event.target.value)}
                placeholder={t('placeholder')}
                spellCheck={false}
                className="min-h-80 flex-1 resize-none rounded-md border border-border-input bg-surface-raised p-3 font-mono text-sm leading-6 text-content outline-none transition-colors placeholder:text-content-faint focus:border-border-strong"
              />
            </aside>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

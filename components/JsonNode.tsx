'use client';
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { stringifyJSONValue, type JSONPathSegment } from '@/lib/utils/json';

interface JsonNodeProps {
  data: unknown;
  keyName?: string;
  path?: JSONPathSegment[];
  level: number;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onDelete?: (path: JSONPathSegment[]) => void;
  allExpanded?: boolean;
  actionLabels?: {
    copy: string;
    delete: string;
    download: string;
  };
}

function getTypeColor(value: unknown): string {
  if (value === null) return 'text-syntax-null';
  if (typeof value === 'string') return 'text-syntax-string';
  if (typeof value === 'number') return 'text-syntax-number';
  if (typeof value === 'boolean') return 'text-syntax-boolean';
  return 'text-syntax-key';
}

function renderPrimitive(value: unknown): React.ReactNode {
  if (value === null) return <span className="text-syntax-null">null</span>;
  if (typeof value === 'string') return <span className="text-syntax-string">&quot;{value}&quot;</span>;
  if (typeof value === 'number' || typeof value === 'boolean')
    return <span className={getTypeColor(value)}>{String(value)}</span>;
  return null;
}

export const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  keyName,
  path = [],
  level,
  expanded,
  setExpanded,
  onDelete,
  allExpanded = true,
  actionLabels = {
    copy: 'Copy',
    delete: 'Delete',
    download: 'Download',
  },
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);
  const nodeId = path.length > 0 ? JSON.stringify(path) : 'root';
  const isExpanded = expanded[nodeId] ?? allExpanded;
  const canDelete = Boolean(onDelete && path.length > 0);

  const toggleExpand = () =>
    setExpanded((prev) => ({ ...prev, [nodeId]: !isExpanded }));

  const copyNode = async () => {
    try {
      await navigator.clipboard.writeText(stringifyJSONValue(data, 2));
    } catch (e) {
      console.error('复制失败:', e);
    }
  };

  const downloadNode = async () => {
    const blob = new Blob([stringifyJSONValue(data, 2)], { type: 'application/json' });
    const { saveAs } = await import('file-saver');
    saveAs(blob, keyName ? `${keyName}.json` : 'node.json');
  };

  return (
    <div
      className={`font-mono text-sm rounded focus:outline-none focus:ring-1 focus:ring-action ${isHovered ? 'bg-surface-hover' : ''}`}
      tabIndex={isObject ? 0 : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={(event) => {
        if (event.currentTarget === event.target) setIsHovered(true);
      }}
      onBlur={(event) => {
        const nextFocused = event.relatedTarget;
        if (!(nextFocused instanceof Node) || !event.currentTarget.contains(nextFocused)) {
          setIsHovered(false);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isObject ? (
            <>
              <button
                onClick={toggleExpand}
                className="w-6 h-6 inline-flex items-center justify-center text-content-muted hover:text-content focus:outline-none mr-1"
              >
                <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
              </button>
              {keyName !== undefined && <span className="text-syntax-key">&quot;{keyName}&quot;: </span>}
              <span className="text-syntax-key">{isArray ? '[' : '{'}</span>
              {!isExpanded && (
                <>
                  <span className="text-content-muted mx-1">....</span>
                  <span className="text-syntax-key">{isArray ? ']' : '}'}</span>
                  <span className="text-syntax-comment text-xs ml-1">
                    {`// ${isArray ? (data as unknown[]).length : Object.keys(data as object).length} items`}
                  </span>
                </>
              )}
            </>
          ) : (
            <>
              <div className="w-6 h-6 mr-1" />
              {keyName !== undefined && <span className="text-syntax-key">&quot;{keyName}&quot;: </span>}
              {renderPrimitive(data)}
            </>
          )}
        </div>

        {isHovered && isObject && (
          <div className="flex space-x-1 ml-2">
            <Button variant="secondary" onClick={copyNode} title={actionLabels.copy}>
              {actionLabels.copy}
            </Button>
            {canDelete && (
              <Button variant="danger" onClick={() => onDelete?.(path)} title={actionLabels.delete}>
                {actionLabels.delete}
              </Button>
            )}
            <Button variant="secondary" onClick={downloadNode} title={actionLabels.download}>
              {actionLabels.download}
            </Button>
          </div>
        )}
      </div>

      {isObject && isExpanded && (
        <div className="ml-4 mt-1 border-l-2 border-border-base pl-2">
          {isArray
            ? (data as unknown[]).map((item, index) => (
                <JsonNode
                  key={index}
                  data={item}
                  path={[...path, index]}
                  level={level + 1}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onDelete={onDelete}
                  allExpanded={allExpanded}
                  actionLabels={actionLabels}
                />
              ))
            : Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                <JsonNode
                  key={key}
                  keyName={key}
                  data={value}
                  path={[...path, key]}
                  level={level + 1}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onDelete={onDelete}
                  allExpanded={allExpanded}
                  actionLabels={actionLabels}
                />
              ))}
          <div className="flex items-center">
            <div className="w-6 h-6 mr-1" />
            <span className="text-syntax-key">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

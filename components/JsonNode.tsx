'use client';
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { stringifyJSONValue } from '@/lib/utils/json';

interface JsonNodeProps {
  data: unknown;
  keyName?: string;
  level: number;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onDelete?: (keyName?: string) => void;
  allExpanded?: boolean;
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
  level,
  expanded,
  setExpanded,
  onDelete,
  allExpanded = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);
  const nodeId = keyName !== undefined ? `${level}-${keyName}` : `root-${level}`;
  const isExpanded = allExpanded || (expanded[nodeId] ?? false);

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
      className={`font-mono text-sm ${isHovered ? 'bg-surface-hover rounded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            <Button variant="secondary" onClick={copyNode} title="复制">复制</Button>
            {onDelete && (
              <Button variant="danger" onClick={() => onDelete(keyName)} title="删除">删除</Button>
            )}
            <Button variant="secondary" onClick={downloadNode} title="下载">下载</Button>
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
                  level={level + 1}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onDelete={onDelete ? () => onDelete(String(index)) : undefined}
                  allExpanded={allExpanded}
                />
              ))
            : Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                <JsonNode
                  key={key}
                  keyName={key}
                  data={value}
                  level={level + 1}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onDelete={onDelete}
                  allExpanded={allExpanded}
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

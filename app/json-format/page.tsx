'use client';
import React, { useState, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { saveAs } from 'file-saver';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// 处理非严格 JSON 格式（如 JS 对象）
const parseLooseJSON = (input: string): any => {
  try {
    // 尝试直接解析
    return JSON.parse(input);
  } catch {
    try {
      // 处理没有引号的键
      const fixedInput = input
        .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '"$1"$2')
        .replace(/'/g, '"');
      return JSON.parse(fixedInput);
    } catch (error) {
      throw error;
    }
  }
};

// JSON 节点组件，支持展开收起
const JsonNode: React.FC<{
  data: any;
  keyName?: string;
  level: number;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onDelete?: (keyName?: string) => void;
  allExpanded?: boolean;
}> = ({ data, keyName, level, expanded, setExpanded, onDelete, allExpanded = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);
  const nodeId = keyName || `root-${level}`;
  const isExpanded = allExpanded || (expanded[nodeId] ?? false);

  const toggleExpand = () => {
    setExpanded(prev => ({
      ...prev,
      [nodeId]: !isExpanded
    }));
  };

  const getTypeColor = (value: any) => {
    if (value === null) return 'text-red-600';
    if (typeof value === 'string') return 'text-green-600';
    if (typeof value === 'number') return 'text-blue-600';
    if (typeof value === 'boolean') return 'text-purple-600';
    return 'text-gray-800';
  };

  const renderValue = (value: any) => {
    if (value === null) return <span className="text-red-600">null</span>;
    if (typeof value === 'string') return <span className="text-green-600">"{value}"</span>;
    if (typeof value === 'number' || typeof value === 'boolean') {
      return <span className={getTypeColor(value)}>{value}</span>;
    }
    return null;
  };

  // 复制节点内容
  const copyNode = async () => {
    try {
      const nodeValue = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(nodeValue);
      // 可以添加复制成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 下载节点内容
  const downloadNode = () => {
    try {
      const nodeValue = JSON.stringify(data, null, 2);
      const blob = new Blob([nodeValue], { type: 'application/json' });
      const fileName = keyName ? `${keyName}.json` : 'node.json';
      saveAs(blob, fileName);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 删除节点
  const handleDelete = () => {
    if (onDelete) {
      onDelete(keyName);
    }
  };

  return (
    <div 
      className={`font-mono text-sm ${isHovered ? 'bg-gray-100 rounded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isObject ? (
            <>
              <button
                onClick={toggleExpand}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800 focus:outline-none mr-1 p-0"
                style={{ width: '24px', height: '24px', display: 'inline-flex' }}
              >
                <span style={{ fontSize: '12px', lineHeight: '1' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              {keyName && <span className="text-gray-800">"{keyName}": </span>}
              <span className="text-gray-800">{isArray ? '[' : '{'}</span>
              {!isExpanded && <span className="text-gray-500 mx-1">....</span>}
              {!isExpanded && <span className="text-gray-800">{isArray ? ']' : '}'}</span>}
              {!isExpanded && (
                <span className="text-gray-400 text-xs ml-1">
                  // {isArray ? data.length : Object.keys(data).length} items
                </span>
              )}
            </>
          ) : (
            <>
              <div className="w-6 h-6 mr-1"></div>
              {keyName && <span className="text-gray-800">"{keyName}": </span>}
              {renderValue(data)}
            </>
          )}
        </div>
        {isHovered && isObject && (
          <div className="flex space-x-1 ml-2">
            <button
              onClick={copyNode}
              className="bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 transition-colors"
              style={{ padding: '4px 8px' }}
              title="复制"
            >
              复制
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors"
                style={{ padding: '4px 8px' }}
                title="删除"
              >
                删除
              </button>
            )}
            <button
              onClick={downloadNode}
              className="bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 transition-colors"
              style={{ padding: '4px 8px' }}
              title="下载"
            >
              下载
            </button>
          </div>
        )}
      </div>
      {isObject && isExpanded && (
        <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-2">
          {isArray ? (
            data.map((item: any, index: number) => (
              <JsonNode
                key={index}
                data={item}
                level={level + 1}
                expanded={expanded}
                setExpanded={setExpanded}
                onDelete={() => {
                  if (onDelete) {
                    // 对于数组，删除指定索引的元素
                    onDelete(index.toString());
                  }
                }}
                allExpanded={allExpanded}
              />
            ))
          ) : (
            Object.entries(data).map(([key, value]) => (
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
            ))
          )}
          <div className="flex items-center">
            <div className="w-6 h-6 mr-1"></div>
            <span className="text-gray-800">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function JsonFormatPage() {
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(true);

  // 示例 JSON
  const exampleJson = {
    name: "JSON Toolkit",
    version: "1.0.0",
    features: ["format", "minify", "validate"],
    settings: {
      theme: "dark",
      indentSize: 2
    },
    isActive: true,
    lastUpdated: new Date().toISOString()
  };

  // 格式化 JSON
  const formatJSON = useCallback(() => {
    if (!inputValue.trim()) {
      setErrorMessage('');
      setOutputValue('');
      return;
    }

    try {
      const parsed = parseLooseJSON(inputValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputValue(formatted);
      setErrorMessage('');
      setAllExpanded(true); // 重置为展开状态
      setExpanded({});
    } catch (error) {
      setErrorMessage((error as Error).message);
      setOutputValue('');
    }
  }, [inputValue]);

  // 压缩 JSON
  const minifyJSON = useCallback(() => {
    if (!inputValue.trim()) {
      setErrorMessage('请输入 JSON 数据');
      return;
    }

    try {
      const parsed = parseLooseJSON(inputValue);
      const minified = JSON.stringify(parsed);
      setOutputValue(minified);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setOutputValue('');
    }
  }, [inputValue]);

  // URL 解码
  const urlDecode = () => {
    if (!inputValue.trim()) {
      setErrorMessage('请输入 URL 编码的字符串');
      return;
    }

    try {
      const decoded = decodeURIComponent(inputValue);
      setInputValue(decoded);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('URL 解码失败');
    }
  };

  // Unicode 编码
  const unicodeEncode = () => {
    if (!inputValue.trim()) {
      setErrorMessage('请输入要编码的字符串');
      return;
    }

    try {
      const encoded = inputValue.split('').map(char => {
        const code = char.charCodeAt(0);
        return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char;
      }).join('');
      setInputValue(encoded);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Unicode 编码失败');
    }
  };

  // Unicode 解码
  const unicodeDecode = () => {
    if (!inputValue.trim()) {
      setErrorMessage('请输入 Unicode 编码的字符串');
      return;
    }

    try {
      const decoded = inputValue.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
        return String.fromCharCode(parseInt(code, 16));
      });
      setInputValue(decoded);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Unicode 解码失败');
    }
  };

  // 删除节点
  const handleDeleteNode = (keyName?: string) => {
    if (!outputValue) return;

    try {
      const parsed = JSON.parse(outputValue);
      
      if (keyName !== undefined) {
        if (Array.isArray(parsed)) {
          // 处理数组
          const index = parseInt(keyName, 10);
          if (!isNaN(index) && index >= 0 && index < parsed.length) {
            parsed.splice(index, 1);
          }
        } else if (typeof parsed === 'object' && parsed !== null) {
          // 处理对象
          delete parsed[keyName];
        }
      }

      const updatedOutput = JSON.stringify(parsed, null, 2);
      setOutputValue(updatedOutput);
      setInputValue(updatedOutput);
    } catch (error) {
      console.error('删除节点失败:', error);
    }
  };

  // 清空输入
  const clearInput = () => {
    setInputValue('');
    setOutputValue('');
    setErrorMessage('');
    setExpanded({});
  };

  // 填充示例
  const fillExample = () => {
    const exampleString = JSON.stringify(exampleJson, null, 2);
    setInputValue(exampleString);
    setOutputValue(exampleString);
    setErrorMessage('');
    setAllExpanded(true); // 设置为展开状态
    setExpanded({});
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!outputValue) return;

    try {
      await navigator.clipboard.writeText(outputValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 下载 JSON 文件
  const downloadJSON = () => {
    if (!outputValue) return;

    const blob = new Blob([outputValue], { type: 'application/json' });
    saveAs(blob, 'formatted.json');
  };

  // 展开/折叠全部
  const toggleAllExpand = () => {
    setAllExpanded(!allExpanded);
    // 清空展开状态，让组件根据 allExpanded 状态重新计算
    setExpanded({});
  };

  // 自动格式化
  useEffect(() => {
    const timer = setTimeout(() => {
      formatJSON();
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, formatJSON]);

  return (
    <div className="h-screen bg-white text-black flex flex-col">
      <div className="flex-grow flex flex-col max-w-7xl mx-auto w-full" style={{ padding: '16px' }}>
        {/* 标题 */}
        <Header />

        {/* 主容器 */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入面板 */}
          <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h2 className="text-lg font-semibold">输入 JSON</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={formatJSON}
                  className="bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  格式化
                </button>
                <button
                  onClick={minifyJSON}
                  className="bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  压缩
                </button>
                <button
                  onClick={urlDecode}
                  className="bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  URL 解码
                </button>
                <button
                  onClick={unicodeEncode}
                  className="bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Uni 编码
                </button>
                <button
                  onClick={unicodeDecode}
                  className="bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Uni 解码
                </button>
                <button
                  onClick={clearInput}
                  className="bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  清空
                </button>
                <button
                  onClick={fillExample}
                  className="bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors mr-1 mb-1"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  示例
                </button>
              </div>
            </div>

            {/* 输入区域 */}
            <div className="relative flex-grow">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                placeholder="请输入 JSON 数据..."
              />
            </div>
          </div>

          {/* 输出面板 */}
          <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">输出结果</h2>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!outputValue && !errorMessage}
                  className={`rounded transition-colors ${
                    outputValue || errorMessage
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ padding: '4px 8px', fontSize: '12px', marginRight: '4px' }}
                >
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={downloadJSON}
                  disabled={!outputValue}
                  className={`rounded transition-colors ${
                    outputValue
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ padding: '4px 8px', fontSize: '12px', marginRight: '4px' }}
                >
                  下载
                </button>
                <button
                  onClick={toggleAllExpand}
                  disabled={!outputValue}
                  className={`rounded transition-colors ${
                    outputValue
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  {allExpanded ? '全部折叠' : '全部展开'}
                </button>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="border border-gray-300 rounded flex-grow p-3 bg-white overflow-auto">
              {errorMessage ? (
                <div className="flex items-center justify-center h-full text-red-600">
                  {errorMessage}
                </div>
              ) : outputValue ? (
                <JsonNode
                  data={JSON.parse(outputValue)}
                  level={0}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onDelete={handleDeleteNode}
                  allExpanded={allExpanded}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  格式化结果将显示在这里
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <Footer />
      </div>
    </div>
  );
}

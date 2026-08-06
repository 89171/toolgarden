import { describe, expect, it } from 'vitest';
import {
  unicodeDecodeJSONValues,
  unicodeEncodeJSONValues,
  urlDecodeJSONValues,
  urlEncodeJSONValues,
} from '../lib/utils/json';

describe('JSON value encoding', () => {
  it('URL-encodes only nested string values and keeps formatted JSON structure', () => {
    const outcome = urlEncodeJSONValues(`{
      label: 'hello world',
      nested: { path: '/docs?q=json' },
      values: ['a+b', 2, true, null]
    }`);

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.parsed).toEqual({
        label: 'hello%20world',
        nested: { path: '%2Fdocs%3Fq%3Djson' },
        values: ['a%2Bb', 2, true, null],
      });
      expect(outcome.output).toContain('\n  "nested": {');
      expect(outcome.output).toContain('"label": "hello%20world"');
    }
  });

  it('URL-decodes string values without changing keys or non-string values', () => {
    const outcome = urlDecodeJSONValues('{"encoded key":"hello%20world","count":2}');

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.parsed).toEqual({ 'encoded key': 'hello world', count: 2 });
    }
  });

  it('round-trips Unicode characters inside JSON string values', () => {
    const encoded = unicodeEncodeJSONValues('{"message":"你好","count":2}');
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    expect(encoded.parsed).toEqual({ message: '\\u4f60\\u597d', count: 2 });
    const decoded = unicodeDecodeJSONValues(encoded.output);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.parsed).toEqual({ message: '你好', count: 2 });
  });

  it('returns an error when a URL value cannot be decoded', () => {
    const outcome = urlDecodeJSONValues('{"value":"bad%value"}');
    expect(outcome.ok).toBe(false);
  });
});

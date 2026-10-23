import { describe, expect, it } from 'vitest';
import { renderHeadline } from '../../src/lib/headline';

describe('renderHeadline', () => {
  it('setzt Code und Akzent', () => {
    expect(renderHeadline('Von `git init` zu *Enterprise-Deals.*')).toBe(
      'Von <code>git init</code> zu <em class="accent">Enterprise-Deals.</em>',
    );
  });
  it('escaped HTML vor dem Markup', () => {
    const out = renderHeadline('<b>*x*');
    expect(out).toContain('&lt;b&gt;');
    expect(out).toContain('<em class="accent">x</em>');
  });
  it('lässt Text ohne Markup unverändert', () => {
    expect(renderHeadline('Dein Zug.')).toBe('Dein Zug.');
  });
});

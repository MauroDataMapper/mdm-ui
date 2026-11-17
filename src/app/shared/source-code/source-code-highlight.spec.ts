/*
Copyright 2020-2026 University of Oxford and NHS England

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import {
  addCodeSnippetControls,
  handleCodeSnippetControlClick,
  highlightHtmlCodeBlocks,
  highlightSourceCode,
  prismLanguageForSourceCode
} from './source-code-highlight';

describe('source-code highlighting', () => {
  it('maps application language names to Prism grammars', () => {
    expect(prismLanguageForSourceCode('c#')).toBe('csharp');
    expect(prismLanguageForSourceCode('json-meql')).toBe('json');
    expect(prismLanguageForSourceCode('DMN')).toBe('markup');
  });

  it('syntax highlights supported languages and escapes unsupported ones', () => {
    expect(highlightSourceCode('const answer = 42;', 'javascript'))
      .toContain('class="token keyword"');
    expect(highlightSourceCode('<script>alert(1)</script>', 'unknown'))
      .toContain('&lt;script&gt;');
  });

  it('highlights HTML code elements without interpreting their source as markup', () => {
    const document = new DOMParser().parseFromString(
      '<pre><code class="language-javascript">const answer = 42;</code></pre>',
      'text/html'
    );
    const code = document.querySelector('code');

    highlightHtmlCodeBlocks(document);

    expect(code.innerHTML).toContain('class="token keyword"');
    expect(code.textContent).toBe('const answer = 42;');
  });

  it('shows a language label and copies code snippet text', () => {
    const container = document.createElement('div');
    container.innerHTML
      = '<pre><code class="language-javascript">const answer = 42;</code></pre>';
    addCodeSnippetControls(container);

    expect(container.querySelector('.mdm-code-snippet__language')?.textContent)
      .toBe('JavaScript');
    expect(container.querySelector('.mdm-code-snippet__toggle-icon')?.classList)
      .toContain('fa-chevron-up');

    const button = container.querySelector<HTMLButtonElement>(
      '[data-code-snippet-copy]'
    );
    const copyText = jest.fn(() => true);
    container.addEventListener('click', event =>
      handleCodeSnippetControlClick(event as MouseEvent, copyText)
    );
    button.click();

    expect(copyText).toHaveBeenCalledWith('const answer = 42;');
    expect(button.textContent).toBe('Copied');
  });

  it('collapses code snippets longer than three lines and allows expanding them', () => {
    const container = document.createElement('div');
    container.innerHTML
      = '<pre><code class="language-javascript">line 1\nline 2\nline 3\nline 4</code></pre>';
    addCodeSnippetControls(container);

    const snippet = container.querySelector('.mdm-code-snippet');
    const toggle = container.querySelector<HTMLButtonElement>(
      '[data-code-snippet-toggle]'
    );
    container.addEventListener('click', event =>
      handleCodeSnippetControlClick(event as MouseEvent, () => true)
    );
    expect(snippet.classList).toContain('mdm-code-snippet--collapsed');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.querySelector('.mdm-code-snippet__toggle-icon')?.classList)
      .toContain('fa-chevron-down');

    toggle.click();

    expect(snippet.classList).not.toContain('mdm-code-snippet--collapsed');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent).toBe('');
    expect(toggle.querySelector('.mdm-code-snippet__toggle-icon')?.classList)
      .toContain('fa-chevron-up');
  });
});

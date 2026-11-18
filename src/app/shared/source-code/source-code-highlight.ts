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
import * as Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';

const prismLanguageAliases: Record<string, string> = {
  'c#': 'csharp',
  'dmn': 'markup',
  'drools': 'clike',
  'html': 'markup',
  'js': 'javascript',
  'json-meql': 'json',
  'ts': 'typescript',
  'xml': 'markup'
};

export const prismLanguageForSourceCode = (language: string): string => {
  const normalizedLanguage = (language ?? '').toLowerCase();
  return prismLanguageAliases[normalizedLanguage] ?? normalizedLanguage;
};

export const highlightSourceCode = (source: string, language: string): string => {
  const prismLanguage = prismLanguageForSourceCode(language);
  const grammar = Prism.languages[prismLanguage];
  const value = source ?? '';

  if (!grammar) {
    return escapeHtml(value);
  }

  return Prism.highlight(value, grammar, prismLanguage);
};

export const highlightHtmlCodeBlocks = (document: Document): void => {
  document.querySelectorAll('pre code').forEach((code) => {
    const languageClass = Array.from(code.classList)
      .find(className => className.startsWith('language-'));

    if (languageClass) {
      code.innerHTML = highlightSourceCode(
        code.textContent ?? '',
        languageClass.slice('language-'.length)
      );
    }
  });
};

export const addCodeSnippetControls = (root: ParentNode): void => {
  root.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    const parent = pre.parentNode;
    if (!code || !parent || pre.parentElement?.classList.contains('mdm-code-snippet')) {
      return;
    }

    const ownerDocument = pre.ownerDocument;
    const languageClass = Array.from(code.classList)
      .find(className => className.startsWith('language-'));
    const language = languageClass?.slice('language-'.length);
    const wrapper = ownerDocument.createElement('div');
    wrapper.className = 'mdm-code-snippet';

    const source = code.textContent ?? '';
    const sourceLines = source.replace(/\r\n?$/, '').split(/\r\n|\r|\n/).length;
    const isCollapsed = sourceLines > 3;
    if (isCollapsed) {
      wrapper.classList.add('mdm-code-snippet--collapsed');
    }

    const toolbar = ownerDocument.createElement('div');
    toolbar.className = 'mdm-code-snippet__toolbar';

    const label = ownerDocument.createElement('span');
    label.className = 'mdm-code-snippet__language';
    label.textContent = displayLanguageName(language);

    const actions = ownerDocument.createElement('div');
    actions.className = 'mdm-code-snippet__actions';

    const toggleButton = ownerDocument.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'mdm-code-snippet__toggle';
    toggleButton.setAttribute('data-code-snippet-toggle', '');
    toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
    toggleButton.setAttribute(
      'aria-label',
      isCollapsed ? 'Expand code snippet' : 'Collapse code snippet'
    );
    toggleButton.title = isCollapsed ? 'Expand code snippet' : 'Collapse code snippet';

    const toggleIcon = ownerDocument.createElement('span');
    toggleIcon.className = `mdm-code-snippet__toggle-icon fas ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`;
    toggleIcon.setAttribute('aria-hidden', 'true');
    toggleButton.append(toggleIcon);

    const button = ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'mdm-code-snippet__copy';
    button.setAttribute('data-code-snippet-copy', '');
    button.setAttribute('aria-label', 'Copy code snippet');

    const icon = ownerDocument.createElement('span');
    icon.className = 'fas fa-copy';
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon, ownerDocument.createTextNode(' Copy'));

    actions.append(toggleButton, button);
    toolbar.append(label, actions);
    parent.insertBefore(wrapper, pre);
    wrapper.append(toolbar, pre);
  });
};

export const handleCodeSnippetControlClick = (
  event: MouseEvent,
  copyText: (text: string) => boolean
): boolean => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const toggleButton = target.closest<HTMLButtonElement>('[data-code-snippet-toggle]');
  if (toggleButton) {
    const wrapper = toggleButton.closest('.mdm-code-snippet');
    if (!wrapper) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    const isCollapsed = wrapper.classList.toggle('mdm-code-snippet--collapsed');
    toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
    toggleButton.setAttribute(
      'aria-label',
      isCollapsed ? 'Expand code snippet' : 'Collapse code snippet'
    );
    toggleButton.title = isCollapsed ? 'Expand code snippet' : 'Collapse code snippet';
    const toggleIcon = toggleButton.querySelector('.mdm-code-snippet__toggle-icon');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-chevron-down', 'fa-chevron-up');
      toggleIcon.classList.add(isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up');
    }
    return true;
  }

  const button = target.closest<HTMLButtonElement>('[data-code-snippet-copy]');
  const code = button?.closest('.mdm-code-snippet')?.querySelector('code');
  if (!button || !code) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();

  const copied = copyText(code.textContent ?? '');
  button.textContent = copied ? 'Copied' : 'Copy failed';
  button.setAttribute(
    'aria-label',
    copied ? 'Code snippet copied' : 'Unable to copy code snippet'
  );
  return true;
};

const displayLanguageName = (language?: string): string => {
  const languageNames: Record<string, string> = {
    'c#': 'C#',
    'bash': 'Bash',
    'csharp': 'C#',
    'css': 'CSS',
    'dmn': 'DMN',
    'html': 'HTML',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'json': 'JSON',
    'json-meql': 'JSON MEQL',
    'py': 'Python',
    'python': 'Python',
    'sh': 'Shell',
    'shell': 'Shell',
    'sql': 'SQL',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML'
  };
  const normalizedLanguage = language?.toLowerCase();
  return languageNames[normalizedLanguage] ?? language ?? 'Code';
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

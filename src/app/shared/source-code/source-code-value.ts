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
export interface SourceCodeValue {
  language: string
  source: string
}

export type SourceCodeValueFormat = 'sourcecode' | 'plain';

export interface SourceCodeEditorOptions {
  fixedLanguage?: string
  pinLanguage?: boolean
  valueFormat?: SourceCodeValueFormat
}

export const defaultSourceCodeLanguage = 'text';

export const encodeSourceCodeValue = (
  value: SourceCodeValue,
  valueFormat: SourceCodeValueFormat = 'sourcecode'
): string => {
  if (valueFormat === 'plain') {
    return value.source ?? '';
  }

  return JSON.stringify({
    language: value.language || defaultSourceCodeLanguage,
    source: value.source ?? ''
  });
};

export const decodeSourceCodeValue = (
  value?: string,
  options?: SourceCodeEditorOptions
): SourceCodeValue => {
  const language = options?.fixedLanguage || defaultSourceCodeLanguage;

  if (!value) {
    return {
      language,
      source: ''
    };
  }

  if (options?.valueFormat === 'plain') {
    return {
      language,
      source: value
    };
  }

  try {
    const parsed = JSON.parse(value);
    return {
      language: options?.pinLanguage
        ? language
        : parsed.language || language,
      source: parsed.source ?? parsed.representation ?? ''
    };
  }
 catch {
    return {
      language,
      source: value
    };
  }
};

export const isSourceCodeProfileDataType = (dataType?: string): boolean =>
  dataType === 'sourcecode';

export const isCodeEditorProfileDataType = (dataType?: string): boolean =>
  dataType === 'sourcecode' || dataType === 'json';

export const getSourceCodeEditorOptionsForDataType = (
  dataType?: string
): SourceCodeEditorOptions => {
  if (dataType === 'json') {
    return {
      fixedLanguage: 'json',
      pinLanguage: true,
      valueFormat: 'plain'
    };
  }

  return {
    valueFormat: 'sourcecode'
  };
};

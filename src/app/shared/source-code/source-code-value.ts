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

export const defaultSourceCodeLanguage = 'text';

export const encodeSourceCodeValue = (value: SourceCodeValue): string =>
  JSON.stringify({
    language: value.language || defaultSourceCodeLanguage,
    source: value.source ?? ''
  });

export const decodeSourceCodeValue = (value?: string): SourceCodeValue => {
  if (!value) {
    return {
      language: defaultSourceCodeLanguage,
      source: ''
    };
  }

  try {
    const parsed = JSON.parse(value);
    return {
      language: parsed.language || defaultSourceCodeLanguage,
      source: parsed.source ?? parsed.representation ?? ''
    };
  }
 catch {
    return {
      language: defaultSourceCodeLanguage,
      source: value
    };
  }
};

export const isSourceCodeProfileDataType = (dataType?: string): boolean =>
  dataType === 'sourcecode';

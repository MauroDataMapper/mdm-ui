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

export interface ProfileAllowedValueOption {
  code: string
  value: string
}

const EMPTY_ALLOWED_VALUE_OPTIONS: ProfileAllowedValueOption[] = [];
const allowedValueOptionsCache = new WeakMap<
  object,
  ProfileAllowedValueOption[]
>();

export const getProfileAllowedValueOptions = (
  allowedValues: unknown
): ProfileAllowedValueOption[] => {
  if (!allowedValues || typeof allowedValues !== 'object') {
    return EMPTY_ALLOWED_VALUE_OPTIONS;
  }

  const cachedOptions = allowedValueOptionsCache.get(allowedValues);
  if (cachedOptions) {
    return cachedOptions;
  }

  const entries = Array.isArray(allowedValues)
    ? allowedValues.map(value => [value, value])
    : Object.entries(allowedValues);

  const options = entries
    .filter(([code]) => typeof code === 'string')
    .map(([code, value]) => ({
      code,
      value: String(value ?? '')
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
  allowedValueOptionsCache.set(allowedValues, options);
  return options;
};

export const formatProfileAllowedValue = (
  code: string,
  allowedValues: unknown
): string => {
  if (Array.isArray(allowedValues)) {
    return code;
  }
  if (!allowedValues || typeof allowedValues !== 'object'
    || !Object.prototype.hasOwnProperty.call(allowedValues, code)) {
    return code;
  }

  const value = String((allowedValues as Record<string, unknown>)[code] ?? '');
  return value !== code ? `${code} (${value})` : code;
};

export const formatProfileFieldCurrentValue = (
  currentValue: string | undefined,
  allowedValues: unknown
): string => {
  if (!currentValue) {
    return '';
  }

  let values: string[];
  try {
    const parsed: unknown = JSON.parse(currentValue);
    if (Array.isArray(parsed)) {
      values = parsed.filter((value): value is string => typeof value === 'string');
    }
    else if (typeof parsed === 'string') {
      values = [parsed];
    }
    else {
      values = [currentValue];
    }
  }
  catch {
    values = [currentValue];
  }

  return values
    .map(value => formatProfileAllowedValue(value, allowedValues))
    .join(', ');
};

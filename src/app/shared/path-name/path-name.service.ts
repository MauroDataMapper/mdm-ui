/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { Injectable } from '@angular/core';
import { PathElement, PathElementType, pathElementTypeNames } from './path-name.model';

@Injectable({
  providedIn: 'root'
})
export class PathNameService {
  private readonly elementSeparator = '|';
  private readonly partSeparator = ':';
  private readonly propSeparator = '@';
  private readonly branchSeparator = '$';

  constructor() { }

  parse(path: string): PathElement[] | null {
    if (!path || path.length === 0) {
      return null;
    }

    path = path.replace(this.propSeparator, this.partSeparator);

    const elements = path.split(this.elementSeparator);
    return elements.map(element => {
      const parts = element.split(this.partSeparator).filter(p => p && p.length > 0);
      if (parts.length < 2) {
        throw new Error(`Path element '${element}' should be in the format 'prefix:label(@version)'`);
      }

      const labelAndVersion = parts[1].split(this.branchSeparator);
      if (labelAndVersion.length < 1) {
        throw new Error(`Path element '${element}' should be in the format 'prefix:label(@version)'`);
      }

      const type = parts[0] as PathElementType;
      const label = labelAndVersion[0];
      const version = labelAndVersion.length > 1 ? labelAndVersion[1] : undefined;
      const typeName = pathElementTypeNames.get(type);

      if (parts.length > 2) {
        const qualifiedName = parts.slice(2);
        const name = qualifiedName[qualifiedName.length - 1];

        return {
          type,
          typeName,
          label,
          version,
          property: {
            name,
            qualifiedName
          }
        };
      }

      return {
        type,
        typeName,
        label,
        version
      };
    });
  }
}

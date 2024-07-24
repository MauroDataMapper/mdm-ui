/*
Copyright 2020-2024 University of Oxford and NHS England

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
import {
  Modelable,
  Navigatable,
  PathableDomainType
} from '@maurodatamapper/mdm-resources';
import {
  isPathElementBranchable,
  pathableDomainTypesFromPrefix,
  PathElement,
  pathElementDomainTypes,
  PathElementType,
  pathElementTypeNames
} from './path-name.model';
import { UIRouter } from '@uirouter/core';

@Injectable({
  providedIn: 'root'
})
export class PathNameService {
  private readonly elementSeparator = '|';
  private readonly partSeparator = ':';
  private readonly propSeparator = '@';
  private readonly branchSeparator = '$';

  constructor(private router: UIRouter) {}

  parse(path: string): PathElement[] | null {
    if (!path || path.length === 0) {
      return null;
    }

    path = path.replace(this.propSeparator, this.partSeparator);

    const elements = path.split(this.elementSeparator);
    return elements.map((element) => {
      const parts = element
        .split(this.partSeparator)
        .filter((p) => p && p.length > 0);
      if (parts.length < 2) {
        throw new Error(
          `Path element '${element}' should be in the format 'prefix:label(@version)'`
        );
      }

      const labelAndVersion = parts[1].split(this.branchSeparator);
      if (labelAndVersion.length < 1) {
        throw new Error(
          `Path element '${element}' should be in the format 'prefix:label(@version)'`
        );
      }

      const type = parts[0] as PathElementType;
      const label = labelAndVersion[0];
      const version =
        labelAndVersion.length > 1 ? labelAndVersion[1] : undefined;
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

  parseAndOverrideVersionOrBranch(
    path: string,
    versionOrBranch: string
  ): PathElement[] | null {
    const pathElements = this.parse(path);
    if (!pathElements) {
      return null;
    }

    pathElements
      .filter((pathElement) => isPathElementBranchable(pathElement))
      .forEach((pathElement) => {
        pathElement.version = versionOrBranch;
      });

    return pathElements;
  }

  build(pathElements: PathElement[]): string {
    if (!pathElements || pathElements.length === 0) {
      return null;
    }

    const pathElementsAsStrings = pathElements.map((pathElement) => {
      let pathElementAsString = `${pathElement.type}${this.partSeparator}${pathElement.label}`;
      if (pathElement.version) {
        pathElementAsString = `${pathElementAsString}${this.branchSeparator}${pathElement.version}`;
      }

      if (pathElement.property) {
        const propertyElementAsString = pathElement.property.qualifiedName.join(
          this.partSeparator
        );
        pathElementAsString = `${pathElementAsString}${this.propSeparator}${propertyElementAsString}`;
      }

      return pathElementAsString;
    });

    return pathElementsAsStrings.join(this.elementSeparator);
  }

  createFromBreadcrumbs(item: Modelable & Navigatable): string {
    if (!item) {
      return null;
    }

    const crumbs = [
      ...item.breadcrumbs,
      {
        domainType: item.domainType,
        id: item.id,
        label: item.label
      }
    ];

    return crumbs
      .map((crumb) => {
        const pathType = pathElementDomainTypes.get(crumb.domainType);
        return `${pathType}:${crumb.label}`;
      })
      .join('|');
  }

  getPathableDomainFromPath(path: string): PathableDomainType {
    const pathElements = this.parse(path);
    return pathableDomainTypesFromPrefix.get(pathElements[0].type);
  }

  getVersionOrBranchName(pathElements: PathElement[]) {
    if (!pathElements || pathElements.length === 0) {
      return null;
    }

    const matching = pathElements.find(
      (pathElement) =>
        isPathElementBranchable(pathElement) && !!pathElement.version
    );
    if (!matching) {
      return '';
    }

    return matching.version;
  }

  removeVersionOrBranchName(pathElements: PathElement[]): PathElement[] {
    if (!pathElements || pathElements.length === 0) {
      return [];
    }

    pathElements.forEach((pathElement) => (pathElement.version = ''));
    return pathElements;
  }

  createHref(path: string) {
    const domain = this.getPathableDomainFromPath(path);
    return this.createHrefFromPath(domain, path);
  }

  createHrefRelativeToVersionOrBranch(path: string, branchName: string) {
    const pathElements = this.parseAndOverrideVersionOrBranch(path, branchName);
    const overriddenPath = this.build(pathElements);

    const domain = pathableDomainTypesFromPrefix.get(pathElements[0].type);

    // Create a href to the path pointing to the version/branch, not the original parameter
    return this.createHrefFromPath(domain, overriddenPath);
  }

  private createHrefFromPath(domain: PathableDomainType, path: string) {
    return this.router.stateService.href(
      'appContainer.mainApp.twoSidePanel.catalogue.catalogueItem',
      {
        domain,
        path
      }
    );
  }
}

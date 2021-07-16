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

import { Container, DataTypeReference, Modelable, ModelableDetail } from '@maurodatamapper/mdm-resources';
import { DefaultProfileControls, DefaultProfileItem, ProfileControlTypes } from '@mdm/model/defaultProfileModel';

export type ProfileDataViewType = 'default' | 'other' | 'addnew';

export const doiProfileNamespace = 'uk.ac.ox.softeng.maurodatamapper.plugins.digitalobjectidentifiers.profile';

export interface ProfileSummaryListItem {
  display: string;
  value: string;
  namespace: string;
  name: string;
}

export const showControl = (controls: string[], controlName: string): boolean => {
  return controls.findIndex((x) => x === controlName) !== -1;
};

export const createDefaultProfileItem = (
  value: string | Container[] | string[] | DataTypeReference,
  displayName: string,
  controlType: ProfileControlTypes,
  propertyName: string): DefaultProfileItem => {
  return {
    controlType,
    displayName,
    value,
    propertyName
  };
};

export const getDefaultProfileData = (
  catalogueItem: Modelable & ModelableDetail & { [key: string]: any },
  descriptionOnly: boolean): DefaultProfileItem[] => {
  const items: DefaultProfileItem[] = [];
  const controls = DefaultProfileControls.renderControls(catalogueItem.domainType);

  items.push(
    createDefaultProfileItem(
      catalogueItem.description,
      'Description',
      ProfileControlTypes.html,
      'description'
    )
  );

  if (descriptionOnly) {
    return items;
  }

  if (showControl(controls, 'label')) {
    items.push(
      createDefaultProfileItem(
        catalogueItem.label,
        'Label',
        ProfileControlTypes.text,
        'label'
      )
    );
  }

  if ('organisation' in catalogueItem && showControl(controls, 'organisation')) {
    items.push(
      createDefaultProfileItem(
        catalogueItem.organisation,
        'Organisation',
        ProfileControlTypes.text,
        'organisation'
      )
    );
  }

  if ('author' in catalogueItem && showControl(controls, 'author')) {
    items.push(
      createDefaultProfileItem(
        catalogueItem.author,
        'Author',
        ProfileControlTypes.text,
        'author'
      )
    );
  }

  if (showControl(controls, 'aliases')) {
    const aliasesCopy = Object.assign([], catalogueItem.aliases);
    items.push(
      createDefaultProfileItem(
        aliasesCopy,
        'Aliases',
        ProfileControlTypes.aliases,
        'aliases'
      )
    );
  }

  if (showControl(controls, 'classifications')) {
    const classificationsCopy = Object.assign([], catalogueItem.classifiers);
    items.push(
      createDefaultProfileItem(
        classificationsCopy,
        'Classifications',
        ProfileControlTypes.classifications,
        'classifiers'
      )
    );
  }

  if (showControl(controls, 'multiplicity')) {
    items.push({
      controlType: ProfileControlTypes.multiplicity,
      displayName: 'Multiplicity',
      maxMultiplicity:
        catalogueItem.maxMultiplicity === -1
          ? '*'
          : catalogueItem.maxMultiplicity,
      minMultiplicity: catalogueItem.minMultiplicity,
      propertyName: 'multiplicity'
    });
  }

  if (showControl(controls, 'dataType')) {
    items.push(
      createDefaultProfileItem(
        catalogueItem.dataType,
        'Data Type',
        ProfileControlTypes.dataType,
        'dataType'
      )
    );
  }

  if (showControl(controls, 'url')) {
    items.push(
      createDefaultProfileItem(
        catalogueItem.url,
        'URL',
        ProfileControlTypes.text,
        'url'
      )
    );
  }

  return items;
};
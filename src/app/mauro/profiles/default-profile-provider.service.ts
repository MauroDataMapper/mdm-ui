/*
Copyright 2020-2022 University of Oxford
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
import {
  CatalogueItemDomainType,
  isContainerDomainType,
  isModelDomainType,
  Profile,
  ProfileField,
  ProfileProvider,
  ProfileSection,
  ProfileSummary,
  ProfileValidationError
} from '@maurodatamapper/mdm-resources';
import { EMPTY, forkJoin, Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MauroItemProviderService } from '../mauro-item-provider.service';
import { MauroItemUpdateService } from '../mauro-item-update.service';
import {
  MauroIdentifier,
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult,
  MauroUpdatePayload,
  NavigatableProfile
} from '../mauro-item.types';
import { ProfileProviderService } from './profile-provider-service';

/**
 * Profile provider definition for the Default Profile.
 */
export const defaultProfileProvider: ProfileProvider = {
  name: 'DefaultProfileProviderService',
  namespace: 'uk.ac.ox.softeng.maurodatamapper.internal.default'
};

export const isDefaultProvider = (provider: ProfileProvider) => {
  return (
    provider &&
    provider.name === defaultProfileProvider.name &&
    provider.namespace === defaultProfileProvider.namespace
  );
};

export const defaultProfileSectionName = 'Default';

const descriptionField: ProfileField = {
  fieldName: 'Description',
  metadataPropertyName: 'description',
  dataType: 'text',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const aliasesField: ProfileField = {
  fieldName: 'Aliases',
  metadataPropertyName: 'aliases',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const authorField: ProfileField = {
  fieldName: 'Author',
  metadataPropertyName: 'author',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const organisationField: ProfileField = {
  fieldName: 'Organisation',
  metadataPropertyName: 'organisation',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const classificationsField: ProfileField = {
  fieldName: 'Classifications',
  metadataPropertyName: 'classifications',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const multiplicityField: ProfileField = {
  fieldName: 'Multiplicity',
  metadataPropertyName: 'multiplicity',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const dataTypeField: ProfileField = {
  fieldName: 'Data Type',
  metadataPropertyName: 'dataType',
  dataType: 'model',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const codeField: ProfileField = {
  fieldName: 'Code',
  metadataPropertyName: 'code',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const definitionField: ProfileField = {
  fieldName: 'Definition',
  metadataPropertyName: 'definition',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const terminologyField: ProfileField = {
  fieldName: 'Terminology',
  metadataPropertyName: 'terminology',
  dataType: 'model',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

const urlField: ProfileField = {
  fieldName: 'URL',
  metadataPropertyName: 'url',
  dataType: 'string',
  minMultiplicity: 0,
  maxMultiplicity: 1
};

/**
 * Profile provider service that manages a specific "default" profile for Mauro catalogue items.
 *
 * Mauro does not have an implementation of a default profile in the same way as other profiles, because the default
 * profile is made up of properties hardwired to the catalogue item itself e.g. the description. There are some cases
 * though where it makes sense to treat the default catalogue item properties as a profile (with sections/fields) in
 * it's own right, so this provider service is designed to intercept the interactions between Mauro and the made up
 * profile object.
 *
 * All operations must be provided with the {@link defaultProfileProvider} object to ensure that only the Default Profile
 * is returned/updated. If any other profile namespace/name is provided, nothing will happen.
 */
@Injectable({
  providedIn: 'root'
})
export class DefaultProfileProviderService implements ProfileProviderService {
  constructor(
    private itemProvider: MauroItemProviderService,
    private itemUpdater: MauroItemUpdateService
  ) {}

  /**
   * Get a profile based on the given Mauro catalogue item identifier and profile provider.
   *
   * @param identifier A {@link MauroIdentifier} containing identification information. At least an
   * ID and domain type is required, but some domain types based on hierarchy require further details.
   * @param provider The namespace/name of the profile provider to use.
   * @returns A {@link Profile} which is mapped to the requested catalogue item in an observable stream.
   */
  get(
    identifier: MauroIdentifier,
    provider: ProfileProvider
  ): Observable<Profile> {
    if (!isDefaultProvider(provider)) {
      return EMPTY;
    }

    return this.itemProvider
      .get(identifier)
      .pipe(map((item) => this.mapItemToProfile(item)));
  }

  getMany(
    rootItem: MauroItem,
    identifiers: MauroIdentifier[],
    provider: ProfileProvider
  ): Observable<NavigatableProfile[]> {
    if (!isDefaultProvider(provider)) {
      return EMPTY;
    }

    return this.itemProvider
      .getMany(identifiers)
      .pipe(map((items) => items.map((item) => {
        return {
          ...this.mapItemToProfile(item),
          breadcrumbs: item.breadcrumbs
        };
      })));
  }

  /**
   * Save a profile based on the given Mauro catalogue item identifier and profile provider.
   *
   * @param identifier A {@link MauroIdentifier} containing identification information. At least an
   * ID and domain type is required, but some domain types based on hierarchy require further details.
   * @param provider The namespace/name of the profile provider to use.
   * @param profile The {@link Profile} object to save back to the catalogue item.
   * @returns The same profile object if saved successfully, via an observable stream.
   */
  save(
    identifier: MauroIdentifier,
    provider: ProfileProvider,
    profile: Profile
  ): Observable<Profile> {
    if (!isDefaultProvider(provider)) {
      return EMPTY;
    }

    const item = this.mapProfileToItem(identifier, profile);
    return of(item).pipe(
      switchMap((value) => this.itemUpdater.save(identifier, value)),
      map((_) => profile)
    );
  }

  /**
   * Save multiple profiles based on the given profile provider and profile and identifers pairs.
   *
   * @param rootItem The root catalogue item to base all further items under.
   * @param provider The namespace/name of the profile provider to use.
   * @param payloads An array of profile/identifier pairs, containing the data to update.
   * @returns The same profile objects if saved successfully, via an observable stream.
   */
  saveMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    payloads: MauroProfileUpdatePayload[]
  ): Observable<Profile[]> {
    if (!isDefaultProvider(provider)) {
      return EMPTY;
    }

    const itemPayloads: MauroUpdatePayload[] = payloads.map((payload) => {
      return {
        identifier: payload.identifier,
        item: this.mapProfileToItem(payload.identifier, payload.profile)
      };
    });

    return of(itemPayloads).pipe(
      switchMap((items) => this.itemUpdater.saveMany(items)),
      map((_) => payloads.map((pl) => pl.profile))
    );
  }

  /**
   * Validates a profile based on the given profile provider.
   *
   * @param provider The namespace/name of the profile provider to use.
   * @param profile The profile to validate.
   * @returns A result object containing the profile and a possible list of errors found, via an observable stream.
   */
  validate(
    provider: ProfileProvider,
    profile: Profile
  ): Observable<MauroProfileValidationResult> {
    if (!isDefaultProvider(provider)) {
      return EMPTY;
    }

    const section = profile.sections.find(
      (sec) => sec.name === defaultProfileSectionName
    );
    if (!section) {
      return throwError(new Error('Cannot find default profile section'));
    }

    const errors = this.validateSection(profile, section);

    return of({
      profile,
      errors
    });
  }

  validateMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    profiles: Profile[]
  ): Observable<MauroProfileValidationResult[]> {
    if (!isDefaultProvider(provider)) {
      return EMPTY;
    }

    return forkJoin(
      profiles.map((profile) => this.validate(provider, profile))
    );
  }

  usedProfiles(item: MauroItem): Observable<ProfileSummary[]> {
    return of([
      {
        allowsExtraMetadataKeys: false,
        displayName: 'Default profile',
        domains: [
          CatalogueItemDomainType.DataModel,
          CatalogueItemDomainType.DataClass,
          CatalogueItemDomainType.DataElement,
          CatalogueItemDomainType.ModelDataType,
          CatalogueItemDomainType.Terminology,
          CatalogueItemDomainType.Term,
          CatalogueItemDomainType.CodeSet,
          CatalogueItemDomainType.Folder,
          CatalogueItemDomainType.VersionedFolder,
          CatalogueItemDomainType.Classifier
        ],
        knownMetadataKeys: this.getMetadataKeys(item.domainType),
        metadataNamespace: defaultProfileProvider.namespace,
        name: defaultProfileProvider.name,
        namespace: defaultProfileProvider.namespace,
        providerType: 'Profile',
        version: defaultProfileProvider.version
      }
    ]);
  }

  unusedProfiles(): Observable<ProfileSummary[]> {
    // For this provider, every item always has a "default" profile, so there are
    // never any unused profiles
    return of([]);
  }

  private mapItemToProfile(item: MauroItem): Profile {
    // All domain types contain at least a "description"
    const fields: ProfileField[] = [
      this.mapItemToProfileField(item, descriptionField)
    ];

    if (!isContainerDomainType(item.domainType)) {
      fields.push(this.mapItemToProfileField(item, aliasesField));
      fields.push(this.mapItemToProfileField(item, classificationsField));
    }

    if (isModelDomainType(item.domainType)) {
      fields.push(this.mapItemToProfileField(item, authorField));
      fields.push(this.mapItemToProfileField(item, organisationField));
    }

    if (
      item.domainType === CatalogueItemDomainType.DataClass ||
      item.domainType === CatalogueItemDomainType.DataElement
    ) {
      // Multiplicity is a special profile field, as it is a combination of two properties
      fields.push({
        ...multiplicityField,
        currentValue: `${item.minMultiplicity ?? 0}..${
          item.maxMultiplicity ?? 0
        }`
      });
    }

    if (item.domainType === CatalogueItemDomainType.DataElement) {
      fields.push(this.mapItemToProfileField(item, dataTypeField));
    }

    if (item.domainType === CatalogueItemDomainType.Term) {
      fields.push(this.mapItemToProfileField(item, codeField));
      fields.push(this.mapItemToProfileField(item, definitionField));
      fields.push(this.mapItemToProfileField(item, terminologyField));
      fields.push(this.mapItemToProfileField(item, urlField));
    }

    return {
      id: item.id,
      domainType: item.domainType,
      label: item.label,
      sections: [
        {
          name: defaultProfileSectionName,
          fields
        }
      ]
    };
  }

  private mapProfileToItem(
    identifier: MauroIdentifier,
    profile: Profile
  ): MauroItem {
    const section = profile.sections.find(
      (sec) => sec.name === defaultProfileSectionName
    );

    if (!section) {
      throw new Error('Cannot find default profile section');
    }

    const item: MauroItem = {
      id: identifier.id,
      domainType: identifier.domainType,
      label: profile.label
    };

    this.mapProfileFieldToItem(
      section,
      item,
      descriptionField.metadataPropertyName
    );

    if (!isContainerDomainType(item.domainType)) {
      this.mapProfileFieldToItem(
        section,
        item,
        aliasesField.metadataPropertyName
      );
      this.mapProfileFieldToItem(
        section,
        item,
        classificationsField.metadataPropertyName
      );
    }

    if (isModelDomainType(item.domainType)) {
      this.mapProfileFieldToItem(
        section,
        item,
        authorField.metadataPropertyName
      );
      this.mapProfileFieldToItem(
        section,
        item,
        organisationField.metadataPropertyName
      );
    }

    if (
      item.domainType === CatalogueItemDomainType.DataClass ||
      item.domainType === CatalogueItemDomainType.DataElement
    ) {
      // Multiplicity is a special profile field, as it is a combination of two properties
      this.mapProfileFieldToItemProps(
        section,
        item,
        multiplicityField.metadataPropertyName,
        (field, target) => {
          const multiplicity = field.currentValue;
          if (!multiplicity) {
            return;
          }

          const parts = multiplicity.split('..').map((part) => Number(part));
          target.minMultiplicity = parts[0];
          target.maxMultiplicity = parts[1];
        }
      );
    }

    if (item.domainType === CatalogueItemDomainType.DataElement) {
      this.mapProfileFieldToItem(
        section,
        item,
        dataTypeField.metadataPropertyName
      );
    }

    if (item.domainType === CatalogueItemDomainType.Term) {
      this.mapProfileFieldToItem(section, item, codeField.metadataPropertyName);
      this.mapProfileFieldToItem(
        section,
        item,
        definitionField.metadataPropertyName
      );
      this.mapProfileFieldToItem(
        section,
        item,
        terminologyField.metadataPropertyName
      );
      this.mapProfileFieldToItem(section, item, urlField.metadataPropertyName);
    }

    return item;
  }

  private mapItemToProfileField(
    item: MauroItem,
    field: ProfileField
  ): ProfileField {
    return {
      ...field,
      currentValue: item[field.metadataPropertyName] ?? ''
    };
  }

  private mapProfileFieldToItem(
    section: ProfileSection,
    item: MauroItem,
    metadataPropertyName: string
  ) {
    this.mapProfileFieldToItemProps(
      section,
      item,
      metadataPropertyName,
      (field, target) => (target[metadataPropertyName] = field.currentValue)
    );
  }

  private mapProfileFieldToItemProps(
    section: ProfileSection,
    item: MauroItem,
    metadataPropertyName: string,
    setter: (field: ProfileField, item: MauroItem) => void
  ) {
    const field = section.fields.find(
      (fld) => fld.metadataPropertyName === metadataPropertyName
    );
    if (field && field.currentValue) {
      setter(field, item);
    }
  }

  private validateSection(
    profile: Profile,
    section: ProfileSection
  ): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];
    if (
      profile.domainType === CatalogueItemDomainType.DataClass ||
      profile.domainType === CatalogueItemDomainType.DataElement
    ) {
      errors.push(...this.validateMultiplicity(section));
    }

    return errors;
  }

  private validateMultiplicity(
    section: ProfileSection
  ): ProfileValidationError[] {
    const field = section.fields.find(
      (fld) =>
        fld.metadataPropertyName === multiplicityField.metadataPropertyName
    );

    if (!field || !field.currentValue || field.currentValue?.length === 0) {
      return [];
    }

    if (!/[0-9]+..[0-9]+$/gm.test(field.currentValue)) {
      return [
        {
          fieldName: multiplicityField.fieldName,
          metadataPropertyName: multiplicityField.metadataPropertyName,
          message: 'Multiplicity is not in the format "x..y"'
        }
      ];
    }

    return [];
  }

  private getMetadataKeys(domainType: CatalogueItemDomainType) {
    const keys = [descriptionField.metadataPropertyName];

    if (!isContainerDomainType(domainType)) {
      keys.push(aliasesField.metadataPropertyName);
      keys.push(classificationsField.metadataPropertyName);
    }

    if (isModelDomainType(domainType)) {
      keys.push(authorField.metadataPropertyName);
      keys.push(organisationField.metadataPropertyName);
    }

    if (
      domainType === CatalogueItemDomainType.DataClass ||
      domainType === CatalogueItemDomainType.DataElement
    ) {
      keys.push(multiplicityField.metadataPropertyName);
    }

    if (domainType === CatalogueItemDomainType.DataElement) {
      keys.push(dataTypeField.metadataPropertyName);
    }

    if (domainType === CatalogueItemDomainType.Term) {
      keys.push(codeField.metadataPropertyName);
      keys.push(definitionField.metadataPropertyName);
      keys.push(terminologyField.metadataPropertyName);
      keys.push(urlField.metadataPropertyName);
    }

    return keys;
  }
}

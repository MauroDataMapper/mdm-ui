/*
Copyright 2021 University of Oxford

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
import { MdmResourcesIndexResponse, MdmResourcesResponse } from '@mdm/modules/resources/mdm-resources.models';

/**
 * Represents an API property.
 */
export interface ApiProperty {
  id?: string;
  key: string;
  value: string;
  publiclyVisible?: boolean;
  lastUpdated?: string;
}

/**
 * Type alias for an endpoint response returning a single `ApiProperty` object.
 */
export type ApiPropertyResponse = MdmResourcesResponse<ApiProperty>;

/**
 * Type alias for an endpoint response returning a list of `ApiProperty` objects.
 */
export type ApiPropertyIndexResponse = MdmResourcesIndexResponse<ApiProperty>;

export enum ApiPropertyGroup {
  EmailTemplates = 'email-templates'
}

export enum ApiPropertyEditType {
  Value,
  Text,
  Html
}

export interface ApiPropertyMetadata {
  key: string;
  label: string;
  group: ApiPropertyGroup;
  editType: ApiPropertyEditType;
  publiclyVisible?: boolean;
}

export interface ApiPropertyEditableState {
  metadata: ApiPropertyMetadata;
  original?: ApiProperty;
}

export const propertyMetadata: ApiPropertyMetadata[] = [
  {
    key: 'site.url',
    label: 'Site URL',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.from.address',
    label: 'From address - Email',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.from.name',
    label: 'From address - Name',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.admin_confirm_registration.subject',
    label: 'Admin confirm user registration email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.admin_confirm_registration.body',
    label: 'Admin confirm user registration email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  },
  {
    key: 'email.admin_register.subject',
    label: 'Admin registered user email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.admin_register.body',
    label: 'Admin registered user email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  },
  {
    key: 'email.invite_edit.subject',
    label: 'User invited to edit email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.invite_edit.body',
    label: 'User invited to edit email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  },
  {
    key: 'email.invite_view.subject',
    label: 'User invited to view email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.invite_view.body',
    label: 'User invited to view email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  },
  {
    key: 'email.self_register.subject',
    label: 'User self registered email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.self_register.body',
    label: 'User self registered email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  },
  {
    key: 'email.forgotten_password.subject',
    label: 'Forgotten password email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.forgotten_password.body',
    label: 'Forgotten password email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  },
  {
    key: 'email.password_reset.subject',
    label: 'Reset password email - Subject',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Value
  },
  {
    key: 'email.password_reset.body',
    label: 'Reset password email - Body',
    group: ApiPropertyGroup.EmailTemplates,
    editType: ApiPropertyEditType.Text
  }
];
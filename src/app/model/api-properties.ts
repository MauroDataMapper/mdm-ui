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
  category?: string;
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

export enum ApiPropertyEditType {
  Value,
  Text,
  Html
}

export interface ApiPropertyMetadata {
  key: string;
  category: string;
  editType: ApiPropertyEditType;
  publiclyVisible?: boolean;
  isSystem: boolean;
}

export interface ApiPropertyEditableState {
  metadata: ApiPropertyMetadata;
  original?: ApiProperty;
}

/**
 * List of known API properties that the Mauro system depends on, including relevant metadata to describe them.
 */
export const propertyMetadata: ApiPropertyMetadata[] = [
  {
    key: 'site.url',
    category: 'Site',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.from.address',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.from.name',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.admin_confirm_registration.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.admin_confirm_registration.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'email.admin_register.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.admin_register.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'email.invite_edit.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.invite_edit.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'email.invite_view.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.invite_view.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'email.self_register.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.self_register.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'email.forgotten_password.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.forgotten_password.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'email.password_reset.subject',
    category: 'Email',
    editType: ApiPropertyEditType.Value,
    isSystem: true
  },
  {
    key: 'email.password_reset.body',
    category: 'Email',
    editType: ApiPropertyEditType.Text,
    isSystem: true
  },
  {
    key: 'pageContent.home.intro.left',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true
  },
  {
    key: 'pageContent.home.intro.right',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true
  },
  {
    key: 'pageContent.home.detail.heading',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true
  },
  {
    key: 'pageContent.home.detail.column1',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true
  },
  {
    key: 'pageContent.home.detail.column2',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true
  },
  {
    key: 'pageContent.home.detail.column3',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true
  },
];

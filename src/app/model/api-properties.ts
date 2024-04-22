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

import { ApiProperty } from '@maurodatamapper/mdm-resources';

export enum ApiPropertyEditType {
  Value,
  Text,
  Html,
  Boolean, // eslint-disable-line id-blacklist
  Image
}

export interface ApiPropertyMetadata {
  key: string;
  category: string;
  editType: ApiPropertyEditType;
  publiclyVisible?: boolean;
  isSystem: boolean;
  requiresReload?: boolean;
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
    key: 'content.home.intro.left',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.home.intro.right',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.home.detail.heading',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.home.detail.column_one',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.home.detail.column_two',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.home.detail.column_three',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.about.application.name',
    category: 'Content',
    editType: ApiPropertyEditType.Value,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.about.content',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.about.contact.details',
    category: 'Content',
    editType: ApiPropertyEditType.Html,
    isSystem: true,
    publiclyVisible: true
  },
  {
    key: 'content.footer.copyright',
    category: 'Content',
    editType: ApiPropertyEditType.Value,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'theme.logo.url',
    category: 'Theme',
    editType: ApiPropertyEditType.Value,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'theme.logo.width',
    category: 'Theme',
    editType: ApiPropertyEditType.Value,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.use_subscribed_catalogues',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.use_versioned_folders',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.use_merge_diff_ui',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.use_open_id_connect',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.use_digital_object_identifiers',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.use_issue_reporting',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'ui.default.profile.namespace',
    category: 'UI',
    editType: ApiPropertyEditType.Value,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'ui.default.profile.simplified_entry',
    category: 'UI',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'security.restrict.root.folder',
    category: 'security',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'security.restrict.classifier.create',
    category: 'security',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'security.hide.exception',
    category: 'security',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true
  },
  {
    key: 'ui.show_can_edit_property_alert',
    category: 'UI',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true,
  },
  {
    key: 'explorer.theme.images.header.logo',
    category: 'Mauro Data Explorer',
    editType: ApiPropertyEditType.Image,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true,
  },
  {
    key: 'feature.attachment_size_limit_mb',
    category: 'Features',
    editType: ApiPropertyEditType.Value,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  },
  {
    key: 'feature.copy_annotations_to_new_version',
    category: 'Features',
    editType: ApiPropertyEditType.Boolean,
    isSystem: true,
    publiclyVisible: true,
    requiresReload: true
  }
];

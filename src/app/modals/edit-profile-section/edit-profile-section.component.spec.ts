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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfileField } from '@maurodatamapper/mdm-resources';
import { EditProfileModalConfiguration } from './edit-profile-section.model';
import { EditProfileSectionComponent } from './edit-profile-section.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, GridService } from '@mdm/services';
import { MarkdownParserService } from '@mdm/content/markdown/markdown-parser/markdown-parser.service';
import { EditingService } from '@mdm/services/editing.service';
import { of } from 'rxjs';

describe('EditProfileSectionComponent terminology fields', () => {
  const termsList = jest.fn(() =>
    of({ body: { items: [], count: 0 } })
  );
  let component: EditProfileSectionComponent;
  let field: ProfileField;

  beforeEach(() => {
    termsList.mockClear();
    field = {
      fieldName: 'Term',
      metadataPropertyName: 'term',
      dataType: 'text',
      currentValue: '["T1"]',
      maxMultiplicity: -1,
      referenceTerminology: 'terminology-uuid'
    } as ProfileField;
    Object.assign(field, { dataType: 'terminology' });

    component = new EditProfileSectionComponent(
      {} as MatDialogRef<EditProfileSectionComponent>,
      {
        profile: { sections: [] },
        isNew: false
      } as EditProfileModalConfiguration,
      {} as MarkdownParserService,
      { terms: { list: termsList } } as unknown as MdmResourcesService,
      new GridService(),
      {} as MatDialog,
      {} as MessageHandlerService,
      {} as EditingService
    );
    component.profileSection = { label: 'Terms', fields: [field] };
    component.ngOnInit();
  });

  it('loads terms from the referenced terminology using paginated code search', () => {
    component.fetchTerminologyTerms('T', false, 20, 20, field);

    expect(termsList).toHaveBeenCalledWith('terminology-uuid', {
      max: 20,
      offset: 20,
      sort: 'code',
      order: 'asc',
      code: 'T'
    });
  });

  it('serializes selected term codes as a JSON list', () => {
    component.onTerminologyTermsSelected(
      [{ code: 'T1' }, { code: 'T2' }],
      field
    );

    expect(field.currentValue).toBe('["T1","T2"]');
  });

  it('initializes the selector with term codes already stored on the field', () => {
    expect(component.getSelectedTerminologyTerms(field)).toEqual([
      { code: 'T1' }
    ]);
  });

  it('uses the maximum multiplicity to determine whether selection is multiple', () => {
    expect(component.supportsMultipleTerminologyTerms(field)).toBe(true);

    field.maxMultiplicity = 1;
    expect(component.supportsMultipleTerminologyTerms(field)).toBe(false);
  });
});

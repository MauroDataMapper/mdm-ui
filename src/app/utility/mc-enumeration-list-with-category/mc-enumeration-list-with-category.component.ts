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
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ValidatorService } from '@mdm/services/validator.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { DataClassDetail, DataModelDetail } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-mc-enumeration-list-with-category',
  templateUrl: './mc-enumeration-list-with-category.component.html',
  styleUrls: ['./mc-enumeration-list-with-category.component.sass']
})
export class McEnumerationListWithCategoryComponent implements OnInit {
  @Input() parent : DataModelDetail | DataClassDetail;
  @Input() clientSide = false;
  @Input() enumerationValues ;
  @Input() onUpdate;
  @Input() type: any;
  @Input() isEditable = false;
  @Input() domainType: string;

  @Output() afterSave = new EventEmitter<any>();

  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  dataSource: any;
  enumsCount: number;
  total: number;
  displayItems: any[];
  categories = [];
  allRecords = [];
  allRecordsWithGroups = [];

  hasCategory = false;
  showEdit = false;
  hideFilters = true;

  currentPage = 0;
  pageSize = this.userSettingsHandler.get('countPerTable');
  pageSizes = this.userSettingsHandler.get('counts');
  displayedColumnsEnums = ['group', 'key', 'value', 'buttons'];

  sortBy = 'group';
  sortType = '';

  constructor(
    private userSettingsHandler: UserSettingsHandlerService,
    private securityHandler: SecurityHandlerService,
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private stateHandler: StateHandlerService,
    private editingService: EditingService) {
  }

  ngOnInit() {

   if (!this.clientSide) {
      this.displayedColumnsEnums = ['group', 'key', 'value', 'more', 'buttons'];
    } else {
      this.displayedColumnsEnums = ['group', 'key', 'value', 'buttons'];
    }

    if (this.enumerationValues !== null && this.enumerationValues !== undefined) {
      this.showRecords(this.enumerationValues);

      if (this.parent !== null && this.parent !== undefined) {
        const access = this.securityHandler.elementAccess(this.parent);
        this.showEdit = access.showEdit;
      }
    }
  }

  // Drag and drop
  dropTable(event: CdkDragDrop<any[]>) {

    const prevIndex = this.displayItems.findIndex(r => r.id === event.item.data.id);

    moveItemInArray(this.displayItems, prevIndex, event.currentIndex);

    let prevRec = this.displayItems[event.currentIndex - 1];
    const nextRec = this.displayItems[event.currentIndex + 1];

    if (prevRec === undefined) {
      return;
    }

    let newPosition = 0;
    if (prevRec.isCategoryRow) {
      newPosition = nextRec.index;
    } else {
      newPosition = parseInt(prevRec.index, 10) + 1;
    }

    let newCategory = null;
    let nextIndex = null;
    if (prevRec.isCategoryRow) {
      newCategory = prevRec.category;
    } else {
      while (!newCategory && prevRec) {
        nextIndex = this.displayItems.indexOf(prevRec) - 1;
        prevRec = this.displayItems[nextIndex];
        if (prevRec && prevRec.isCategoryRow) {
          newCategory = prevRec.category;
          break;
        }
      }
    }

    this.updateOrder(event.item.data.id, newPosition, newCategory);

    this.table.renderRows();

  }

  updateOrder = (enumId, newPosition, newCategory) => {

    if (this.clientSide) {
      const sorted = this.allRecords;

      // find it & remove it
      let index = 0;
      sorted.forEach((item, i) => {
        if (item.id === enumId) {
          index = i;
        }
      });

      const foundRecords = sorted.splice(index, 1);
      if (foundRecords && foundRecords.length > 0) {
        const record = foundRecords[0];

        let location = -1;
        for (let i = 0; i < sorted.length && location === -1; i++) {
          if (
            (i === 0 && newPosition < sorted[i].index) ||
            sorted[i].index === newPosition ||
            (sorted[i].index < newPosition &&
              i + 1 < sorted.length &&
              newPosition < sorted[i + 1].index)
          ) {
            record.index = newPosition;
            // record[0].edit.index = newPosition;
            sorted.splice(i, 0, record);
            location = i;
          }
        }
        for (let i = 0; i < sorted.length; i++) {
          sorted[i].index = i + 1;
        }
        this.showRecords(sorted);
      }
    } else {
      const resource = {
        index: newPosition,
        category: newCategory
      };

      this.resourcesService.enumerationValues.updateInEnumeratedType(this.parent.model, this.parent.id, enumId, resource).subscribe(() => {
        this.reloadRecordsFromServer().subscribe(data => {
          this.showRecords(data.body.enumerationValues);
        });

        this.messageHandler.showSuccess('Enumeration updated successfully.');
      },
        error => {

          this.messageHandler.showError('There was a problem updating the enumeration.', error);
        }
      );
    }
  };

  identify(item) {
    return item.id;
  }

  // Accepts the array and key
  groupBy = (array, key) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Order by index
      result[currentValue[key]].sort((x, y) => x.index - y.index);

      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };

  showRecords(values) {
    if (!values && values.length > 0) {
      return;
    }

    this.categories = [];

    this.allRecords = [].concat(values);
    this.enumsCount = this.allRecords.length;
    this.hasCategory = false;

    for (const record of this.allRecords) {
      if (record && record.category) {
        this.hasCategory = true;
        break;
      }
    }

    let categoryNames = [];
    let categories = [];
    categories = this.groupBy(this.allRecords, 'category');


    let hasEmptyCategory = false;

    for (const category in categories) {
      if (category !== null && category !== 'null' && !categoryNames.includes(category)) {
        categoryNames.push(category);
      } else {
        hasEmptyCategory = true;
      }
    }

    if (hasEmptyCategory) {
      categoryNames.push(null);
    }

    if (this.sortType === 'asc') {
      categoryNames = categoryNames.sort((a, b) => a[0].localeCompare(b[0]));
    } else if (this.sortType === 'desc') {
      categoryNames = categoryNames.reverse();
    }

    const allRecordsWithGroups = [];
    categoryNames.forEach(category => {
      // TODO sort
      // categories[category] = _.sortBy(categories[category], 'index');
      if (category !== null && category !== '' && category !== undefined) {
        this.categories.push({ key: category, value: category });
      }

      allRecordsWithGroups.push({
        id: category !== 'null' ? category : null,
        category: category !== 'null' ? category : null,
        isCategoryRow: true
      });

      categories[category].forEach(row => {
        allRecordsWithGroups.push(row);
      });
    });

    this.displayItems = [];
    this.total = this.enumsCount;

    const start = this.pageSize * this.currentPage;
    let e = 0;
    let skippedCategories = 0;


    for (let i = 0; i < allRecordsWithGroups.length; i++) {
      if (i < start + skippedCategories) {
        if (allRecordsWithGroups[i].isCategoryRow) {
          skippedCategories++;
        }
        continue;
      }

      if (allRecordsWithGroups[i].isCategoryRow) {
        this.displayItems.push(allRecordsWithGroups[i]);
        continue;
      }

      if (e < this.pageSize) {
        this.displayItems.push(allRecordsWithGroups[i]);
        e++;
      } else {
        break;
      }
    }
    // If the current page ends with a category, don't display it
    if (
      this.displayItems[this.displayItems.length - 1] !== undefined &&
      this.displayItems[this.displayItems.length - 1].isCategoryRow
    ) {
      this.displayItems.splice(-1, 1);
    }

    // If the current page doesn't start with a category, check if the first item has a category and add it to the list
    if (
      this.displayItems[0] !== undefined &&
      !this.displayItems[0].isCategoryRow
    ) {
      if (
        this.displayItems[0].category !== '' ||
        this.displayItems[0].category !== undefined
      ) {
        this.displayItems = [
          {
            id: this.displayItems[0].category,
            category: this.displayItems[0].category,
            isCategoryRow: true
          },
          ...this.displayItems
        ];
      }
    }
  }

  openEnumerationValues = record => {
      this.stateHandler.Go('enumerationvalues', { dataModelId: this.parent.model, dataTypeId: this.parent.id, id: record.id}, {reload: true, location: true, notify: false});
   };

  add() {
    const newRecord = {
      id: 'temp-' + this.validator.guid(),
      key: '',
      value: '',
      category: '',
      isCategoryRow: false,
      edit: {
        id: '',
        key: '',
        value: '',
        category: '',
        errors: ''
      },
      inEdit: true,
      inDelete: false,
      isNew: true
    };

    if (this.displayItems === undefined) {
      this.displayItems = [];
    }

    this.displayItems = this.displayItems.concat(newRecord);
    this.editingService.setFromCollection(this.displayItems);
  }

  validate(record) {
    let isValid = true;
    record.edit.errors = [];

    if (record.edit.key.trim().length === 0) {
      record.edit.errors.key = 'Key can\'t be empty!';
      isValid = false;
    }
    if (record.edit.value.trim().length === 0) {
      record.edit.errors.value = 'Value can\'t be empty!';
      isValid = false;
    }

    if (
      this.allRecordsWithGroups !== null &&
      this.allRecordsWithGroups !== undefined
    ) {
      for (const recordWithGroup of this.allRecordsWithGroups) {
        if (!recordWithGroup) {
          continue;
        }
        if (
          recordWithGroup.isCategoryRow ||
          record.id === recordWithGroup.id
        ) {
          continue;
        }
        if (
          recordWithGroup.key.toLowerCase().trim() ===
          record.edit.key.toLowerCase().trim()
        ) {
          record.edit.errors.key = 'Key already exists';
          isValid = false;
        }
      }
    }
    if (isValid) {
      delete record.edit.errors;
    }
    return isValid;
  }

  editClicked(record) {
    record.edit = Object.assign({}, record);
    record.edit.errors = [];
    record.inEdit = true;
    this.editingService.setFromCollection(this.displayItems);
  }

  deleteClicked(record) {
    record.inDelete = true;
  }

  confirmDeleteClicked(record) {
    if (this.clientSide) {
      let i = this.allRecords.length - 1;
      while (i >= 0) {
        if (this.allRecords[i].id === record.id) {
          this.allRecords.splice(i, 1);
        }
        i--;
      }
      this.showRecords([].concat(this.allRecords));
    } else {
      this.resourcesService.enumerationValues.removeFromEnumeratedType(this.parent.model, this.parent.id, record.id).subscribe(() => {
        this.messageHandler.showSuccess('Enumeration deleted successfully.');
        // reload all enums
        this.reloadRecordsFromServer().subscribe((data) => {
          this.showRecords(data.body.enumerationValues);
        });
      }, error => {
        this.messageHandler.showError('There was a problem deleting the enumeration.', error);
      });

    }
    if (this.onUpdate) {
      this.onUpdate(this.allRecords);
    }
  }

  cancelDeleteClicked(record) {
    record.inDelete = false;
  }

  cancelEditClicked(record) {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (!confirm) {
        return;
      }

      if (record.isNew && this.allRecords) {
        let i = this.allRecords.length - 1;
        while (i >= 0) {
          if (this.allRecords[i].id === record.id) {
            this.allRecords.splice(i, 1);
          }
          i--;
        }
        this.showRecords([].concat(this.allRecords));
      }
      record.inEdit = false;
      this.editingService.setFromCollection(this.displayItems);
    });
  }

  saveClicked(record) {
    if (!this.validate(record)) {
      return;
    }
    record.edit.errors = [];
    const resource = {
      key: record.edit.key,
      value: record.edit.value,
      category: record.edit.category
    };
    // if clientSide is true, it should not pass details to the server
    // this is used in wizard for adding metadata items when creating a new model,class or element
    if (this.clientSide) {
      record.key = resource.key;
      record.value = resource.value;
      record.category = resource.category;
      record.inEdit = false;
      record.isNew = false;
      this.editingService.setFromCollection(this.displayItems);

      // New Record
      if (record.id.indexOf('temp-') === 0) {
        // find max index
        let maxIndex = -1;

        this.allRecords.forEach(item => {
          if (item.index > maxIndex) {
            maxIndex = item.index;
          }
        });

        record.index = maxIndex + 1;
        record.edit.index = maxIndex + 1;

        // remove the "temp-" prefix of the id
        record.id = record.id.replace('temp-', '');

        const newRecs = [].concat(this.allRecords);
        newRecs.push(record);
        this.showRecords(newRecs);
      }

      const allRecs = [].concat(this.allRecords);
      this.showRecords(allRecs);

      if (this.onUpdate) {
        this.onUpdate(this.allRecords);
      }
      return;
    }

    // in edit mode, we save them here
    if (record.id && record.id.indexOf('temp-') !== 0) {
      this.resourcesService.enumerationValues.updateInEnumeratedType(this.parent.model, this.parent.id, record.id, resource).subscribe(() => {
        if (this.afterSave) {
          this.afterSave.emit(resource);
        }
        record.key = resource.key;
        record.value = resource.value;
        record.category = resource.category;
        record.inEdit = false;
        this.editingService.setFromCollection(this.displayItems);

        this.reloadRecordsFromServer().subscribe((data) => {
          this.showRecords(data.body.enumerationValues);
        });

        this.messageHandler.showSuccess('Enumeration updated successfully.');
      }, error => {

        this.messageHandler.showError('There was a problem updating the enumeration.', error);
      });
    } else {
      this.resourcesService.enumerationValues.saveToEnumeratedType(this.parent.model, this.parent.id, resource).subscribe(() => {
        this.reloadRecordsFromServer().subscribe(data => {
          this.showRecords(data.body.enumerationValues);
        });
        this.messageHandler.showSuccess('Enumeration saved successfully.');
      }, error => {
        this.messageHandler.showError('There was a problem saving the enumeration.', error);
      });
    }
  }

  onCategorySelect(selectedValue, record) {
    if (selectedValue == null || (selectedValue && selectedValue.key === -1)) {
      return;
    }

    record.category = selectedValue.key;
  }

  onCategoryTextUpdated(text, record) {
    record.category = text;
  }

  reloadRecordsFromServer() {
    return this.resourcesService.dataType.get(this.parent.model, this.parent.id);
  }

  pageSizeClicked(paginator) {
    this.pageSize = paginator.pageSize;
    this.currentPage = paginator.pageIndex;
    this.showRecords(this.allRecords);
  }
}

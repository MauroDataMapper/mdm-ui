import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { ElementTypesService } from '../../services/element-types.service';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { Categories } from '../../model/dataModelModel';

@Component({
  selector: 'mdm-element-data-type',
  templateUrl: './element-data-type.component.html',
  styleUrls: ['./element-data-type.component.sass']
})
export class ElementDataTypeComponent implements OnInit {
  constructor(
    private stateHandler: StateHandlerService,
    private elementTypes: ElementTypesService
  ) {}

  @Input() elementDataType: any;
  @Input() hideName: boolean;
  @Input() onlyShowRefDataClass: boolean;
  @Input() hideEnumList: boolean;
  @Input() initiallyShowEnumList: boolean;
  @Input() mcParentDataModel: any;
  @Input() newWindow: boolean;
  @Input() showTypeName: boolean;

  showMoreIcon: boolean;
  showing = false;
  referenceClass: any;
  referenceClassLink: any;
  link: any;
  categories: any[];
  allRecords: any[];
  enumsCount: number;
  hasCategory: boolean;
  allRecordsWithGroups: any[];

  // default values
  showCount = 5;
  toggleShowEnums = false;

  ngOnInit() {
    if (this.elementDataType !== null && this.elementDataType !== undefined) {
      let parentDataModelId = this.mcParentDataModel
        ? this.mcParentDataModel.id
        : null;
      if (!parentDataModelId) {
        parentDataModelId = this.elementDataType.dataModel;
      }

      if (
        this.elementDataType.domainType === 'ReferenceType' &&
        this.elementDataType.referenceClass
      ) {
        this.referenceClass = this.elementDataType.referenceClass;
        this.referenceClassLink = this.stateHandler.getURL('dataclass', {
          id: this.elementDataType.referenceClass.id,
          dataModelId: parentDataModelId
        });
      }

      this.link = this.elementTypes.getLinkUrl(this.elementDataType);
    }

    if (this.elementDataType.enumerationValues !== null) {
      if (
        this.elementDataType &&
        this.elementDataType.domainType === 'EnumerationType'
      ) {
        // Handle Category in enum
        // ...........................................................................
        this.categories = [];
        this.allRecords = [].concat(this.elementDataType.enumerationValues);
        this.enumsCount = this.allRecords.length;
        this.hasCategory = false;
        for (const element of this.allRecords) {
          if (element && element.category) {
            this.hasCategory = true;
            break;
          }
        }

        const categories = from(this.allRecords).pipe(
          groupBy(record => record.category),
          mergeMap(group => group.pipe(toArray()))
        );

        categories.subscribe((cats: Categories[]) => {
          const categoryNames = [];
          let hasEmptyCategory = false;

          cats.forEach(x => {
            if (x.category !== null) {
              categoryNames.push(x.category);
            } else {
              hasEmptyCategory = true;
            }
          });

          if (hasEmptyCategory) {
            categoryNames.push(null);
          }

          this.allRecordsWithGroups = [];
          categoryNames.forEach(category => {
            // categories[category] = categories[category].sortBy('index');

            if (category !== null) {
              this.categories.push({ key: category, value: category });
            }

            this.allRecordsWithGroups.push({
              id: category !== null ? category : null,
              category: category !== null ? category : null,
              isCategoryRow: true
            });

            cats.filter(x => x.category === category)
              .forEach(row => {
                this.allRecordsWithGroups.push(row);
              });
          });
          // ...........................................................................

          if (this.allRecordsWithGroups.length > this.showCount) {
            this.showMoreIcon = true;
            this.showing = false;
          }
        });
      }
    }
  }

  showMore = (element: any) => {
    if (this.showMoreIcon && !this.showing) {
      const elements = element.parentElement.offsetParent.getElementsByClassName(
        'moreEnumerationKeyValue'
      );
      for (const elem of elements) {
        elem.classList.remove('hiddenMoreEnumerationKeyValue');
      }
      element.innerHTML = `hide <i class='fas fa-caret-down fa-xs'></i>`;
    } else {
      const elements = element.parentElement.offsetParent.getElementsByClassName(
        'moreEnumerationKeyValue'
      );
      for (const elem of elements) {
        elem.classList.add('hiddenMoreEnumerationKeyValue');
      }
      element.innerHTML = `... more <i class='fas fa-caret-down fa-xs'></i>`;
    }
    this.showing = !this.showing;
  };

  showEnums = () => {
    this.toggleShowEnums = !this.toggleShowEnums;
  }
}

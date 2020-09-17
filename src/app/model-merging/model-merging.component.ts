/*
Copyright 2020 University of Oxford

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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '../services/validator.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateService } from '@uirouter/core';
import { Observable } from 'rxjs';
import { async } from '@angular/core/testing';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-model-merging',
  templateUrl: './model-merging.component.html',
  styleUrls: ['./model-merging.component.scss'],
})
export class ModelMergingComponent implements OnInit {
  diffMap = {};
  diffMapLeft = {};
  diffMapRight = {};
  max = 100;
  dynamic = 100;
  diffsSource: any;
  diffsTarget: any;
  diffsMerged: any;

  processing: boolean;
  activeTab: any;

  diffElements = ['dataClasses', 'dataElements', 'dataTypes'];
  diffProps = ['label', 'description', 'author', 'organisation'];

  sourceModel: any;
  targetModel: any;
  mergedModel: any;

  outstandingErrors = 0;

  form = {
    dataTypeFilter: null,
    dataElementFilter: null,
  };

  constructor(
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private stateService: StateService,
    private changeDetector: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  async ngOnInit() {
    const sourceId = this.stateService.params.sourceId;
    const targetId = this.stateService.params.targetId;

    if (sourceId) {
      this.sourceModel = await this.loadDataModelDetail(sourceId);
    }

    if (targetId) {
      this.targetModel = await this.loadDataModelDetail(targetId);
      this.mergedModel = Object.assign({}, this.targetModel);
      this.mergedModel.branchName = '';
      this.runDiff();
    } else {
      this.retrieveMainBranchModel();
    }
  }

  retrieveMainBranchModel = () => {
    this.resources.versioning
      .currentMainBranch('dataModels', this.sourceModel.id)
      .subscribe(async (result) => {
        this.targetModel = await this.loadDataModelDetail(result.body.id);
        this.mergedModel = Object.assign({}, this.targetModel);
        this.mergedModel.branchName = '';
        this.runDiff();

      });
  };

  async loadDataModelDetail(modelId) {
    if (!modelId) {
      return null;
    }

    const response = await this.resources.dataModel.get(modelId).toPromise();
    const model = response.body;
    const children = await this.resources.tree
      .get('dataModels', model.domainType, model.id)
      .toPromise();
    model.children = children.body;
    if (model.children?.length > 0) {
      model.hasChildren = true;
    }
    return model;
  }

  autoMerge(left: any, right: any) {
    Object.entries(left).forEach((element: any) => {
      const [key, value] = element;
      Object.entries(right).forEach((el: any) => {
        const [key, value] = el;
        if (element[0] === el[0]) {
          element[1].forEach((itemS) => {
            el[1].forEach((itemT) => {
              if (itemS.title === itemT.title) {
                if (itemS.left === itemT.left) {
                  // this.diffsMerged.push(element);
                }
              }
            });
          });
        }
      });
    });
  }

  modifiedParents = (breadcrumbs, diffMap) => {
    if (!breadcrumbs) {
      return;
    }
    breadcrumbs.forEach((element, index) => {
      this.initDiff(element.id, diffMap);

      // Not deleted & Not modified -> modified
      if (!diffMap[element.id].deleted && !diffMap[element.id].created) {
        diffMap[element.id].modified = true;
        diffMap[element.id].deleted = false;
        diffMap[element.id].created = false;
      }
    });
  };

  initDiff = (id, diffMap) => {
    if (diffMap[id]) {
      return;
    }
    diffMap[id] = {
      id,
      diffs: {
        properties: [],
        metadata: [],
        enumerationValues: [],

        dataTypes: [],
        dataClasses: [],
        dataElements: [],
      },
    };
  };

  onCommitChanges()
  {
    if(Object.keys(this.diffsMerged).length > 0)
    {
      const dialog = this.dialog.open(CheckInModalComponent, {  data: {
        deleteSourceBranch: false        
      }  
      });

      dialog.afterClosed().subscribe(result => {
        if(result){
          //Commit Changes
        }
      })
    }
  }

  findDiffDataTypeChanges = (leftId, rightId, dataTypeDiff, diffMap) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    const update = {
      property: 'dataType',
      title: 'DataType',
      left: dataTypeDiff.left,
      right: dataTypeDiff.right,
    };
    diffMap[leftId].diffs.properties.push(update);
    diffMap[rightId].diffs.properties.push(update);
  };

  findDiffProps = (propName, leftId, rightId, labelDiff, diffMap) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    const update = {
      property: propName,
      title: this.validator.capitalize(propName),
      modified: true,
      left:
        !labelDiff.left || labelDiff.left === 'null' ? "' '" : labelDiff.left,
      right:
        !labelDiff.right || labelDiff.right === 'null'
          ? "' '"
          : labelDiff.right,
    };

    diffMap[leftId].diffs.properties.push(update);
    diffMap[rightId].diffs.properties.push(update);
  };

  findDiffMetadata = (leftId, rightId, metadataDiff, diffMap) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    if (metadataDiff.created) {
      metadataDiff.created.forEach((created) => {
        created.created = true;
        diffMap[leftId].diffs.metadata.push(created);
        diffMap[rightId].diffs.metadata.push(created);
      });
    }
    if (metadataDiff.deleted) {
      metadataDiff.deleted.forEach((deleted) => {
        deleted.deleted = true;
        diffMap[leftId].diffs.metadata.push(deleted);
        diffMap[rightId].diffs.metadata.push(deleted);
      });
    }
    if (metadataDiff.modified) {
      metadataDiff.modified.forEach((modified) => {
        const update = {
          leftId: modified.leftId,
          rightId: modified.rightId,
          key: modified.key,
          namespace: modified.namespace,
          property: 'value',
          left: modified.diffs[0].value.left,
          right: modified.diffs[0].value.right,
          modified: true,
        };
        diffMap[leftId].diffs.metadata.push(update);
        diffMap[rightId].diffs.metadata.push(update);
      });
    }
  };

  findDiffEnumerationValues = (
    leftId,
    rightId,
    enumerationValuesDiff,
    diffMap
  ) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    if (enumerationValuesDiff.created) {
      enumerationValuesDiff.created.forEach((created) => {
        created.created = true;
        diffMap[leftId].diffs.enumerationValues.push(created);
        diffMap[rightId].diffs.enumerationValues.push(created);
      });
    }
    if (enumerationValuesDiff.deleted) {
      enumerationValuesDiff.deleted.forEach((deleted) => {
        deleted.deleted = true;
        diffMap[leftId].diffs.enumerationValues.push(deleted);
        diffMap[rightId].diffs.enumerationValues.push(deleted);
      });
    }

    if (enumerationValuesDiff.modified) {
      enumerationValuesDiff.modified.forEach((modified) => {
        const update = {
          leftId: modified.leftId,
          rightId: modified.rightId,
          label: modified.label,
          property: 'value',
          left: modified.diffs[0].value.left,
          right: modified.diffs[0].value.right,
          modified: true,
        };
        diffMap[leftId].diffs.enumerationValues.push(update);
        diffMap[rightId].diffs.enumerationValues.push(update);
      });
    }
  };

  runDiff = () => {
    if (!this.sourceModel || !this.targetModel) {
      return;
    }

    this.diffMap = {};
    this.diffsTarget = [];
    this.diffsSource = [];
    this.diffsMerged = [];
    let diffs = [];
    this.processing = true;

    this.resources.versioning
      .mergeDiff('dataModels', this.sourceModel.id, this.targetModel.id)
      .subscribe(
        (res) => {
          this.processing = false;
          const result = res.body.threeWayDiff ;

          this.diffMapLeft = {};
          this.diffMapRight = {};

          // Run for DataModel
          this.calculateDiff(result.left, this.diffMapLeft);
          this.calculateDiff(result.right, this.diffMapRight);
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem getting merge diff.',
            error
          );
          this.processing = false;
        }
      );
  };

  calculateOutstandingIssues(){
    let countSource = 0;
    
    Object.keys(this.diffsSource).forEach(item => {
      const items = this.diffsSource[item];
      countSource = countSource + items.length;
    })

   
    let countMerge = 0;

     Object.keys(this.diffsMerged).forEach(item => {
      const items = this.diffsMerged[item];
      countMerge = countMerge + items.length;
    })

    this.outstandingErrors =  countSource - countMerge;
  }

  onNodeExpand = (node) => {
    const obs = new Observable((sub) => {
      this.resources.tree.get('dataModels', node.domainType, node.id).subscribe(
        (res) => {
          const result = res.body;
          result.forEach((dc) => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });
          sub.next(result);
        },
        () => {}
      );
    });
    return obs;
  };

  useTarget() {}

  onNodeClick = () => {
    this.diffsSource = [];
    this.diffsTarget = [];

    this.diffsSource = this.determineDiffs(
      this.sourceModel.id,
      this.diffMapLeft
    );
    this.diffsTarget = this.determineDiffs(
      this.targetModel.id,
      this.diffMapRight
    );

    this.autoMerge(this.diffsSource, this.diffsTarget);
    this.autoMerge(this.diffsTarget, this.diffsSource);
  };

  private determineDiffs(id: any, diffMap: any) {
    const diffs = diffMap[id].diffs;

    diffs.filteredDataTypes = Object.assign([], diffs.dataTypes);
    diffs.filteredDataElements = Object.assign([], diffs.dataElements);

    this.form = {
      dataTypeFilter: null,
      dataElementFilter: null,
    };

    return diffs;
  }

  onAcceptPress = (diff: any, diffLocation: any) => {
    if (this.diffsMerged.properties === undefined) {
      this.diffsMerged = [];
      this.diffsMerged.properties = [];
      this.diffsMerged.dataClasses = [];
    }

    if (diff.property !== undefined) {
      let found = false;
      for (let index = 0; index < this.diffsMerged.properties.length; index++) {
        const element = this.diffsMerged.properties[index];
        if (element.property == diff.property) {
          if (diff.accept) {
            this.diffsMerged.properties[index] = diff;
            if (diffLocation === 'source') {
              var i = this.diffsTarget.properties.findIndex(
                (x) => x.property == element.property
              );
              if (i >= 0) {
                this.diffsTarget.properties[i].accept = false;
              }
            } else {
              var i = this.diffsSource.properties.findIndex(
                (x) => x.property == element.property
              );
              if (i >= 0) {
                this.diffsSource.properties[i].accept = false;
              }
            }
          } else {
            this.diffsMerged.properties.splice(index, 1);
          }
          found = true;
        }
      }

      if (!found) {
        this.diffsMerged.properties.push(diff);
      }
    } else {
      let found = false;
      for (
        let index = 0;
        index < this.diffsMerged.dataClasses.length;
        index++
      ) {
        const element = this.diffsMerged.dataClasses[index];
        if (element.label == diff.label) {
          if (diff.accept) {
            this.diffsMerged.dataClasses[index] = diff;
            if (diffLocation === 'source') {
              var i = this.diffsTarget.dataClasses.findIndex(
                (x) => x.label == element.label
              );
              if (i >= 0) {
                this.diffsTarget.dataClasses[i].accept = false;
              }
            } else {
              var i = this.diffsSource.dataClasses.findIndex(
                (x) => x.label == element.label
              );
              if (i >= 0) {
                this.diffsSource.dataClasses[i].accept = false;
              }
            }
          } else {
            this.diffsMerged.dataClasses.splice(index, 1);
          }
          found = true;
        }
      }

      if (!found) {
        this.diffsMerged.dataClasses.push(diff);
      }
    }
    this.calculateOutstandingIssues()
  };

  private calculateDiff(result: any, diffMap: {}) {
    result.diffs.forEach((diff) => {
      if (diff.label) {
        this.findDiffProps(
          'label',
          result.leftId,
          result.rightId,
          diff.label,
          diffMap
        );
      }
      if (diff.description) {
        this.findDiffProps(
          'description',
          result.leftId,
          result.rightId,
          diff.description,
          diffMap
        );
      }
      if (diff.author) {
        this.findDiffProps(
          'author',
          result.leftId,
          result.rightId,
          diff.author,
          diffMap
        );
      }
      if (diff.organisation) {
        this.findDiffProps(
          'organisation',
          result.leftId,
          result.rightId,
          diff.organisation,
          diffMap
        );
      }

      if (diff.metadata) {
        this.findDiffMetadata(
          result.leftId,
          result.rightId,
          diff.metadata,
          diffMap
        );
      }

      this.diffElements.forEach((diffElement) => {
        if (!diff[diffElement]) {
          return;
        }

        diff[diffElement].created?.forEach((el) => {
          this.initDiff(el.id, diffMap);
          diffMap[el.id].id = el.id;
          diffMap[el.id].created = true;
          el.created = true;
          el.deleted = false;
          el.modified = false;

          if (diffElement === 'dataClasses') {
            this.modifiedParents(el.breadcrumbs, diffMap);
            el.deleted = false;
            el.created = true;
            el.modified = false;
            const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
            diffMap[parentDC.id].diffs.dataClasses.push(el);
          }

          if (diffElement === 'dataElements' && el.breadcrumbs) {
            this.modifiedParents(el.breadcrumbs, diffMap);

            const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);
            el.created = true;
            el.modified = false;
            el.deleted = false;
            el.domainType = 'DataElement';
            diffMap[parentDC.id].diffs.dataElements.push(el);
          }

          if (diffElement === 'dataTypes') {
            this.modifiedParents([{ id: this.sourceModel.id }], diffMap);
            this.modifiedParents([{ id: this.targetModel.id }], diffMap);

            this.initDiff(this.sourceModel.id, diffMap);
            this.initDiff(this.targetModel.id, diffMap);

            el.created = true;
            el.modified = false;
            el.deleted = false;
            el.domainType = 'DataType';

            diffMap[this.sourceModel.id].diffs.dataTypes.push(el);
            diffMap[this.targetModel.id].diffs.dataTypes.push(el);
          }
        });

        diff[diffElement].deleted?.forEach((el) => {
          this.initDiff(el.id, diffMap);
          diffMap[el.id].id = el.id;
          diffMap[el.id].deleted = true;
          el.deleted = true;
          el.created = false;
          el.modified = false;

          if (diffElement === 'dataClasses') {
            if (el.breadcrumbs) {
              el.deleted = true;
              el.created = false;
              el.modified = false;
              this.modifiedParents(
                el.breadcrumbs.slice(0, el.breadcrumbs.length - 1),
                diffMap
              );
              const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
              diffMap[this.targetModel.id].diffs.dataClasses.push(el);
              diffMap[this.sourceModel.id].diffs.dataClasses.push(el);
            }
          }
          if (diffElement === 'dataElements' && el.breadcrumbs) {
            this.modifiedParents(el.breadcrumbs, diffMap);

            const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);
            el.deleted = true;
            el.created = false;
            el.modified = false;
            el.domainType = 'DataElement';
            diffMap[parentDC.id].diffs.dataElements.push(el);
          }

          if (diffElement === 'dataTypes') {
            this.modifiedParents([{ id: this.sourceModel.id }], diffMap);
            this.modifiedParents([{ id: this.targetModel.id }], diffMap);

            this.initDiff(this.sourceModel.id, diffMap);
            this.initDiff(this.targetModel.id, diffMap);
            el.deleted = true;
            el.created = false;
            el.modified = false;
            el.domainType = 'DataType';
            diffMap[this.sourceModel.id].diffs.dataTypes.push(el);
            diffMap[this.targetModel.id].diffs.dataTypes.push(el);
          }
        });

        diff[diffElement].modified?.forEach((el) => {
          this.initDiff(el.leftId, diffMap);
          diffMap[el.leftId].modified = true;
          diffMap[el.leftId].id = el.leftId;

          this.initDiff(el.rightId, diffMap);
          diffMap[el.rightId].modified = true;
          diffMap[el.rightId].id = el.rightId;

          if (diffElement === 'dataClasses') {
            if (el.leftBreadcrumbs) {
              this.modifiedParents(
                el.leftBreadcrumbs.slice(0, el.leftBreadcrumbs.length - 1),
                diffMap
              );
            }
            if (el.rightBreadcrumbs) {
              this.modifiedParents(
                el.rightBreadcrumbs.slice(0, el.rightBreadcrumbs.length - 1),
                diffMap
              );
            }
          }

          if (diffElement === 'dataElements' && el.leftBreadcrumbs) {
            this.modifiedParents(el.leftBreadcrumbs, diffMap);

            const parentDC = el.leftBreadcrumbs[el.leftBreadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);
            el.modified = true;
            el.created = false;
            el.deleted = false;
            el.domainType = 'DataElement';
            diffMap[parentDC.id].diffs.dataElements.push(el);
          }

          if (diffElement === 'dataElements' && el.rightBreadcrumbs) {
            this.modifiedParents(el.rightBreadcrumbs, diffMap);

            const parentDC =
              el.rightBreadcrumbs[el.rightBreadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);
            el.modified = true;
            el.created = false;
            el.deleted = false;
            el.domainType = 'DataElement';
            diffMap[parentDC.id].diffs.dataElements.push(el);
          }

          if (diffElement === 'dataTypes' && el.leftBreadcrumbs) {
            this.modifiedParents(el.leftBreadcrumbs, diffMap);

            const parentDM = el.leftBreadcrumbs[0];
            this.initDiff(parentDM.id, diffMap);
            el.modified = true;
            el.deleted = false;
            el.created = false;
            el.domainType = 'DataType';
            diffMap[parentDM.id].diffs.dataTypes.push(el);
          }

          if (diffElement === 'dataTypes' && el.rightBreadcrumbs) {
            this.modifiedParents(el.rightBreadcrumbs, diffMap);

            const parentDM = el.rightBreadcrumbs[0];
            this.initDiff(parentDM.id, diffMap);
            el.modified = true;
            el.deleted = false;
            el.created = false;
            el.domainType = 'DataType';
            diffMap[parentDM.id].diffs.dataTypes.push(el);
          }

          // Run for Element
          el.diffs.forEach((diff) => {
            if (diff.label) {
              this.findDiffProps(
                'label',
                el.leftId,
                el.rightId,
                diff.label,
                diffMap
              );
            }
            if (diff.description) {
              this.findDiffProps(
                'description',
                el.leftId,
                el.rightId,
                diff.description,
                diffMap
              );
            }
            if (diff.author) {
              this.findDiffProps(
                'author',
                el.leftId,
                el.rightId,
                diff.author,
                diffMap
              );
            }
            if (diff.organisation) {
              this.findDiffProps(
                'organisation',
                el.leftId,
                el.rightId,
                diff.organisation,
                diffMap
              );
            }
            if (diff.minMultiplicity) {
              this.findDiffProps(
                'minMultiplicity',
                el.leftId,
                el.rightId,
                diff.minMultiplicity,
                diffMap
              );
            }
            if (diff.maxMultiplicity) {
              this.findDiffProps(
                'maxMultiplicity',
                el.leftId,
                el.rightId,
                diff.maxMultiplicity,
                diffMap
              );
            }

            if (diff.metadata) {
              this.findDiffMetadata(
                el.leftId,
                el.rightId,
                diff.metadata,
                diffMap
              );
            }

            if (diffElement === 'dataTypes' && diff.enumerationValues) {
              this.findDiffEnumerationValues(
                el.leftId,
                el.rightId,
                diff.enumerationValues,
                diffMap
              );
            }

            if (diffElement === 'dataElements' && diff['dataType.label']) {
              this.findDiffDataTypeChanges(
                el.leftId,
                el.rightId,
                diff['dataType.label'],
                diffMap
              );
            }
          });
        });
      });
    });
    this.diffMap = diffMap;

    if (this.diffMap[this.sourceModel.id]) {
      this.sourceModel.modified = this.diffMap[this.sourceModel.id].modified;
    }

    if (this.diffMap[this.targetModel.id]) {
      this.targetModel.modified = this.diffMap[this.targetModel.id].modified;
    }

    this.sourceModel.children.forEach((dc) => {
      if (this.diffMap[dc.id]) {
        dc.deleted = this.diffMap[dc.id].deleted;
        dc.created = this.diffMap[dc.id].created;
        dc.modified = this.diffMap[dc.id].modified;
      }
    });

    this.targetModel.children.forEach((dc) => {
      if (this.diffMap[dc.id]) {
        dc.deleted = this.diffMap[dc.id].deleted;
        dc.created = this.diffMap[dc.id].created;
        dc.modified = this.diffMap[dc.id].modified;
      }
    });
  }
}

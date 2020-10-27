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
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '../services/validator.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateService } from '@uirouter/core';
import { Observable } from 'rxjs';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { StateHandlerService } from '@mdm/services';
import { DomSanitizer } from '@angular/platform-browser';
import { ResolveMergeConflictModalComponent } from '@mdm/modals/resolve-merge-conflict-modal/resolve-merge-conflict-modal.component';
import { isUndefined } from 'lodash';
import { async } from '@angular/core/testing';

@Component({
  selector: 'mdm-model-merging',
  templateUrl: './model-merging.component.html',
  styleUrls: ['./model-merging.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModelMergingComponent implements OnInit {
  diffMap = {};

  max = 100;
  dynamic = 100;

  diffs: any;
  diffsMerged: any;

  useSource: boolean;

  processing: boolean;
  activeTab: any;
  selectedLeftId: any;
  selectedRightId: any;

  diffElements = ['dataClasses', 'dataElements', 'dataTypes'];
  diffProps = ['label', 'description', 'author', 'organisation', 'aliases'];

  sourceModel: any;
  targetModel: any;
  mergedModel: any;

  left: any;
  right: any;
  diffResult: any;

  outstandingErrors = 0;

  form = {
    dataTypeFilter: null,
    dataElementFilter: null
  };

  constructor(
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
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

    model.children = children.body;
    if (model.children?.length > 0) {
      model.hasChildren = true;
    }

    if (model.hasChildren) {
      await this.getChildren(model);
    }

    return model;
  }

  private getChildren(model: any) {
    new Promise((resolve, rej) => {
      let promiseColl: Array<any> = [];

      model.children.forEach((child) => {
        const children = this.resources.tree
          .get('dataModels', child.domainType, child.id)
          .toPromise()
          .then((res) => (child.children = res.body));

        promiseColl.push(children);
      });

      Promise.all(promiseColl).then(() => resolve());
    });
  }

  autoMerge(left: any, right: any) {
    Object.entries(left).forEach((element: any) => {
      const [] = element;
      Object.entries(right).forEach((el: any) => {
        const [] = el;
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
    breadcrumbs.forEach((element) => {
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
        dataElements: []
      }
    };
  };

  createDiffMap(fieldName: string, element: any) {
    let map: Array<any> = [];

    for (let index = 1; index < element.breadcrumbs.length; index++) {
      const el = element.breadcrumbs[index];
      if (index === element.breadcrumbs.length) {
      }
    }
  }

  onCommitChanges() {
    if (Object.keys(this.diffsMerged).length > 0) {
      const dialog = this.dialog.open(CheckInModalComponent, {
        data: {
          deleteSourceBranch: false
        }
      });

      dialog.afterClosed().subscribe((result) => {
        if (result) {
          let dif: Array<any> = [];

          if (this.diffsMerged.dataClasses) {
            let createdDc: Array<any> = [];
            let deletedDc: Array<any> = [];
            let modifiedDc: Array<any> = [];

            this.diffsMerged.dataClasses.forEach((dc) => {
              if (dc.created) {
                const createdDiff = {
                  id: dc.id
                };
                createdDc.push(createdDiff);
              }
              if (dc.deleted) {
                const createdDiff = {
                  id: dc.id
                };
                deletedDc.push(createdDiff);
              }

              if (dc.modified) {
              }
            });

            const newDcDiff = {
              fieldName: 'dataClasses',
              created: createdDc,
              deleted: deletedDc,
              modified: modifiedDc
            };

            dif.push(newDcDiff);
          }

          if (this.diffsMerged.dataTypes) {
            let createdTypes: Array<any> = [];
            let deletedTypes: Array<any> = [];

            this.diffsMerged.dataTypes.forEach((dt) => {
              if (dt.created) {
                const createdDiff = {
                  id: dt.id
                };
                createdTypes.push(createdDiff);
              }
              if (dt.deleted) {
                const createdDiff = {
                  id: dt.id
                };
                deletedTypes.push(createdDiff);
              }
            });

            const newTypeDiff = {
              fieldName: 'dataTypes',
              created: createdTypes,
              deleted: deletedTypes
            };

            dif.push(newTypeDiff);
          }

          this.diffsMerged.properties.forEach((element) => {
            let value;
            if (element.acceptTarget) {
              value = element.left;
            }

            if (element.acceptSource && !element.acceptTarget) {
              value = element.right;
            }

            const newDiff = {
              fieldName: element.property,
              value: value
            };
            dif.push(newDiff);
          });

          var data = {
            patch: {
              rightId: this.sourceModel.id,
              leftId: this.targetModel.id,
              diffs: dif
            }
          };

          this.resources.versioning
            .mergeInto(this.sourceModel.id, this.targetModel.id, data)
            .subscribe(
              () => {
                this.messageHandler.showSuccess('Commit Successful');
                this.stateHandler.Go(
                  'dataModel',
                  { id: this.targetModel.id, reload: true, location: true },
                  null
                );
              },
              (err) => {
                this.messageHandler.showError(
                  'There has been error merging the data, please try again - ' +
                    err.message,
                  'Error Merging'
                );
              }
            );
        }
      });
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
      right: dataTypeDiff.right
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
      leftId,
      rightId,
      modified: true,
      left:
        !labelDiff.left || labelDiff.left === 'null' ? "' '" : labelDiff.left,
      right:
        !labelDiff.right || labelDiff.right === 'null' ? "' '" : labelDiff.right
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
          modified: true
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
          modified: true
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
    this.diffs = [];
    this.diffsMerged = [];

    this.processing = true;

    this.resources.versioning
      .mergeDiff('dataModels', this.sourceModel.id, this.targetModel.id)
      .subscribe(
        (res) => {
          this.processing = false;
          const result = res.body;

          this.diffMap = {};
          this.initDiff(this.targetModel.id, this.diffMap);
          this.initDiff(this.sourceModel.id, this.diffMap);

          // Run for DataModel
          this.calculateDiff(result, this.diffMap);
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

  calculateOutstandingIssues() {
    let countSource = 0;

    Object.keys(this.diffs).forEach((item) => {
      const items = this.diffs[item];
      countSource = countSource + items.length;
    });

    let countMerge = 0;

    Object.keys(this.diffsMerged).forEach((item) => {
      const items = this.diffsMerged[item];
      countMerge = countMerge + items.length;
    });

    this.outstandingErrors = countSource - countMerge;
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

  searchForNode(model: any, label: any) {
    let result: any;
    while (!result) {
      if (model.children) {
        result = model.children.find((el) => el.label === label);
        if (!result) {
          model.children.forEach((child) => {
            result = this.searchForNode(child, label);
            if(!result)
            {
              return result;
            }
          });
          return result;
         }
      } else {
        return result;
      }
    }
    return result;
  }

  onNodeClick = (node: any) => {
    this.diffs = [];
    let source;
    let target;

    if (node.domainType === 'DataModel') {
      source = this.sourceModel;
      target = this.targetModel;
    } else {
      source = this.searchForNode(this.sourceModel, node.label);
      target = this.searchForNode(this.targetModel, node.label); 
    }

    let tempDiffsSource = [];
    let tempDiffTarget = [];

    if (source) {
      this.selectedLeftId = source.id;
      tempDiffsSource = this.determineDiffs(source.id, this.diffMap);
    }

    if (target) {
      this.selectedRightId = target.id;
      tempDiffTarget = this.determineDiffs(target.id, this.diffMap);
    }

    this.diffs = this.mergeArrays(tempDiffTarget, tempDiffsSource);
  };

  private mergeArrays(source, target) {
    let jointArray = {};

    jointArray['dataElements'] = [
      ...new Set([...source.dataElements, ...target.dataElements])
    ];
    jointArray['dataClasses'] = [
      ...new Set([...source.dataClasses, ...target.dataClasses])
    ];
    jointArray['dataTypes'] = [
      ...new Set([...source.dataTypes, ...target.dataTypes])
    ];
    jointArray['enumerationValues'] = [
      ...new Set([...source.enumerationValues, ...target.enumerationValues])
    ];
    jointArray['filteredDataElements'] = target.filteredDataElements;
    jointArray['filteredDataTypes'] = target.filteredDataTypes;
    jointArray['filteredDataClasses'] = target.filteredDataClasses;

    jointArray['metadata'] = [
      ...new Set([...source.metadata, ...target.metadata])
    ];
    jointArray['properties'] = [
      ...new Set([...source.properties, ...target.properties])
    ];

    return jointArray;
  }

  private determineDiffs(id: any, diffMap: any) {
    const diffMapForId = diffMap[id];

    if (diffMapForId) {
      const diffs = diffMapForId.diffs;

      let tempDataElementDiffs = [];
      let tempDataClassesDiff = [];
      let tempDataTypesDiff = [];

      diffs.dataElements.forEach((element) => {
        if (element.deleted === false) {
          if (element.breadcrumbs[0].id === this.targetModel.id) {
            tempDataElementDiffs.push(element);
          }
        }
      });

      diffs.dataClasses.forEach((element) => {
        if (element.deleted === false) {
          if (element.breadcrumbs[0].id === this.targetModel.id) {
            tempDataClassesDiff.push(element);
          }
        }
      });

      diffs.dataTypes.forEach((element) => {
        if (element.deleted === false) {
          if (element.breadcrumbs[0].id === this.targetModel.id) {
            tempDataTypesDiff.push(element);
          }
        }
      });

      diffs.filteredDataTypes = Object.assign([], tempDataTypesDiff);
      diffs.filteredDataElements = Object.assign([], tempDataElementDiffs);
      diffs.filteredDataClasses = Object.assign([], tempDataClassesDiff);

      return diffs;
    }
    return {
      dataElements: [],
      dataClasses: [],
      properties: [],
      dataTypes: [],
      metadata: [],
      enumerationValues: [],
      filteredDataTypes: [],
      filteredDataElements: [],
      filteredDataClasses: []
    };
  }

  selectSource() {
    if (!this.useSource) {
      this.diffsMerged = [];
    }

    this.diffs.dataClasses.forEach((dataClass) => {
      dataClass.acceptSource = true;
      dataClass.acceptTarget = false;
      this.onAcceptPress(dataClass, 'source', 'dataClass');
    });

    this.diffs.dataElements.forEach((dataElement) => {
      dataElement.acceptSource = true;
      dataElement.acceptTarget = false;
      this.onAcceptPress(dataElement, 'source', 'dataElement');
    });

    this.diffs.dataTypes.forEach((dataType) => {
      dataType.acceptSource = true;
      dataType.acceptTarget = false;
    });

    this.diffs.properties.forEach((prop) => {
      prop.acceptSource = true;
      prop.acceptTarget = false;
      this.onAcceptPress(prop, 'source', 'property');
    });

    this.useSource = true;
  }

  selectTarget() {
    if (this.useSource) {
      this.diffsMerged = [];
    }

    this.diffs.dataClasses.forEach((dataClass) => {
      dataClass.acceptSource = false;
    });

    this.diffs.filteredDataClasses.forEach((dataClass) => {
      dataClass.acceptTarget = true;
      dataClass.acceptSource = false;
      this.onAcceptPress(dataClass, 'target', 'dataClass');
    });

    this.diffs.dataElements.forEach((dataElement) => {
      dataElement.acceptSource = false;
    });

    this.diffs.filteredDataElements.forEach((dataElement) => {
      dataElement.acceptTarget = true;
      dataElement.acceptSource = false;
      this.onAcceptPress(dataElement, 'target', 'dataElement');
    });

    this.diffs.dataTypes.forEach((dataType) => {
      dataType.acceptTarget = true;
      dataType.acceptSource = false;
    });

    this.diffs.properties.forEach((prop) => {
      prop.acceptTarget = true;
      prop.acceptSource = false;
      this.onAcceptPress(prop, 'target', 'property');
    });

    this.useSource = false;
  }

  onAcceptPress = (diff: any, diffLocation: any, type: any) => {
    if (this.diffsMerged.properties === undefined) {
      this.diffsMerged.properties = [];
    }

    if (this.diffsMerged.dataClasses === undefined) {
      this.diffsMerged.dataClasses = [];
    }

    if (this.diffsMerged.dataElements === undefined) {
      this.diffsMerged.dataElements = [];
    }

    if (this.diffsMerged.dataTypes === undefined) {
      this.diffsMerged.dataTypes = [];
    }

    switch (type) {
      case 'property': {
        let found = false;
        for (
          let index = 0;
          index < this.diffsMerged.properties.length;
          index++
        ) {
          const element = this.diffsMerged.properties[index];
          if (element.property == diff.property) {
            if (diff.acceptTarget || diff.acceptSource) {
              if (diff.acceptTarget && diff.acceptSource) {
                const dialog = this.dialog.open(
                  ResolveMergeConflictModalComponent,
                  {
                    data: {
                      diffs: diff
                    }
                  }
                );

                dialog.afterClosed().subscribe((result) => {
                  if (result) {
                    const mergeDiff = Object.assign({}, result.data.diffs);
                    mergeDiff.left = result.data.mergeString;
                    this.diffsMerged.properties[index] = mergeDiff;
                  }
                });
              } else {
                this.diffsMerged.properties[index] = diff;
                if (diffLocation === 'source') {
                  var i = this.diffs.properties.findIndex(
                    (x) => x.property == element.property
                  );
                  if (i >= 0) {
                    this.diffs.properties[i].acceptTarget = false;
                  }
                } else {
                  var i = this.diffs.properties.findIndex(
                    (x) => x.property == element.property
                  );
                  if (i >= 0) {
                    this.diffs.properties[i].acceptSource = false;
                  }
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
        break;
      }
      case 'dataClass': {
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
                var i = this.diffs.dataClasses.findIndex(
                  (x) => x.label == element.label
                );
                if (i >= 0) {
                  this.diffs.dataClasses[i].accept = false;
                }
              } else {
                var i = this.diffs.dataClasses.findIndex(
                  (x) => x.label == element.label
                );
                if (i >= 0) {
                  this.diffs.dataClasses[i].accept = false;
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
        break;
      }
      case 'dataElement': {
        let found = false;
        for (
          let index = 0;
          index < this.diffsMerged.dataElements.length;
          index++
        ) {
          const element = this.diffsMerged.dataElements[index];
          if (element.label == diff.label) {
            if (diff.accept) {
              this.diffsMerged.dataElements[index] = diff;
              if (diffLocation === 'source') {
                var i = this.diffs.dataElements.findIndex(
                  (x) => x.label == element.label
                );
                if (i >= 0) {
                  this.diffs.dataElements[i].accept = false;
                }
              } else {
                var i = this.diffs.dataElements.findIndex(
                  (x) => x.label == element.label
                );
                if (i >= 0) {
                  this.diffs.dataElements[i].accept = false;
                }
              }
            } else {
              this.diffsMerged.dataElements.splice(index, 1);
            }
            found = true;
          }
        }

        if (!found) {
          this.diffsMerged.dataElements.push(diff);
        }
        break;
      }
      case 'dataType': {
        let found = false;
        for (
          let index = 0;
          index < this.diffsMerged.dataTypes.length;
          index++
        ) {
          const element = this.diffsMerged.dataTypes[index];
          if (element.label == diff.label) {
            if (diff.accept) {
              this.diffsMerged.dataTypes[index] = diff;
              if (diffLocation === 'source') {
                var i = this.diffs.dataTypes.findIndex(
                  (x) => x.label == element.label
                );
                if (i >= 0) {
                  this.diffs.dataTypes[i].accept = false;
                }
              } else {
                var i = this.diffs.dataTypes.findIndex(
                  (x) => x.label == element.label
                );
                if (i >= 0) {
                  this.diffs.dataTypes[i].accept = false;
                }
              }
            } else {
              this.diffsMerged.dataTypes.splice(index, 1);
            }
            found = true;
          }
        }

        if (!found) {
          this.diffsMerged.dataTypes.push(diff);
        }
        break;
      }
    }

    this.calculateOutstandingIssues();
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
      if (diff.a) {
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

        diff[diffElement].created?.forEach((item) => {
          const el = item.value ?? item;
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

        diff[diffElement].deleted?.forEach((item) => {
          const el = item.value ?? item;
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

        diff[diffElement].modified?.forEach((item) => {
          const el = item.value ?? item;
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
              el.modified = true;
              //  diffMap[parentDC.id].diffs.dataClasses.push(el);
            }
            if (el.rightBreadcrumbs) {
              this.modifiedParents(
                el.rightBreadcrumbs.slice(0, el.rightBreadcrumbs.length - 1),
                diffMap
              );
              el.modified = true;
              // diffMap[parentDC.id].diffs.dataClasses.push(el);
            }
            if (el.diffs.find((x) => x.dataClasses)) {
              const childDataClasses = {
                diffs: [el.diffs.find((x) => x.dataClasses)]
              };
              this.calculateDiff(childDataClasses, this.diffMap);
            }
          }

          if (diffElement === 'dataElements' && el.leftBreadcrumbs) {
            this.modifiedParents(el.leftBreadcrumbs, diffMap);

            const parentDC = el.leftBreadcrumbs[el.leftBreadcrumbs.length - 1];
            el.otherParentDC =
              el.rightBreadcrumbs[el.rightBreadcrumbs.length - 1];
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
            el.otherParentDC =
              el.leftBreadcrumbs[el.leftBreadcrumbs.length - 1];
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

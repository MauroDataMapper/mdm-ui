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
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '../services/validator.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateService } from '@uirouter/core';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { StateHandlerService } from '@mdm/services';
import { ResolveMergeConflictModalComponent } from '@mdm/modals/resolve-merge-conflict-modal/resolve-merge-conflict-modal.component';

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

  loaded = false;

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
    public dialog: MatDialog  ) {}

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

    const response = await this.resources.dataModel
      .get(modelId, { forDiff: true })
      .toPromise();
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
      this.getChildren(model).then(() => {
        // get third level
        model.children.forEach((child) => {
          this.getChildren(child).then(() => {
            // get forth level
            model.children.forEach((secondChild) => {
              this.getChildren(secondChild);
            });
          });
        });
      });
    }

    return model;
  }

  private getChildren(model: any) {
    const prom = new Promise((resolve) => {
      const promiseColl: Array<any> = [];

      model.children.forEach((child) => {
        const children = this.resources.tree
          .get('dataModels', child.domainType, child.id)
          .toPromise()
          .then((res) => {
            child.children = res.body;
          });

        promiseColl.push(children);
      });

      Promise.all(promiseColl).then(() => resolve());
    });

    return prom;
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

  createDiffMap(top: boolean, model: any) {
    const thingRet: any = {};

    if (top) {
      thingRet.rightId = this.sourceModel.id;
    }
    thingRet.leftId = model.id;

    const localDiff = [];
    localDiff.push(this.createDataClassElements(model));
    localDiff.push(this.createDataTypesElements(model));
    localDiff.push(this.createDataElementsElements(model));
    localDiff.push(this.createMetadataElements(model));

    const props = this.createPropertiesElements(model);
    for (let index = 0; index < props.length; index++) {
      const element = props[index];
      localDiff.push(element);
    }

    thingRet.diffs = localDiff;

    return thingRet;
  }

  createPropertiesElements(model: any) {
    const properties = [];

    this.diffsMerged.properties.forEach((element) => {
      let value;
      if (element.leftId === model.id || element.rightId === model.id) {
        if (element.acceptTarget) {
          value = element.left;
        }

        if (element.acceptSource && !element.acceptTarget) {
          value = element.right;
        }

        const newDiff = {
          fieldName: element.property,
          value
        };

        properties.push(newDiff);
      }
    });

    this.diffsMerged.dataElements.forEach((dateElement) => {
      if (dateElement.leftId === model.id || dateElement.rightId === model.id) {
      }
    });

    return properties;
  }

  createMetadataElements(model: any) {
    const objects: any = {};

    objects.fieldName = 'metadata';
    objects.created = [];
    objects.deleted = [];
    const tempMod = [];

    this.diffsMerged.metadata.forEach((dt) => {
      if (model.id === dt.parentLeftId || model.id === dt.parentRightId) {
        if (dt.created) {
          const createdDiff = {
            id: dt.value.id
          };
          objects.created.push(createdDiff);
        }

        if (dt.deleted) {
          const createdDiff = {
            id: dt.value.id
          };
          objects.deleted.push(createdDiff);
        }

        if (dt.modified) {

          const tempMeMod = [];
          const val = {
            fieldName: 'value',
            value: dt.acceptSource && !dt.acceptTarget ? dt.right : dt.left
          };

          tempMeMod.push(val);

          const mod = {
            leftId: dt.leftId,
            diffs:tempMeMod
          };
          tempMod.push(mod);
        }
      }
    });

    objects.modified = tempMod;

    return objects;
  }

  createDataTypesElements(model: any) {
    const objects: any = {};

    objects.fieldName = 'dataTypes';
    objects.created = [];
    objects.deleted = [];

    this.diffsMerged.dataTypes.forEach((dt) => {
      if (dt.created) {
        if (model.label === dt.breadcrumbs[dt.breadcrumbs.length - 1].label) {
          const createdDiff = {
            id: dt.id
          };
          objects.created.push(createdDiff);
        }
      }
      if (dt.deleted) {
        if (model.label === dt.breadcrumbs[dt.breadcrumbs.length - 1].label) {
          const createdDiff = {
            id: dt.id
          };
          objects.deleted.push(createdDiff);
        }
      }
    });

    const tempMod = [];
    if (model.children) {
      model.children.forEach((child) => {
        if (child.domainType === 'PrimitiveType') {
          tempMod.push(this.createDiffMap(false, child));
        }
      });
    }

    objects.modified = tempMod;

    return objects;
  }

  createDataElementsElements(model: any) {
    const objects: any = {};

    objects.fieldName = 'dataElements';
    objects.created = [];
    objects.deleted = [];

    this.diffsMerged.dataElements.forEach((de) => {
      if (!de.modified) {
        if (model.label === de.breadcrumbs[de.breadcrumbs.length - 1].label) {
          if (de.created) {
            const createdDiff = {
              id: de.id
            };
            objects.created.push(createdDiff);
          }

          if (de.deleted) {
            const createdDiff = {
              id: de.id
            };
            objects.deleted.push(createdDiff);
          }
        }
      }
    });

    const tempMod = [];
    if (model.children) {
      model.children.forEach((child) => {
        if (child.domainType === 'DataElement') {
          tempMod.push(this.createDiffMap(false, child));
        }
      });
    }

    objects.modified = tempMod;

    return objects;
  }

  createDataClassElements(model: any) {
    const objects: any = {};

    objects.fieldName = 'dataClasses';
    objects.created = [];
    objects.deleted = [];

    this.diffsMerged.dataClasses.forEach((dc) => {
      if (model.label === dc.breadcrumbs[dc.breadcrumbs.length - 1].label) {
        if (dc.created) {
          const createdDiff = {
            id: dc.id
          };
          objects.created.push(createdDiff);
        }

        if (dc.deleted) {
          const createdDiff = {
            id: dc.id
          };
          objects.deleted.push(createdDiff);
        }
      }
    });

    const tempMod = [];
    if (model.children) {
      model.children.forEach((child) => {
        if (child.domainType === 'DataClass') {
          tempMod.push(this.createDiffMap(false, child));
        }
      });
    }

    objects.modified = tempMod;

    return objects;
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
          const tr = this.createDiffMap(true, this.targetModel);

          const data = {
            patch: tr,
            deleteBranch: result.deleteSourceBranch
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
                  `There has been error merging the data, please try again - ${err.message}`,
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
        !labelDiff.left || labelDiff.left === 'null' ? '\' \'' : labelDiff.left,
      right:
        !labelDiff.right || labelDiff.right === 'null' ? '\' \'' : labelDiff.right
    };

    if (!labelDiff.isMergeConflict) {
      update['acceptSource'] = true;
      update['acceptTarget'] = false;
      this.onAcceptPress(update, 'source', 'property');
    }

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
        created.parentLeftId = leftId;
        created.parentRightId = rightId;
        diffMap[leftId].diffs.metadata.push(created);
        diffMap[rightId].diffs.metadata.push(created);

        if (!created.isMergeConflict) {
          created['acceptSource'] = true;
          created['acceptTarget'] = false;
          this.onAcceptPress(created, 'source', 'metadata');
        }
      });
    }
    if (metadataDiff.deleted) {
      metadataDiff.deleted.forEach((deleted) => {
        deleted.deleted = true;
        deleted.parentLeftId = leftId;
        deleted.parentRightId = rightId;
        diffMap[leftId].diffs.metadata.push(deleted);
        diffMap[rightId].diffs.metadata.push(deleted);
      });
    }
    if (metadataDiff.modified) {
      metadataDiff.modified.forEach((modified) => {
        const update = {
          leftId: modified.leftId,
          rightId: modified.rightId,
          parentLeftId: leftId,
          parentRightId: rightId,
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

          this.removeNonConflicts(this.sourceModel.children);
          this.removeNonConflicts(this.targetModel.children);

          this.loaded = true;
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

  private removeNonConflicts(arr: any) {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      const element = arr[i];
      if (!element.modified && !element.created && !element.deleted) {
        arr.splice(i, 1);
      }
    }
  }

  searchForNode(model: any, label: any) {
    let result: any;
    while (!result) {
      if (model.children) {
        result = model.children.find((el) => el.label === label);
        if (!result) {
          model.children.forEach((child) => {
            result = this.searchForNode(child, label);
            if (!result) {
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

  mergeArrays(source, target) {
    const jointArray = {};

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
    jointArray['filteredMetadata'] = target.filteredMetadata;

    jointArray['metadata'] = [
      ...new Set([...source.metadata, ...target.metadata])
    ];
    jointArray['properties'] = [
      ...new Set([...source.properties, ...target.properties])
    ];

    return jointArray;
  }

  determineDiffs(id: any, diffMap: any) {
    const diffMapForId = diffMap[id];

    if (diffMapForId) {
      const diffs = diffMapForId.diffs;

      const tempDataElementDiffs = [];
      const tempDataClassesDiff = [];
      const tempDataTypesDiff = [];
      const tempMetadata = [];

      diffs.dataElements.forEach((element) => {
        if (element.deleted === false) {
          if (element.created) {
            if (element.breadcrumbs[0].id === this.targetModel.id) {
              tempDataElementDiffs.push(element);
            }
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
          if (element.created) {
            if (element.breadcrumbs[0].id === this.targetModel.id) {
              tempDataTypesDiff.push(element);
            }
          }
        }
      });

      diffs.metadata.forEach((metadata) => {
        if (metadata.deleted === false || metadata.deleted === undefined) {
          if (metadata.created) {
            if (metadata.rightId === this.targetModel.id) {
              tempMetadata.push(metadata);
            }
          } else {
            tempMetadata.push(metadata);
          }
        }
      });

      diffs.filteredDataTypes = Object.assign([], tempDataTypesDiff);
      diffs.filteredDataElements = Object.assign([], tempDataElementDiffs);
      diffs.filteredDataClasses = Object.assign([], tempDataClassesDiff);
      diffs.filteredMetadata = Object.assign([], tempMetadata);

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
      filteredMetadata: [],
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

    this.diffs.metadata.forEach((prop) => {
      prop.acceptSource = true;
      prop.acceptTarget = false;
      this.onAcceptPress(prop, 'source', 'metadata');
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

    this.diffs.filteredMetadata.forEach((metadata) => {
      metadata.acceptTarget = true;
      metadata.acceptSource = false;
      this.onAcceptPress(metadata, 'target', 'metadata');
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

    if (this.diffsMerged.metadata === undefined) {
      this.diffsMerged.metadata = [];
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
          if (element.property === diff.property && element.leftId === diff.leftId) {
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
                  const i = this.diffs.properties.findIndex(
                    (x) => x.property === element.property
                  );
                  if (i >= 0) {
                    this.diffs.properties[i].acceptTarget = false;
                  }
                } else {
                  const i = this.diffs.properties.findIndex(
                    (x) => x.property === element.property
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
          if (element.label === diff.label) {
            if (diff.accept) {
              this.diffsMerged.dataClasses[index] = diff;
              if (diffLocation === 'source') {
                const i = this.diffs.dataClasses.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.dataClasses[i].accept = false;
                }
              } else {
                const i = this.diffs.dataClasses.findIndex(
                  (x) => x.label === element.label
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
      case 'metadata': {
        let found = false;
        for (let index = 0; index < this.diffsMerged.metadata.length; index++) {
          const element = this.diffsMerged.metadata[index];
          if (element.value) {
            if (element.value.id === diff.value.id) {
              if (diff.accept) {
                this.diffsMerged.metadata[index] = diff;
                if (diffLocation === 'source') {
                  const i = this.diffs.metadata.findIndex(
                    (x) => x.value.id === element.value.id
                  );
                  if (i >= 0) {
                    this.diffs.metadata[i].accept = false;
                  }
                } else {
                  const i = this.diffs.metadata.findIndex(
                    (x) => x.value.id === element.value.id
                  );
                  if (i >= 0) {
                    this.diffs.metadata[i].accept = false;
                  }
                }
              } else {
                this.diffsMerged.metadata.splice(index, 1);
              }
              found = true;
            }
          } else {
            if (diff.acceptTarget || diff.acceptSource) {
              if (diffLocation === 'source') {
                const i = this.diffs.metadata.findIndex(
                  (x) => x.id === element.id
                );
                if (i >= 0) {
                  this.diffs.metadata[i].accept = false;
                }
              } else {
                const i = this.diffs.metadata.findIndex(
                  (x) => x.id === element.id
                );
                if (i >= 0) {
                  this.diffs.metadata[i].accept = false;
                }
              }
            } else {
              this.diffsMerged.metadata.splice(index, 1);
            }

            found = true;
          }
        }

        if (!found) {
          this.diffsMerged.metadata.push(diff);
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
          if (element.label === diff.label) {
            if (diff.accept) {
              this.diffsMerged.dataElements[index] = diff;
              if (diffLocation === 'source') {
                const i = this.diffs.dataElements.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.dataElements[i].accept = false;
                }
              } else {
                const i = this.diffs.dataElements.findIndex(
                  (x) => x.label === element.label
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
          if (element.label === diff.label) {
            if (diff.accept) {
              this.diffsMerged.dataTypes[index] = diff;
              if (diffLocation === 'source') {
                const i = this.diffs.dataTypes.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.dataTypes[i].accept = false;
                }
              } else {
                const i = this.diffs.dataTypes.findIndex(
                  (x) => x.label === element.label
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
  };

  calculateDiff(result: any, diffMap: {}) {
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

            if (!item.isMergeConflict) {
              el.acceptSource = true;
              el.acceptTarget = false;
              this.onAcceptPress(el, 'source', 'dataClass');
            }
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

            if (!item.isMergeConflict) {
              el.acceptSource = true;
              el.acceptTarget = false;
              this.onAcceptPress(el, 'source', 'dataElements');
            }
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

            if (!item.isMergeConflict) {
              el.acceptSource = true;
              el.acceptTarget = false;
              this.onAcceptPress(el, 'source', 'dataType');
            }
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

          if (diffElement === 'dataClasses' && el.breadcrumbs) {
            this.modifiedParents(el.breadcrumbs, diffMap);
            const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);
            el.deleted = true;
            el.domainType = 'DataClasses';
            diffMap[parentDC.id].diffs.dataClasses.push(el);
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

            if (el.diffs.find((x) => x.dataElements)) {
              const childDataClasses = {
                diffs: [el.diffs.find((x) => x.dataElements)]
              };
              this.calculateDiff(childDataClasses, this.diffMap);
            }
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

            if (el.diffs.find((x) => x.dataTypes)) {
              const childDataClasses = {
                diffs: [el.diffs.find((x) => x.dataTypes)]
              };
              this.calculateDiff(childDataClasses, this.diffMap);
            }
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
          el.diffs.forEach((subDiff) => {
            if (subDiff.label) {
              this.findDiffProps(
                'label',
                el.leftId,
                el.rightId,
                subDiff.label,
                diffMap
              );
            }
            if (subDiff.description) {
              this.findDiffProps(
                'description',
                el.leftId,
                el.rightId,
                subDiff.description,
                diffMap
              );
            }
            if (subDiff.author) {
              this.findDiffProps(
                'author',
                el.leftId,
                el.rightId,
                subDiff.author,
                diffMap
              );
            }

            if (subDiff.organisation) {
              this.findDiffProps(
                'organisation',
                el.leftId,
                el.rightId,
                subDiff.organisation,
                diffMap
              );
            }

            if (subDiff.minMultiplicity) {
              this.findDiffProps(
                'minMultiplicity',
                el.leftId,
                el.rightId,
                subDiff.minMultiplicity,
                diffMap
              );
            }
            if (subDiff.maxMultiplicity) {
              this.findDiffProps(
                'maxMultiplicity',
                el.leftId,
                el.rightId,
                subDiff.maxMultiplicity,
                diffMap
              );
            }

            if (subDiff.metadata) {
              this.findDiffMetadata(
                el.leftId,
                el.rightId,
                subDiff.metadata,
                diffMap
              );
            }

            if (diffElement === 'dataTypes' && subDiff.enumerationValues) {
              this.findDiffEnumerationValues(
                el.leftId,
                el.rightId,
                subDiff.enumerationValues,
                diffMap
              );
            }

            if (diffElement === 'dataElements' && subDiff['dataType.label']) {
              this.findDiffDataTypeChanges(
                el.leftId,
                el.rightId,
                subDiff['dataType.label'],
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

    this.updatedTreeStyle(this.sourceModel.children);
    this.updatedTreeStyle(this.targetModel.children);
  }

  updatedTreeStyle(children: any[]) {
    if (children) {
      children.forEach((dc) => {
        if (this.diffMap[dc.id]) {
          dc.deleted = this.diffMap[dc.id].deleted;
          dc.created = this.diffMap[dc.id].created;
          dc.modified = this.diffMap[dc.id].modified;
        }
        this.updatedTreeStyle(dc.children);
      });
    }
  }
}

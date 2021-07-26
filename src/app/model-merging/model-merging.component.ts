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
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '../services/validator.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { UIRouterGlobals } from '@uirouter/core';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ElementTypesService, StateHandlerService } from '@mdm/services';
import { ResolveMergeConflictModalComponent } from '@mdm/modals/resolve-merge-conflict-modal/resolve-merge-conflict-modal.component';
import { ModelDomainRequestType } from '@mdm/model/model-domain-type';
import { ModelDomainType } from '@maurodatamapper/mdm-resources';
import { filter } from 'rxjs/operators';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

@Component({
  selector: 'mdm-model-merging',
  templateUrl: './model-merging.component.html',
  styleUrls: ['./model-merging.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModelMergingComponent implements OnInit {
  diffMap = {};
  dataTypes: any;

  diffs: any;
  diffsMerged: any;

  useSource: boolean;
  processing: boolean;

  diffElements = [
    'dataClasses',
    'dataElements',
    'dataTypes',
    'enumerationValues'
  ];

  diffProps = ['label', 'description', 'author', 'organisation', 'aliases'];

  sourceModel: any;
  targetModel: any;
  mergedModel: any;

  left: any;
  right: any;
  diffResult: any;

  loaded = false;

  form = {
    dataTypeFilter: null,
    dataElementFilter: null
  };

  DIFF_LOC = {
    Source: 'source',
    Target: 'target'
  };

  MERGE_DOMAIN_TYPE = {
    DataClass: 'dataClass',
    DataElement: 'dataElement',
    Enumeration: 'enumeration',
    DataType: 'dataType',
    Property: 'property',
    Metadata: 'metadata',
    DataModel: 'dataModel'
  };

  domainType: ModelDomainType;

  constructor(
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private elementTypes: ElementTypesService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

    const sourceId = this.uiRouterGlobals.params.sourceId;
    const targetId = this.uiRouterGlobals.params.targetId;
    this.domainType = this.uiRouterGlobals.params.catalogueDomainType;

    if (this.domainType) {
      this.dataTypes = this.elementTypes.getAllDataTypesArray();

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
    else {
      this.messageHandler.showError('Catalogue Domain Type is require, Please ensure it available');
    }
  }

  retrieveMainBranchModel = () => {
    this.resources.versioning
      .currentMainBranch(this.domainType, this.sourceModel.id)
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

    const response = await this.resources.tree
      .getExpandedTree(this.domainType, modelId, { forDiff: true })
      .toPromise();

    const model = response.body;
    return model;
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
    localDiff.push(this.createEnumerationValueElements(model));

    const props = this.createPropertiesElements(model);
    for (const prop of props) {
      localDiff.push(prop);
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
            diffs: tempMeMod
          };
          tempMod.push(mod);
        }
      }
    });

    objects.modified = tempMod;

    return objects;
  }

  createEnumerationValueElements(model: any) {
    const objects: any = {};

    objects.fieldName = 'enumerationValues';
    objects.created = [];
    objects.deleted = [];

    this.diffsMerged.enumerationValues.forEach((dt) => {
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
          const deletedDiff = {
            id: dt.id
          };
          objects.deleted.push(deletedDiff);
        }
      }
    });

    const tempMod = [];
    if (model.children) {
      model.children.forEach((child) => {
        if (child.domainType === 'EnumerationValue') {
          tempMod.push(this.createDiffMap(false, child));
        }
      });
    }

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
        if (this.dataTypes.some((x) => x.id === child.domainType)) {
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
            const deletedDiff = {
              id: de.id
            };
            objects.deleted.push(deletedDiff);
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

      dialog.afterClosed()
        .pipe(
          filter(result => result.status === ModalDialogStatus.Ok)
        )
        .subscribe((result) => {
          const tr = this.createDiffMap(true, this.targetModel);

          const data = {
            patch: tr,
            deleteBranch: result.deleteSourceBranch,
            commitComment: result.commitComment
          };

          this.resources.versioning
            .mergeInto(this.domainType, this.sourceModel.id, this.targetModel.id, data)
            .subscribe(
              () => {
                this.messageHandler.showSuccess('Commit Successful');
                this.stateHandler.Go(
                  ModelDomainRequestType[this.domainType],
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
        });
    }
  }

  findDiffDataTypeChanges(leftId, rightId, dataTypeDiff, diffMap) {
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

  findDiffProps(propName, leftId, rightId, labelDiff, diffMap) {
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
      this.onAcceptPress(update, this.DIFF_LOC.Source, 'property');
    }

    diffMap[leftId].diffs.properties.push(update);
    diffMap[rightId].diffs.properties.push(update);
  };

  findDiffMetadata(leftId, rightId, metadataDiff, diffMap) {
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
          this.onAcceptPress(created, this.DIFF_LOC.Source, 'metadata');
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
          property: modified,
          title: this.validator.capitalize(modified),
          left: modified.diffs.filter((x) => x[modified])[0].value.left,
          right: modified.diffs.filter((x) => x[modified])[0].value.right,
          modified: true
        };
        diffMap[leftId].diffs.properties.push(update);
        diffMap[rightId].diffs.properties.push(update);
      });
    }
  };

  runDiff() {
    if (!this.sourceModel || !this.targetModel) {
      return;
    }

    this.diffMap = {};
    this.diffs = [];
    this.diffsMerged = [];

    this.processing = true;

    this.resources.versioning
      .mergeDiff(this.domainType, this.sourceModel.id, this.targetModel.id)
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

  removeNonConflicts(arr: any) {
    if (!arr) {
      return;
    }

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

  onNodeClick(node: any) {
    this.diffs = [];
    let source;
    let target;

    if (node.domainType.toLowerCase() === this.MERGE_DOMAIN_TYPE.DataModel.toLowerCase()) {
      source = this.sourceModel;
      target = this.targetModel;
    } else {
      source = this.searchForNode(this.sourceModel, node.label);
      target = this.searchForNode(this.targetModel, node.label);
    }

    let tempDiffsSource = {
      properties: [],
      metadata: [],
      enumerationValues: [],

      dataTypes: [],
      dataClasses: [],
      dataElements: []
    };
    let tempDiffTarget = {
      properties: [],
      metadata: [],
      enumerationValues: [],

      dataTypes: [],
      dataClasses: [],
      dataElements: []
    };

    if (source) {
      tempDiffsSource = this.determineDiffs(source.id, this.diffMap);
    }

    if (target) {
      tempDiffTarget = this.determineDiffs(target.id, this.diffMap);
    }

    this.diffs = this.mergeArrays(tempDiffTarget, tempDiffsSource);
  }

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
    jointArray['filteredEnumeration'] = target.filteredEnumeration;

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
      const tempEnumeration = [];

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

      diffs.enumerationValues.forEach((enumeration) => {
        if (
          enumeration.deleted === false ||
          enumeration.deleted === undefined
        ) {
          if (enumeration.created) {
            if (enumeration.rightId === this.targetModel.id) {
              tempEnumeration.push(enumeration);
            }
          } else {
            tempEnumeration.push(enumeration);
          }
        }
      });

      diffs.filteredDataTypes = Object.assign([], tempDataTypesDiff);
      diffs.filteredDataElements = Object.assign([], tempDataElementDiffs);
      diffs.filteredDataClasses = Object.assign([], tempDataClassesDiff);
      diffs.filteredMetadata = Object.assign([], tempMetadata);
      diffs.filteredEnumeration = Object.assign([], tempEnumeration);

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
      filteredDataClasses: [],
      filteredEnumeration: []
    };
  }

  selectSource() {
    if (!this.useSource) {
      this.diffsMerged = [];
    }

    this.diffs.dataClasses.forEach((dataClass) => {
      dataClass.acceptSource = true;
      dataClass.acceptTarget = false;
      this.onAcceptPress(dataClass, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.DataClass);
    });

    this.diffs.dataElements.forEach((dataElement) => {
      dataElement.acceptSource = true;
      dataElement.acceptTarget = false;
      this.onAcceptPress(dataElement, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.DataElement);
    });

    this.diffs.enumerationValues.forEach((enumerations) => {
      enumerations.acceptSource = true;
      enumerations.acceptTarget = false;
      this.onAcceptPress(enumerations, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.Enumeration);
    });

    this.diffs.dataTypes.forEach((dataType) => {
      dataType.acceptSource = true;
      dataType.acceptTarget = false;
      this.onAcceptPress(dataType, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.DataType);
    });

    this.diffs.properties.forEach((prop) => {
      prop.acceptSource = true;
      prop.acceptTarget = false;
      this.onAcceptPress(prop, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.Property);
    });

    this.diffs.metadata.forEach((prop) => {
      prop.acceptSource = true;
      prop.acceptTarget = false;
      this.onAcceptPress(prop, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.Metadata);
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
      this.onAcceptPress(dataClass, this.DIFF_LOC.Target, this.MERGE_DOMAIN_TYPE.DataClass);
    });

    this.diffs.dataElements.forEach((dataElement) => {
      dataElement.acceptSource = false;
    });

    this.diffs.filteredDataElements.forEach((dataElement) => {
      dataElement.acceptTarget = true;
      dataElement.acceptSource = false;
      this.onAcceptPress(dataElement, this.DIFF_LOC.Target, this.MERGE_DOMAIN_TYPE.DataElement);
    });

    this.diffs.metadata.forEach((dataElement) => {
      dataElement.acceptSource = false;
    });

    this.diffs.filteredMetadata.forEach((metadata) => {
      metadata.acceptTarget = true;
      metadata.acceptSource = false;
      this.onAcceptPress(metadata, this.DIFF_LOC.Target, this.MERGE_DOMAIN_TYPE.Metadata);
    });

    this.diffs.filteredEnumeration.forEach((enumeration) => {
      enumeration.acceptTarget = true;
      enumeration.acceptSource = false;
      this.onAcceptPress(enumeration, this.DIFF_LOC.Target, this.MERGE_DOMAIN_TYPE.Enumeration);
    });

    this.diffs.dataTypes.forEach((dataType) => {
      if (!dataType.created) {
        dataType.acceptTarget = true;
        dataType.acceptSource = false;
        this.onAcceptPress(dataType, this.DIFF_LOC.Target, this.MERGE_DOMAIN_TYPE.DataType);
      }
    });

    this.diffs.properties.forEach((prop) => {
      prop.acceptTarget = true;
      prop.acceptSource = false;
      this.onAcceptPress(prop, this.DIFF_LOC.Target, this.MERGE_DOMAIN_TYPE.Property);
    });

    this.useSource = false;
  }

  onAcceptPress(diff: any, diffLocation: string, type: string) {
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

    if (this.diffsMerged.enumerationValues === undefined) {
      this.diffsMerged.enumerationValues = [];
    }

    switch (type) {
      case this.MERGE_DOMAIN_TYPE.Property: {
        let found = false;
        for (
          let index = 0;
          index < this.diffsMerged.properties.length;
          index++
        ) {
          const element = this.diffsMerged.properties[index];
          if (
            element.property === diff.property &&
            element.leftId === diff.leftId
          ) {
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
                if (!this.diffs.properties) {
                  return;
                }
                if (diffLocation === this.DIFF_LOC.Source) {
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
      case this.MERGE_DOMAIN_TYPE.DataClass: {
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
              if (diffLocation === this.DIFF_LOC.Source) {
                const i = this.diffs.dataClasses.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.dataClasses[i].acceptTarget = false;
                }
              } else {
                const i = this.diffs.dataClasses.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.dataClasses[i].acceptSource = false;
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
      case this.MERGE_DOMAIN_TYPE.Enumeration: {
        let found = false;
        for (
          let index = 0;
          index < this.diffsMerged.enumerationValues.length;
          index++
        ) {
          const element = this.diffsMerged.enumerationValues[index];
          if (element.label === diff.label) {
            if (diff.accept) {
              this.diffsMerged.enumerationValues[index] = diff;
              if (diffLocation === this.DIFF_LOC.Source) {
                const i = this.diffs.enumerationValues.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.enumerationValues[i].acceptTarget = false;
                }
              } else {
                const i = this.diffs.enumerationValues.findIndex(
                  (x) => x.label === element.label
                );
                if (i >= 0) {
                  this.diffs.enumerationValues[i].acceptSource = false;
                }
              }
            } else {
              this.diffsMerged.enumerationValues.splice(index, 1);
            }
            found = true;
          }
        }

        if (!found) {
          this.diffsMerged.enumerationValues.push(diff);
        }
        break;
      }
      case this.MERGE_DOMAIN_TYPE.Metadata: {
        let found = false;
        for (let index = 0; index < this.diffsMerged.metadata.length; index++) {
          const element = this.diffsMerged.metadata[index];
          if (element === diff) {
            if (diff.acceptTarget || diff.acceptSource) {
              if (diffLocation === this.DIFF_LOC.Source) {
                const i = this.diffs.metadata.findIndex((x) => x === element);
                if (i >= 0) {
                  this.diffs.metadata[i].acceptTarget = false;
                }
              } else {
                const i = this.diffs.metadata.findIndex((x) => x === element);
                if (i >= 0) {
                  this.diffs.metadata[i].acceptSource = false;
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
      case this.MERGE_DOMAIN_TYPE.DataElement: {
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
              if (diffLocation === this.DIFF_LOC.Source) {
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
      case this.MERGE_DOMAIN_TYPE.DataType: {
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
              if (diffLocation === this.DIFF_LOC.Source) {
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
      if (diff.value) {
        this.findDiffProps(
          'value',
          result.leftId,
          result.rightId,
          diff.value,
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
      if (diff.minMultiplicity) {
        this.findDiffProps(
          'minMultiplicity',
          result.leftId,
          result.rightId,
          diff.minMultiplicity,
          diffMap
        );
      }
      if (diff.maxMultiplicity) {
        this.findDiffProps(
          'maxMultiplicity',
          result.leftId,
          result.rightId,
          diff.maxMultiplicity,
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
              this.onAcceptPress(el, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.DataClass);
            }
          }

          if (diffElement === 'dataElements' && el.breadcrumbs) {
            this.modifiedParents(el.breadcrumbs, diffMap);

            const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);
            el.created = true;
            el.modified = false;
            el.deleted = false;
            el.domainType = this.MERGE_DOMAIN_TYPE.DataElement;
            diffMap[parentDC.id].diffs.dataElements.push(el);

            if (!item.isMergeConflict) {
              el.acceptSource = true;
              el.acceptTarget = false;
              this.onAcceptPress(el, this.DIFF_LOC.Source, this.MERGE_DOMAIN_TYPE.DataElement);
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
            el.domainType = this.MERGE_DOMAIN_TYPE.DataType;

            diffMap[this.sourceModel.id].diffs.dataTypes.push(el);
            diffMap[this.targetModel.id].diffs.dataTypes.push(el);

            if (!item.isMergeConflict) {
              el.acceptSource = true;
              el.acceptTarget = false;
              this.onAcceptPress(el, this.DIFF_LOC.Source, 'dataType');
            }
          }

          if (diffElement === 'enumerationValues' && el.breadcrumbs) {
            this.modifiedParents(el.breadcrumbs, diffMap);

            const parent = el.breadcrumbs[el.breadcrumbs.length - 1];
            this.initDiff(parent.id, diffMap);

            el.created = true;
            el.modified = false;
            el.deleted = false;
            el.domainType = this.MERGE_DOMAIN_TYPE.Enumeration;
            diffMap[parent.id].diffs.enumerationValues.push(el);

            if (!item.isMergeConflict) {
              el.acceptSource = true;
              el.acceptTarget = false;
              this.onAcceptPress(el, this.DIFF_LOC.Source, 'enumeration');
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
            el.domainType = 'DataClass';
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
            el.domainType = this.MERGE_DOMAIN_TYPE.DataType;
            diffMap[this.sourceModel.id].diffs.dataTypes.push(el);
            diffMap[this.targetModel.id].diffs.dataTypes.push(el);
          }

          if (diffElement === 'enumerationValues' && el.breadcrumbs) {
            this.modifiedParents(el.breadcrumbs, diffMap);
            const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
            this.initDiff(parentDC.id, diffMap);

            el.deleted = true;
            el.created = false;
            el.modified = false;
            el.domainType = this.MERGE_DOMAIN_TYPE.Enumeration;
            diffMap[parentDC.id].diffs.enumerationValues.push(el);
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
            }
            if (el.rightBreadcrumbs) {
              this.modifiedParents(
                el.rightBreadcrumbs.slice(0, el.rightBreadcrumbs.length - 1),
                diffMap
              );
              el.modified = true;
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
          }

          if (diffElement === 'dataTypes' && el.leftBreadcrumbs) {
            this.modifiedParents(el.leftBreadcrumbs, diffMap);

            const parentDT = el.rightBreadcrumbs[el.leftBreadcrumbs.length - 1];
            this.initDiff(parentDT.id, diffMap);

            el.modified = true;
            el.deleted = false;
            el.created = false;
            el.domainType = 'DataType';
          }
          if (diffElement === 'dataTypes' && el.rightBreadcrumbs) {
            this.modifiedParents(el.rightBreadcrumbs, diffMap);

            const parentDT =
              el.rightBreadcrumbs[el.rightBreadcrumbs.length - 1];
            this.initDiff(parentDT.id, diffMap);

            this.initDiff(parentDT.id, diffMap);
            el.modified = true;
            el.deleted = false;
            el.created = false;
            el.domainType = this.MERGE_DOMAIN_TYPE.DataType;
          }

          if (diffElement === 'enumerationValues' && el.leftBreadcrumbs) {
            this.modifiedParents(el.leftBreadcrumbs, diffMap);

            const parentDT = el.rightBreadcrumbs[el.leftBreadcrumbs.length - 1];
            this.initDiff(parentDT.id, diffMap);

            el.modified = true;
            el.deleted = false;
            el.created = false;
            el.domainType = this.MERGE_DOMAIN_TYPE.Enumeration;
          }

          if (diffElement === 'enumerationValues' && el.rightBreadcrumbs) {
            this.modifiedParents(el.rightBreadcrumbs, diffMap);

            const parentDT =
              el.rightBreadcrumbs[el.rightBreadcrumbs.length - 1];
            this.initDiff(parentDT.id, diffMap);

            this.initDiff(parentDT.id, diffMap);
            el.modified = true;
            el.deleted = false;
            el.created = false;
            el.domainType = this.MERGE_DOMAIN_TYPE.Enumeration;
          }

          // Run for Element
          if (el.diffs) {
            this.calculateDiff(el, this.diffMap);
          }
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
      for (const child of children) {
        if (this.diffMap[child.id]) {
          child.deleted = this.diffMap[child.id].deleted;
          child.created = this.diffMap[child.id].created;
          child.modified = this.diffMap[child.id].modified;
        }
        this.updatedTreeStyle(child.children);
      }
    }
  }
}

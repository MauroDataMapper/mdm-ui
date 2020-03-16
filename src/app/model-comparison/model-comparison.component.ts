import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '../services/resources.service';
import { ValidatorService } from '../services/validator.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateService } from '@uirouter/core';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'mdm-model-comparison',
  templateUrl: './model-comparison.component.html',
  styleUrls: ['./model-comparison.component.scss']
})
export class ModelComparisonComponent implements OnInit {
  diffMap = {};
  diffMapLeft = {};
  diffMapRight = {};
  max = 100;
  dynamic = 100;
  diffs: any;
  ready: boolean;
  processing: boolean;
  activeTab: any;

  diffElements = ['dataClasses', 'dataElements', 'dataTypes'];
  diffProps = ['label', 'description', 'author', 'organisation'];

  sourceModel: any;
  targetModel: any;

  form = {
    dataTypeFilter: null,
    dataElementFilter: null
  };

  constructor(
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private resources: ResourcesService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    const sourceId = this.stateService.params.sourceId;
    const targetId = this.stateService.params.targetId;

    if (sourceId && targetId) {
      this.loadDataModelDetail(sourceId).subscribe(result => {
        const data = result.body;
        this.sourceModel = Object.assign({}, data);
        this.loadModelTree(data).subscribe(result => {
          const tree = result.body;
          this.sourceModel.children = Object.assign([], tree);
          this.sourceModel.close = false;

          this.loadDataModelDetail(targetId).subscribe(res => {
            const data = res.body;
            this.targetModel = Object.assign([], data);

            this.loadModelTree(data).subscribe(res => {
              const tree = res.body;
              this.targetModel.children = Object.assign([], tree);
              this.targetModel.close = false;

              // check if source and target need to be swapped
              if (this.checkIfSwapNeeded()) {
                this.swap();
              }

              this.runDiff();
            });
          });
        });
      });
    } else if (targetId) {
      this.loadDataModelDetail(targetId).subscribe(res => {
        const data = res.body;
        this.targetModel = Object.assign([], data);

        this.loadModelTree(data).subscribe(res => {
          const tree = res.body;
          this.targetModel.children = Object.assign([], tree);
          this.targetModel.close = false;
        });
      });
    } else if (sourceId) {
      this.loadDataModelDetail(sourceId).subscribe(res => {
        const data = res.body;
        this.sourceModel = Object.assign([], data);
        this.loadModelTree(data).subscribe(res => {
          const tree = res.body;
          this.sourceModel.children = Object.assign([], tree);
          this.sourceModel.close = false;
        });
      });
    }
  }

  checkIfSwapNeeded = () => {
    let swapNeeded = false;
    for (
      let i = 0;
      this.sourceModel.semanticLinks &&
      i < this.sourceModel.semanticLinks.length;
      i++
    ) {
      const link = this.sourceModel.semanticLinks[i];
      if (
        link.linkType === 'New Version Of' &&
        link.target.id === this.targetModel.id
      ) {
        swapNeeded = true;
      }
    }
    for (
      let i = 0;
      this.targetModel.semanticLinks &&
      i < this.targetModel.semanticLinks.length;
      i++
    ) {
      const link = this.targetModel.semanticLinks[i];
      if (
        link.linkType === 'Superseded By' &&
        link.target.id === this.sourceModel.id
      ) {
        swapNeeded = true;
      }
    }
    return swapNeeded;
  };

  loadDataModelDetail = id => {
    return this.resources.dataModel.get(id);
  };

  loadModelTree = model => {
    return this.resources.tree.get(model.id);
  };

  onLeftModelSelect = select => {
    if (!select || (select && select.length === 0)) {
      this.sourceModel = null;
      this.diffs = [];
      return;
    }
    this.loadDataModelDetail(select[0].id).subscribe(result => {
      const data = result.body;
      this.sourceModel = Object.assign([], data);
      this.loadModelTree(data).subscribe(result => {
        const data = result.body;
        this.sourceModel.children = Object.assign([], data);
        this.sourceModel.close = false;
        if (this.targetModel) {
          this.runDiff();
        }
      });
    });
  };

  onRightModelSelect = select => {
    if (!select || (select && select.length === 0)) {
      this.targetModel = null;
      this.diffs = [];
      return;
    }
    this.loadDataModelDetail(select[0].id).subscribe(result => {
      const data = result.body;
      this.targetModel = Object.assign([], data);

      this.loadModelTree(data).subscribe(result => {
        const data = result.body;
        this.targetModel.children = Object.assign([], data);
        this.targetModel.close = false;
        if (this.sourceModel) {
          this.runDiff();
        }
      });
    });
  };

  swap = () => {
    let srcCopy;
    if (this.sourceModel) {
      srcCopy = Object.assign({}, this.sourceModel); // left
    } else {
      srcCopy = null;
    }
    let trgCopy;
    if (this.targetModel) {
      trgCopy = Object.assign({}, this.targetModel); // right
    } else {
      trgCopy = null;
    }
    this.sourceModel = trgCopy;
    this.targetModel = srcCopy;

    // Load all children of source & target dataModels
    // to rest deleted, created, modified properties
    const obvs = [];
    obvs.push(this.loadModelTree(this.sourceModel));
    obvs.push(this.loadModelTree(this.targetModel));
    forkJoin(obvs).subscribe((results: any) => {
      this.sourceModel.children = Object.assign([], results[0].body);
      this.sourceModel.close = false;

      this.targetModel.children = Object.assign([], results[1].body);
      this.targetModel.close = false;

      this.runDiff();
    });
  };

  cleanDiff = function() {
    this.diffMap = {};
    this.diffs = [];
  };

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
        dataElements: []
      }
    };
  };

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
      left:
        !labelDiff.left || labelDiff.left === 'null' ? '\' \'' : labelDiff.left,
      right:
        !labelDiff.right || labelDiff.right === 'null' ? '\' \'' : labelDiff.right
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
      metadataDiff.created.forEach(created => {
        created.created = true;
        diffMap[leftId].diffs.metadata.push(created);
        diffMap[rightId].diffs.metadata.push(created);
      });
    }
    if (metadataDiff.deleted) {
      metadataDiff.deleted.forEach(deleted => {
        deleted.deleted = true;
        diffMap[leftId].diffs.metadata.push(deleted);
        diffMap[rightId].diffs.metadata.push(deleted);
      });
    }
    if (metadataDiff.modified) {
      metadataDiff.modified.forEach(modified => {
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
      enumerationValuesDiff.created.forEach(created => {
        created.created = true;
        diffMap[leftId].diffs.enumerationValues.push(created);
        diffMap[rightId].diffs.enumerationValues.push(created);
      });
    }
    if (enumerationValuesDiff.deleted) {
      enumerationValuesDiff.deleted.forEach(deleted => {
        deleted.deleted = true;
        diffMap[leftId].diffs.enumerationValues.push(deleted);
        diffMap[rightId].diffs.enumerationValues.push(deleted);
      });
    }

    if (enumerationValuesDiff.modified) {
      enumerationValuesDiff.modified.forEach(modified => {
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
    this.ready = false;
    if (!this.sourceModel || !this.targetModel) {
      return;
    }

    this.cleanDiff();
    this.processing = true;

    this.resources.dataModel
      .get(this.sourceModel.id, 'diff/' + this.targetModel.id)
      .subscribe(
        res => {
          this.processing = false;
          const result = res.body;

          const diffMap = {};

          // Run for DataModel
          result.diffs.forEach(diff => {
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
          });

          result.diffs.forEach(diff => {
            this.diffElements.forEach(diffElement => {
              if (!diff[diffElement]) {
                return;
              }

              diff[diffElement].created.forEach(el => {
                this.initDiff(el.id, diffMap);
                diffMap[el.id].id = el.id;
                diffMap[el.id].created = true;
                diffMap[el.id].deleted = false;
                diffMap[el.id].modified = false;

                if (diffElement === 'dataClasses') {
                  this.modifiedParents(el.breadcrumbs, diffMap);
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

              diff[diffElement].deleted?.forEach(el => {
                this.initDiff(el.id, diffMap);
                diffMap[el.id].id = el.id;
                diffMap[el.id].deleted = true;
                diffMap[el.id].created = false;
                diffMap[el.id].modified = false;

                if (diffElement === 'dataClasses') {
                  if (el.breadcrumbs) {
                    this.modifiedParents(
                      el.breadcrumbs.slice(0, el.breadcrumbs.length - 1),
                      diffMap
                    );
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

              diff[diffElement].modified?.forEach(el => {
                this.initDiff(el.leftId, diffMap);
                diffMap[el.leftId].modified = true;
                diffMap[el.leftId].id = el.leftId;

                this.initDiff(el.rightId, diffMap);
                diffMap[el.rightId].modified = true;
                diffMap[el.rightId].id = el.rightId;

                if (diffElement === 'dataClasses') {
                  if (el.leftBreadcrumbs) {
                    this.modifiedParents(
                      el.leftBreadcrumbs.slice(
                        0,
                        el.leftBreadcrumbs.length - 1
                      ),
                      diffMap
                    );
                  }
                  if (el.rightBreadcrumbs) {
                    this.modifiedParents(
                      el.rightBreadcrumbs.slice(
                        0,
                        el.rightBreadcrumbs.length - 1
                      ),
                      diffMap
                    );
                  }
                }

                if (diffElement === 'dataElements' && el.leftBreadcrumbs) {
                  this.modifiedParents(el.leftBreadcrumbs, diffMap);

                  const parentDC =
                    el.leftBreadcrumbs[el.leftBreadcrumbs.length - 1];
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
                el.diffs.forEach(diff => {
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

                  if (
                    diffElement === 'dataElements' &&
                    diff['dataType.label']
                  ) {
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
            this.sourceModel.modified = this.diffMap[
              this.sourceModel.id
            ].modified;
          }

          if (this.diffMap[this.targetModel.id]) {
            this.targetModel.modified = this.diffMap[
              this.targetModel.id
            ].modified;
          }

          this.sourceModel.children.forEach(dc => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });

          this.targetModel.children.forEach(dc => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });

          this.ready = true;
          this.onNodeClick(this.sourceModel);
        },
        error => {
          this.messageHandler.showError(
            'There was a problem comparing the Data Models.',
            error
          );
          this.processing = false;
        }
      );
  };

  onNodeExpand = node => {
    const obs = new Observable(sub => {
      this.loadModelTree(node).subscribe(
        res => {
          const result = res.body;
          result.forEach(dc => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });
          sub.next(result);
        },
        error => {}
      );
    });
    return obs;
  };

  onNodeClick = node => {
    this.diffs = [];
    if (!this.diffMap[node.id]) {
      return;
    }
    this.diffs = this.diffMap[node.id].diffs;

    this.diffs.filteredDataTypes = Object.assign([], this.diffs.dataTypes);
    this.diffs.dataTypesStatus = {
      deleted: 0,
      created: 0,
      modified: 0
    };
    this.diffs.dataTypes.forEach(value => {
      if (value.deleted) {
        this.diffs.dataTypesStatus.deleted++;
      }
      if (value.created) {
        this.diffs.dataTypesStatus.created++;
      }
      if (value.modified) {
        this.diffs.dataTypesStatus.modified++;
      }
    });

    this.diffs.filteredDataElements = Object.assign(
      [],
      this.diffs.dataElements
    );
    this.diffs.dataElementsStatus = {
      deleted: 0,
      created: 0,
      modified: 0
    };
    this.diffs.dataElements.forEach(value => {
      if (value.deleted) {
        this.diffs.dataElementsStatus.deleted++;
      }
      if (value.created) {
        this.diffs.dataElementsStatus.created++;
      }
      if (value.modified) {
        this.diffs.dataElementsStatus.modified++;
      }
    });

    this.form = {
      dataTypeFilter: null,
      dataElementFilter: null
    };

    this.activeTab = { index: 0 };

    if (this.diffs.properties.length > 0) {
      this.activeTab.index = 0;
    } else if (this.diffs.metadata.length > 0) {
      this.activeTab.index = 1;
    } else if (this.diffs.dataTypes.length > 0) {
      this.activeTab.index = 2;
    } else if (this.diffs.dataElements.length > 0) {
      this.activeTab.index = 3;
    }
  };

  dataElementFilterChange = () => {
    if (this.diffs.dataElements && this.diffs.dataElements.length > 0) {
      if (!this.form.dataElementFilter) {
        this.diffs.filteredDataElements = Object.assign(
          [],
          this.diffs.dataElements
        );
        return;
      }

      this.diffs.filteredDataElements = this.diffs.dataElements.filter(dataType => {
        return (this.form.dataElementFilter === 'deleted' && dataType.deleted) ||
                (this.form.dataElementFilter === 'created' && dataType.created) ||
                (this.form.dataElementFilter === 'modified' && dataType.modified);
      });
    }
  };

  dataTypeFilterChange = () => {
    if (this.diffs.dataTypes && this.diffs.dataTypes.length > 0) {
      if (!this.form.dataTypeFilter) {
        this.diffs.filteredDataTypes = Object.assign([], this.diffs.dataTypes);
        return;
      }

      this.diffs.filteredDataTypes = this.diffs.dataTypes.filter(dataType => {
          return (this.form.dataTypeFilter === 'deleted' && dataType.deleted) ||
                  (this.form.dataTypeFilter === 'created' && dataType.created) ||
                  (this.form.dataTypeFilter === 'modified' && dataType.modified);
        }
      );
    }
  }
}

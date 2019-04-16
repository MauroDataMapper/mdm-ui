angular.module('directives').directive('elementLinksListNew', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      parent: "=",
      parentType: "@",
      type: "=", // static, dynamic
      links: "=",
      loadingData: "=",
      afterSave: "&",

      clientSide: "@" //if true, it should NOT pass values to the serve in save/update/delete
    },
    templateUrl: './elementLinksListNew.html',
    link: function (scope, iElement, iAttrs, ctrl) {

    },

    controller: function ($scope, securityHandler, $q, resources, messageHandler, elementTypes, stateHandler, elementSelectorDialogue, semanticLinkHandler) {

        $scope.semanticLinkTypes = elementTypes.getSemanticLinkTypes();



        $scope.showLinkSuggestion = false;
        $scope.$watch('parent', function (newValue, oldValue, scope) {
          if (!newValue) {return;}
          $scope.handleShowLinkSuggestion($scope.parent);
        });

        $scope.handleShowLinkSuggestion = function(element){
          if(["DataModel", "DataElement"].indexOf(element.domainType) !== -1 ){
              $scope.showLinkSuggestion = true;
          }
        };

        $scope.semanticLinkTypes = elementTypes.getSemanticLinkTypes();
        $scope.access = securityHandler.elementAccess($scope.parent);


        // $scope.fetch = function (text, offset, limit) {
        //     var deferred = $q.defer();
        //     limit = limit ? limit : 30;
        //     offset = offset ? offset : 0;
        //     var domainTypes = [$scope.parent.domainType];
        //
        //     //For DataModel, also search in DataClass
        //     if($scope.parent.domainType === "DataModel"){
        //         domainTypes.push("DataClass");
        //     }
        //
        //     $scope.searchTerm = text;
        //
        //     resources.catalogueItem.post(null, "search", {
        //         resource: {
        //             searchTerm: "search=" + text,
        //             limit: limit,
        //             offset: offset,
        //             domainTypes: domainTypes,
        //             labelOnly: true
        //         }
        //     }).then(function (result) {
        //         deferred.resolve({
        //             results: result.items,
        //             count: result.count,
        //             limit: limit,
        //             offset: offset
        //         });
        //     }, function (error) {
        //         deferred.reject(error);
        //     });
        //     return deferred.promise;
        // };

        if ($scope.type === 'dynamic') {
          $scope.semanticLinkFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
            var deferred = $q.defer();

            var options = {
              pageSize: pageSize,
              pageIndex: pageIndex,
              sortBy: sortBy,
              sortType: sortType,
              filters: filters
            };

            
            if($scope.parent.domainType === "Term"){
                resources.term.get($scope.terminology, $scope.parent.id, "semanticLinks", options).then(function (result) {
                        for (var i = 0; i < result.items.length; i++) {
                            result.items[i].status = result.items[i].source.id === $scope.parent.id ? 'source' : 'target';
                        }
                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });
            }else{
                resources.catalogueItem.get($scope.parent.id, "semanticLinks", options).then(function (result) {
                        for (var i = 0; i < result.items.length; i++) {
                            result.items[i].status = result.items[i].source.id === $scope.parent.id ? 'source' : 'target';
                        }
                        // result.items.sort(function(a, b) {
                        //     a = (a.status + "").trim().toLowerCase();
                        //     b = (b.status + "").trim().toLowerCase();
                        //     var s = 0;
                        //     if (a > b) {
                        //         s = 1;
                        //     } else if (a < b) {
                        //         s = -1;
                        //     }
                        //     return s;
                        // });
                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });
            }


            return deferred.promise;
          };
        }


        $scope.linkSuggestion = function(){
            var params = {};

            if ($scope.parent.domainType === "DataModel") {
                params = {
                    sourceDMId: $scope.parent.id
                };
            }
            if ($scope.parent.domainType === "DataElement") {
                params = {
                    sourceDEId: $scope.parent.id,
                    sourceDMId: $scope.parent.dataModel,
                    sourceDCId: $scope.parent.dataClass,
                };
            }
            stateHandler.NewWindow("linkSuggestion", params);
        };

        // $scope.onTargetSelect = function (target, record) {
        //   record.edit.target = target;
        //   //if target has value, then remove any validation error which already exists
        //   if (target && record.edit.errors && record.edit.errors['target']) {
        //     delete record.edit.errors['target']
        //   }
        // };

        $scope.add = function () {
          var newRecord = {
            id: "",
            source: $scope.parent,
            target: null,
            linkType: "Refines",
            status: 'source',
            edit: {
              id: "",
              source: $scope.parent,
              target: null,
              linkType: "Refines",
              status: 'source'
            },
            inEdit: true,
            isNew: true
          };

          if ($scope.type === 'static') {
            $scope.records = [].concat([newRecord]).concat($scope.records);
            return;
          }

          if ($scope.type === 'dynamic') {
            $scope.mcDisplayRecords = [].concat([newRecord]).concat($scope.mcDisplayRecords);
            return;
          }

        };

        $scope.onEdit = function (record, index) {

        };

        $scope.cancelEdit = function (record, index) {
          if (record.isNew) {
            if ($scope.type === 'static') {
              $scope.records.splice(index, 1);
            }
            if ($scope.type === 'dynamic') {
              $scope.mcDisplayRecords.splice(index, 1);
            }
          }
        };

        $scope.validate = function (record, index) {
          var isValid = true;
          record.edit.errors = [];

          if ($scope.type === 'static') {

          } else if (!record.edit.target) {
            record.edit.errors['target'] = "Target can't be empty!";
            isValid = false;
          }
          return isValid;
        };

        $scope.save = function (record, index) {

          if ($scope.clientSide) {
            return;
          }

          var resource = {
            target: {id: record.edit.target.id},
            linkType: record.edit.linkType
          };


          //in edit mode, we save them here
          if (record.id && record.id !== "") {
            // resources.catalogueItem.put($scope.parent.id, "semanticLinks", record.id, {resource: resource})

              semanticLinkHandler.put($scope.parent, record.edit.target, record.id, record.edit.linkType)
              .then(function (result) {
                if ($scope.afterSave) {
                  $scope.afterSave(resource);
                }

                record.source = result.source;
                record.target = angular.copy(result.target);
                record.edit.target = angular.copy(result.target);
                record.linkType = result.linkType;
                record.inEdit = false;

                $scope.safeApply();

                messageHandler.showSuccess('Link updated successfully.');
              })
              .catch(function (error) {
                  messageHandler.showError('There was a problem updating the link.', error);
              });
          } else {

              

              // resources.catalogueItem.post($scope.parent.id, "semanticLinks", {resource: resource})
            semanticLinkHandler.post($scope.parent, record.edit.target, record.edit.linkType).then(function (response) {
                record = angular.copy(response);
                record.status = "source";

                if ($scope.type === 'static') {
                  $scope.records[index] = record;
                  messageHandler.showSuccess('Link saved successfully.');
                } else {
                  $scope.mcDisplayRecords[index] = record;
                  messageHandler.showSuccess('Link saved successfully.');
                  $scope.mcTableHandler.fetchForDynamic();
                }
              })
              .catch(function (error) {
                  messageHandler.showError('There was a problem saving link.', error);
              });
          }
        };

        $scope.delete = function (record, $index) {
          if ($scope.clientSide) {
            $scope.records.splice($index, 0);
            return;
          }
          resources.catalogueItem.delete($scope.parent.id, "semanticLinks", record.id)
            .then(function () {
              if ($scope.type === 'static') {
                $scope.records.splice($index, 1);
                messageHandler.showSuccess('Link deleted successfully.');
              } else {
                $scope.mcDisplayRecords.splice($index, 1);
                messageHandler.showSuccess('Link deleted successfully.');
                $scope.mcTableHandler.fetchForDynamic();
              }
            })
            .catch(function (error) {
                messageHandler.showError('There was a problem deleting the link.', error);
            });
        };

        $scope.findElement = function (record) {
            var domainTypes = [];
            var notAllowedToSelectIds = [$scope.parent.id];

            if($scope.parent.domainType === "DataModel"){
                domainTypes = ["DataModel", "DataClass"];
            }

            if($scope.parent.domainType === "DataClass"){
                domainTypes = ["DataModel", "DataClass"];
            }

            if($scope.parent.domainType === "DataElement"){
                domainTypes = ["DataElement", "Term"];
            }

            if($scope.parent.domainType === "Term"){
                domainTypes = ["DataElement", "Term", "DataType"];
                notAllowedToSelectIds.push($scope.parent.terminology);
            }

            var dataTypes = elementTypes.getAllDataTypesMap();
            if(dataTypes[$scope.parent.domainType]){
                domainTypes = ["Term", "DataType"];
            }

            elementSelectorDialogue.open(domainTypes, notAllowedToSelectIds).then(function (selectedElement) {
                if(!selectedElement){
                    return;
                }
                record.edit.target = selectedElement;
                //if target has value, then remove any validation error which already exists
                if (selectedElement && record.edit.errors && record.edit.errors['target']) {
                    delete record.edit.errors['target'];
                }

            });

        };


          $scope.safeApply = function(fn) {
              var phase = this.$root.$$phase;
              if(phase === '$apply' || phase === '$digest') {
                  if(fn && (typeof(fn) === 'function')) {
                      fn();
                  }
              } else {
                  this.$apply(fn);
              }
          };

      }
  };
});
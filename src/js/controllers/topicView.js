angular.module('controllers').controller('topicViewCtrl', function ($scope, $state, $stateParams, resources, $window, $q, elementTypes, userSettingsHandler,topicViewHandler,$filter) {

        $window.document.title = "TopicView";
        $scope.targetTreeLoading = true;
        $scope.selectedElement = null;
        $scope.form = null;
        $scope.allModels = [];
        $scope.tvHandler =  topicViewHandler.getTopicViewHandler(jQuery("div.designer"),jQuery("svg.designer"));

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        function generateKey(label){
            return label.replace(/ /g,"").toLowerCase();
        }


        //load all dataModels for right panel
        $scope.loading = true;
        resources.getResource("datamodel","incrementaltree").then(function(data){
            $scope.loading = false;
            $scope.allModels = data ;
            $scope.allModels = $filter('orderBy')($scope.allModels, 'label');

            var promises = [];
            for (var i = 0; i < $scope.allModels.length; i++) {
                promises.push(resources.getResource("datamodel/getMetadata", $scope.allModels[i].id));
                $scope.allModels[i].childDataClasses = [];
            }


            $scope.allModelsTree = [$scope.allModels];

            $q.all(promises).then(function (results) {
                $scope.uinquesTopics = {};

                $scope.uniqueDataModels = {};

                for (var i = 0; i < $scope.allModels.length; i++) {
                    var dataModel = $scope.allModels[i];
                    var metadatas = results[i];

                    for (var m = 0; m < metadatas.length; m++) {
                        var metadata = metadatas[m];

                        if (metadata.namespace && metadata.namespace.toLowerCase().indexOf('topicview') != -1) {
                            var uniqueKey = generateKey(metadata.key);

                            if (!$scope.uinquesTopics[uniqueKey]) {
                                $scope.uinquesTopics[uniqueKey] = {
                                    id:guid(),
                                    label: metadata.key,
                                    links: []
                                };
                            }
                            $scope.uinquesTopics[uniqueKey].links.push({
                                dataModel:dataModel,
                                metadata: metadata
                            });

                            if (!$scope.uniqueDataModels[dataModel.id]) {
                                $scope.uniqueDataModels[dataModel.id] = dataModel;
                            }
                        }
                    }
                }


                var dmLeft = angular.element("#one-centre").width() * 0.3;
                var dmTop  = 200;
                for (var name in $scope.uniqueDataModels) {
                    if ($scope.uniqueDataModels.hasOwnProperty(name)) {
                        var dm = $scope.uniqueDataModels[name];
                        var dmBox = $scope.tvHandler.createDataModel().init(dm, {left:dmLeft, top: dmTop});
                        $scope.tvHandler.addDataModel(dmBox);
                        dm['dmBox'] = dmBox;
                        dmTop = dmTop + 100;
                    }
                }


                var topicLeft = angular.element("#one-centre").width() * 0.5;
                var topicTop  = 110;
                for (var name in $scope.uinquesTopics) {
                    if ($scope.uinquesTopics.hasOwnProperty(name)) {
                        var topic = $scope.uinquesTopics[name];

                        var topicBox = $scope.tvHandler.createTopic().init({id:topic.id, label: topic.label}, {left:topicLeft, top: topicTop});
                        $scope.tvHandler.addTopic(topicBox);
                        topic['topicBox'] = topicBox;
                        topicTop = topicTop + 45;

                        for (var i = 0; i < topic.links.length; i++) {
                            var dataModelId = topic.links[i].dataModel.id;
                            var metadataId = topic.links[i].metadata.id;
                            var dmBox = $scope.uniqueDataModels[dataModelId].dmBox;

                            $scope.tvHandler.addLink(metadataId, dmBox.div, topicBox.div);
                        }

                    }
                }

            });

        },function(){
            $scope.loading = false;
        });


        $($scope.tvHandler).on('elementSelected', function(event, element){
            if(!element){
                $scope.selectedElement = null;
                $scope.form = {label:'', description:'', id:''};
                $scope.safeApply();
                return;
            }
            if(element.type == "topic"){
                $scope.selectedElement = element;
                $scope.form = {label:'', linkId:''};
                $scope.form.label = $scope.selectedElement.topic.label;
                $scope.form.id    = $scope.selectedElement.topic.id;
                $scope.safeApply();
            }else if (element.type == "dataModel"){
                $scope.selectedElement = element;
                //Load the dataModel details
                resources.getResource("datamodel/pageView",$scope.selectedElement.dataModel.id).then(function(data){
                    $scope.selectedElement.dataModel = data;
                    $scope.safeApply();
                });
            }
        });


        $($scope.tvHandler).on('topicAdded', function(event, element){
            var key = generateKey(element.topic.label);
            $scope.uinquesTopics[key] = {
                id:guid(),
                label: element.topic.label,
                links: []
            };
        });


        $($scope.tvHandler).on('linkAdded', function(event, link){

            var metadata = {
                namespace:'ox.softeng.metadatacatalogue.topicview',
                key:link.topic.topic.label,
                value:link.topic.topic.label
            };

            resources.saveMetadata(link.dataModel.dataModel.id, "datamodel", metadata).then(function(response) {
                ngToast.create('Topic saved successfully.');
            }).catch(function () {
                ngToast.create({
                    className: 'alert alert-danger',
                    content: 'There was a problem saving topic.'
                });
            });

        });

        $($scope.tvHandler).on('topicRemoved', function(event, topic){


        });

        $($scope.tvHandler).on('linkRemoved', function(event, link){


        });


        $scope.saveForm = function () {
            if($scope.selectedElement && $scope.selectedElement.type == "topic"){

                var promises = [];
                var links = $scope.selectedElement.links;
                for (var linkId in links) {
                    if (links.hasOwnProperty(linkId)) {
                        var metadata = {
                            key: $scope.form.label,
                            value: $scope.form.label
                        };
                        //update all those metadata and change their Name
                        promises.push(resources.saveResourceRel("metadata" , "edit", linkId, metadata));
                    }
                }


                $q.all(promises).then(function (results) {

                    //update local model
                    var oldUniqueKey = generateKey($scope.selectedElement.topic.label);
                    var newUniqueKey = generateKey($scope.form.label);

                    var id = $scope.uinquesTopics[oldUniqueKey].id;
                    var newLabel = $scope.form.label;

                    $scope.uinquesTopics[oldUniqueKey].label = newLabel;
                    $scope.tvHandler.updateTopicLabel(id, newLabel);
                    $scope.selectedElement.topic.label = $scope.form.label;

                    $scope.uinquesTopics[newUniqueKey] = angular.copy($scope.uinquesTopics[oldUniqueKey]);
                    delete $scope.uinquesTopics[oldUniqueKey];

                    ngToast.create('Topic saved successfully.');
                });

            }
        };

        $scope.cancelForm = function () {
            if($scope.selectedElement && $scope.selectedElement.type == "topic"){
                $scope.form = {label:''};
                $scope.form.label = $scope.selectedElement.topic.label;
                $scope.safeApply();
            }
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };


	});

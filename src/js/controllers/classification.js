angular.module('controllers').controller('classificationCtrl', function ($scope, $state, $stateParams, resources, $window, $q, $rootScope, elementTypes, userSettingsHandler, stateHandler) {

        $scope.activeTab = {index:-1};

        $scope.initialize = function(){
            if(!$stateParams.id){
                stateHandler.NotFound({ location: false } );
                return;
            }
            $scope.classifier = null;
            $window.document.title = "Classifier";


            $scope.loading = true;
            resources.classifier.get($stateParams.id).then(function (result) {
                $scope.classifier = result;
                if($rootScope.isLoggedIn()) {
                  resources.classifier.get($stateParams.id, 'permissions').then(function(permissions){
                  for (var attrname in permissions) {
                    $scope.classifier[attrname] = permissions[attrname];
                  }
                })
              }

            });

            var promises = [];
            promises.push(resources.classifier.get($stateParams.id, "catalogueItems"));
            promises.push(resources.classifier.get($stateParams.id, "terminologies"));
            promises.push(resources.classifier.get($stateParams.id, "terms"));

            $q.all(promises).then(function (results) {
                $scope.catalogueItemsCount = results[0].count;
                $scope.terminologiesCount  = results[1].count;
                $scope.termsCount  = results[2].count;

                $scope.loading = false;
                $scope.activeTab = getTabDetail("classifiedElements");
            });

        };

        function getTabDetail(tabName) {
            if(tabName === "classifiedElements"){
                return {index:0, name:'classifiedElements'};
            }
            if(tabName === "classifiedTerminologies"){
                return {index: 1, name:'classifiedTerminologies'};
            }
            if(tabName === "classifiedTerms"){
                return {index: 2, name:'classifiedTerms'};
            }

            if(tabName === "history"){
                var index = 3;
                if($scope.terminologiesCount === 0){
                    index--;
                }
                if($scope.termsCount === 0){
                    index--;
                }
                return {index: index, name:'history'};
            }
        }

        $scope.tabSelected = function (itemsName) {
            $scope.activeTab = getTabDetail(itemsName);
        };

        $scope.initialize();
	});

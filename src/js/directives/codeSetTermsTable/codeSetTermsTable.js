angular.module('directives').directive('codeSetTermsTable', function () {
	return{
		restrict: 'E',
		scope: {
            codeSet: "=",
            type: "=", // static, dynamic
            clientSide : "@" //if true, it should NOT pass values to the serve in save/update/delete
		},
		templateUrl: './codeSetTermsTable.html',

		link: function(scope, element, attrs){

		},
		controller: function($scope, resources, $q, securityHandler, elementSelectorDialogue, messageHandler){

            $scope.access = securityHandler.elementAccess($scope.codeSet);

            $scope.contentFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };

                var deferred = $q.defer();

                //Use main codesets/{ID} API endpoint for loading terms of a codeSet .................................
                // resources.codeSet.get($scope.codeSet.id).then(function (result) {
                //     var terms = {
                //         count : result.terms.length,
                //         items: result.terms
                //     };
                //     return deferred.resolve(terms);
                // }, function (response) {
                //     return deferred.reject(response);
                // });

                //Use codesets/{ID}/terms API endpoint for loading terms of a codeSet.................................
                resources.codeSet.get($scope.codeSet.id, "terms", options).then(function (result) {
                    return deferred.resolve(result);
                }, function (response) {
                    return deferred.reject(response);
                });

                return deferred.promise;
            };


            $scope.toggleAddTermsSection = function() {
                $scope.showAddTerm =!$scope.showAddTerm;
                $scope.safeApply();
                return;
                // elementSelectorDialogue.open(["Term"]).then(function (selectedElement) {
                //     if(!selectedElement){
                //         return;
                //     }
                //
                //     //save it on the server and then add it into the table
                //     //make sure it is NOT already added for this CodeSet
                //     $scope.mcDisplayRecords = [].concat([selectedElement]).concat($scope.mcDisplayRecords);
                // });
            };
            $scope.delete = function (record, $index) {
                resources.codeSet.delete($scope.codeSet.id, "terms/" + record.id)
                    .then(function () {
                        $scope.mcDisplayRecords.splice($index, 1);
                        messageHandler.showSuccess('Term removed successfully.');
                        $scope.mcTableHandler.fetchForDynamic();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem removing the term.', error);
                    });
            };
            $scope.addTerms = function(terms){

                //current terms
                var currentTerms  = $scope.codeSet.terms.map(function (term) {
                    return {id: term.id};
                });
                var newTermIds = terms.map(function (term) {
                    return {id: term.id};
                });

                var allTermIds =  [].concat(newTermIds).concat(currentTerms);


                resources.codeSet.put($scope.codeSet.id, null, {resource:{terms:allTermIds}}).then(function (result) {
                    messageHandler.showSuccess('Terms added successfully.');
                    $scope.mcTableHandler.fetchForDynamic();
                    setTimeout(function(){
                        $scope.toggleAddTermsSection();
                    }, 500);

                }, function (error) {
                    messageHandler.showError('There was a problem adding the Terms.', error);
                });
            };
            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };



		}
	};
});
angular.module('directives').directive('termRelationships', function (helpDialogueHandler) {
    return{
        restrict: 'E',
        replace:true,
        scope: {
            term: "=",
        },
        templateUrl: './termRelationships.html',

        link: function(scope, iElement, iAttrs, ctrl) {

        },

        controller: function($scope, resources){
            ////get list of all terminology types
            // $scope.relationshipTypes = [];
            // resources.termRelationshipType.get($scope.term.terminology).then(function (data) {
            //     $scope.relationshipTypes = data.items;
            // });


            $scope.loading = true;
            $scope.relationshipTypes = [];
            $scope.relations = {};

            resources.term.get($scope.term.terminology, $scope.term.id, "termRelationships",{queryStringParams: {
                type: "source"
              }}).then(function (data) {
                angular.forEach(data.items, function (item) {

                    if(!$scope.relations[item.relationshipType.displayLabel]){
                        $scope.relationshipTypes.push(item.relationshipType.displayLabel);
                        $scope.relations[item.relationshipType.displayLabel] = [];
                    }
                    $scope.relations[item.relationshipType.displayLabel].push(item);
                });
                $scope.loading = false;
            },function (error) {
                $scope.loading = false;
            });


            $scope.loadHelp = function (event) {
                helpDialogueHandler.open("Editing_properties", { my: "right top", at: "bottom", of: jQuery(event.target) });
            };

        }
    };
});
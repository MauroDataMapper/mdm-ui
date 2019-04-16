angular.module('directives').directive('elementAlias', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            aliases: "=",
            inEditMode: "=",

            onRemove: "&",
            onAdd: "&"
        },
        templateUrl: './elementAlias.html',
        link: function (scope, element, attrs) {

            if (scope.onRemove) {
                scope.onRemove = scope.onRemove();
            }

            if (scope.onAdd) {
                scope.onAdd = scope.onAdd();
            }
        },
        controller: function ($scope) {

            $scope.typedAlias = "";

            $scope.remove = function ($index) {
                var removeElement = $scope.aliases[$index];
                $scope.aliases.splice($index, 1);
                if ($scope.onRemove) {
                    $scope.onRemove(removeElement);
                }
            };

            $scope.add = function () {
                if($scope.typedAlias.trim() === ""){
                    return;
                }
                for (var i = 0; i < $scope.aliases.length; i++) {
                    if ($scope.aliases[i] === $scope.typedAlias) {
                        return;
                    }
                }
                $scope.aliases.push($scope.typedAlias);

                if ($scope.onAdd) {
                    $scope.onAdd($scope.typedAlias);
                }
                $scope.typedAlias = "";
                jQuery("#aliasInput").focus();
            };

            $scope.keyup = function (event) {
                if (event.keyCode && event.keyCode === 13) {
                    $scope.add();
                }
                event.preventDefault();
                return false
            };

        }
    };
});



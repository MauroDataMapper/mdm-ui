angular.module('directives').directive('passwordStrenghtometer', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            password: "="
        },
        templateUrl: './passwordStrenghtometer.html',
        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: function ($scope) {

            $scope.$watch("password", function (newVal, oldVal, scope) {
                if (newVal){
                    $scope.result  = zxcvbn($scope.password);
                    switch ($scope.result.score) {
                        case 0:
                            $scope.message = 'Weak';
                            $scope.type = "danger";
                            $scope.score = 10;
                            break;
                        case 1:
                            $scope.message = 'Weak';
                            $scope.type = "danger";
                            $scope.score = 25;
                            break;
                        case 2:
                            $scope.message = 'Weak';
                            $scope.type = "danger";
                            $scope.score = 50;
                            break;
                        case 3:
                            $scope.message = 'Good';
                            $scope.type = "warning";
                            $scope.score = 75;
                            break;
                        case 4:
                            $scope.message = 'Strong';
                            $scope.type = "success";
                            $scope.score = 100;
                            break;
                    }

                }else{
                    $scope.message = '';
                    $scope.type = '';
                    $scope.score = 0;
                }
            });

        }
    };
});

angular.module('directives').directive('profilePicture', function () {
    return {
        restrict: 'E',
        scope: {
            user: "="
        },
        templateUrl: './profilePicture.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope) {

            $scope.dynamicTooltipText =
                '<div>' +
                    ($scope.user.firstName ? $scope.user.firstName : '') +
                    '&nbsp;' +
                    ($scope.user.lastName ? $scope.user.lastName : '') +
                    '<br>' +
                    ($scope.user.organisation ? $scope.user.organisation+"<br>" : '') +
                    $scope.user.emailAddress +
                '</div>';

        }
    };
});







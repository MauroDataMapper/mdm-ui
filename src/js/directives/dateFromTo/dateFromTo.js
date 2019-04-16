angular.module('directives').directive('dateFromTo', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onSelect: "="
        },

        templateUrl: './dateFromTo.html',

        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: function ($scope) {

            $scope.$watch('dtFrom', function (newValue, oldValue, scope) {
                //init for the first time, so NO Action
                if(oldValue === null && newValue === null){
                    return;
                }

                if(scope.onSelect){
                    scope.onSelect(newValue, scope.dtTo);
                }


                if(newValue){
                    $scope.date2Options.minDate = newValue;
                }
            });


            $scope.$watch('dtTo', function (newValue, oldValue, scope) {
                //init for the first time, so NO Action
                if(oldValue === null && newValue === null){
                    return;
                }

                if(scope.onSelect){
                    scope.onSelect(scope.dtFrom, newValue);
                }


                if(newValue){
                    $scope.date1Options.maxDate = newValue;
                }
            });



            $scope.today = function() {
                $scope.dtFrom = null;//new Date();
                $scope.dtTo = null;//new Date();
            };
            $scope.today();

            // $scope.clear = function() {
            //     $scope.dtFrom = null;
            //     $scope.dTo = null;
            // };

            $scope.date1Options = {
                //dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: null,
                minDate: null,
                startingDay: 1,

                showWeeks: false,
                showButtonBar: false
            };

            $scope.date2Options = {
                //dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: null,
                minDate: null,
                startingDay: 1,

                showWeeks: false,
                showButtonBar: false
            };

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }

            $scope.open1 = function() {
                $scope.popup1.opened = true;
            };

            $scope.open2 = function() {
                $scope.popup2.opened = true;
            };


            $scope.setDate = function(year, month, day) {
                $scope.dtFrom = new Date(year, month, day);
            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[2];
            $scope.altInputFormats = ['M!/d!/yyyy'];

            $scope.popup1 = {
                opened: false
            };

            $scope.popup2 = {
                opened: false
            };


            $scope.clear1 = function() {
                $scope.dtFrom = null;
            };
            $scope.clear2 = function() {
                $scope.dtTo = null;
            };


        }
    };
});


angular.module('controllers').controller('twoSidePanelCtrl',  function ($rootScope, $scope, $stateParams) {


        $scope.expand = false;
        $scope.toggle = function(){
            $scope.expand = !$scope.expand;
        };


        // $scope.hideExpandBtn = true;
        // $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        //     $scope.hideExpandBtn = false;
        //     if(toParams.hideExpandBtn === true){
        //         $scope.hideExpandBtn = true ;
        //     }
        // });
    });



import './../src/js/services/_servicesModule';
import './../src/js/services/utility/securityHandler';
import './../src/js/services/utility/appSetting';
import './../src/js/services/utility/restHandler';
import './../src/js/services/resources';
import './../src/js/services/utility/validator';
import './../src/js/services/utility/elementTypes';
import './../src/js/services/utility/stateHandler';



import './../src/js/controllers/_controllersModule';
import './../src/js/controllers/appContainer';
import './../src/js/controllers/home';



describe("homeCtrlTest", function () {

    var securityHandler, scope, $rootScope, resources, $controller;
    beforeEach(() => {
        var $injector = angular.injector(['ng', 'ngMock', 'ui.router', 'controllers', 'services']);

        securityHandler = $injector.get('securityHandler');
        $rootScope  = $injector.get('$rootScope');
        resources   = $injector.get('resources');
        $controller   = $injector.get('$controller');

        scope = $rootScope.$new();
    });

    function initController () {
        $controller('appContainerCtrl', {
            $window: window,
            $scope: scope,
            resources: resources,
            securityHandler: securityHandler
        });
    }

    it('Initialized correctly',  inject(function () {
        expect(1).toEqual(2);

    }));



    it('Initialized correctly',  inject(function ($controller) {
        var ctrl = initController();

        debugger
        scope.$digest();
        expect(scope.login).toBeDefined();
        expect(scope.logout).toBeDefined();

    }));



});
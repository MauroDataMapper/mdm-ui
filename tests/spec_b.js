import {mock} from './_globalMock';

describe("homeCtrlTest", function () {


    // beforeEach(angular.mock.module('services'));
    // beforeEach(angular.mock.module('controllers'));
    // beforeEach(angular.mock.module('ng'));
    // beforeEach(angular.mock.module('ngMock'));
    // beforeEach(angular.mock.module('ui.router'));
    debugger
    mock.init();

    var securityHandler, scope, $rootScope, resources, $controller;
    beforeEach(inject(function (_securityHandler_, _$rootScope_, _resources_, _$controller_) {
        securityHandler = _securityHandler_;
        $rootScope = _$rootScope_;
        resources = _resources_;
        $controller = _$controller_;
        scope = $rootScope.$new();
    }));


    // var securityHandler, scope, $rootScope, resources, $controller;
    // beforeEach(() => {
    //     var $injector = angular.injector(['ng', 'ngMock', 'ui.router', 'controllers', 'services']);
    //
    //     securityHandler = $injector.get('securityHandler');
    //     $rootScope  = $injector.get('$rootScope');
    //     resources   = $injector.get('resources');
    //     $controller   = $injector.get('$controller');
    //
    //     scope = $rootScope.$new();
    // });

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
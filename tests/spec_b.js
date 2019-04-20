
import './../src/js/services/_servicesModule';
import './../src/js/services/utility/securityHandler';
import './../src/js/services/utility/appSetting';
import './../src/js/services/utility/restHandler';
import './../src/js/services/resources';
import './../src/js/services/utility/validator';
import './../src/js/services/utility/elementTypes';
import './../src/js/services/utility/stateHandler';




import './../src/js/controllers/_controllersModule';
import './../src/js/controllers/home';



describe("homeCtrl", function () {

    var securityHandler, scope, $rootScope, resources;
    beforeEach(() => {
        var $injector = angular.injector(['mcControllers', 'services', 'ng', 'ngMock', 'ui.router']);

        securityHandler = $injector.get('securityHandler');
        $rootScope  = $injector.get('$rootScope');
        resources   = $injector.get('resources');
        scope = $rootScope.$new();
    });

    function initController ($controller) {
        debugger
        controller = $controller('homeCtrl', {
            $window: window,
            $scope: scope,
            resources: resources,
            securityHandler: securityHandler
        });
    }

    it('Initialized correctly',  inject(function ($controller) {
        debugger
        initController($controller, []);
        debugger
    }));



    it("some number2", function () {
        debugger
        //console.log(servicesModule);
        //this is a test
        var map = service.getAccessMap();
        console.log("Herere")
        expect(myModule()).toEqual(160);
    });
});
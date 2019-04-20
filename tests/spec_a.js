import 'angular';
import angularUIRouter from 'angular-ui-router';
import 'angular-mocks/angular-mocks';

import './../src/js/services/_servicesModule';
import './../src/js/services/utility/appSetting';
import './../src/js/services/utility/stateHandler';
import './../src/js/services/utility/elementTypes';
import './../src/js/services/utility/restHandler';
import './../src/js/services/utility/securityHandler';
import './../src/js/services/resources';
import './../src/js/services/utility/validator';

const myModule = require('./../src/indexa.js');


describe("Module should return", function () {

    var service, service2, service3, service4;
    beforeEach(() => {
        var $injector = angular.injector(['services', 'ng', 'ngMock', angularUIRouter]);
        service = $injector.get('appSetting');
        service2 = $injector.get('elementTypes');
        service3 = $injector.get('stateHandler');
        service4 = $injector.get('securityHandler');
    });

    it("some number2", function () {
        debugger
        //console.log(servicesModule);
        //this is a test
        var map = service.getAccessMap();
        console.log("Herere")
        expect(myModule()).toEqual(160);
    });
});
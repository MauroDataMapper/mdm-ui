
import './../src/js/services/_servicesModule';
import './../src/js/services/utility/securityHandler';
import './../src/js/services/utility/appSetting';
import './../src/js/services/utility/restHandler';
import './../src/js/services/resources';
import './../src/js/services/utility/validator';
import './../src/js/services/utility/elementTypes';
import './../src/js/services/utility/stateHandler';
import './../src/js/services/utility/messageHandler';


import './../src/js/controllers/_controllersModule';
import './../src/js/controllers/appContainer';
import './../src/js/controllers/home';
import './../src/js/controllers/userArea/changePassword';


export const mock = {
    init: function () {
        beforeEach(angular.mock.module('services'));
        beforeEach(angular.mock.module('controllers'));
        beforeEach(angular.mock.module('ng'));
        beforeEach(angular.mock.module('ngMock'));
        beforeEach(angular.mock.module('ui.router'));
    }
};


import './../src/js/constants/constantsModule';
import './../src/js/constants/roles';

import './../src/js/services/_servicesModule';
import './../src/js/services/utility/securityHandler';
import './../src/js/services/utility/appSetting';
import './../src/js/services/utility/restHandler';
import './../src/js/services/utility/stateRoleAccess';
import './../src/js/services/resources';
import './../src/js/services/utility/validator';
import './../src/js/services/utility/elementTypes';
import './../src/js/services/utility/stateHandler';
import './../src/js/services/utility/messageHandler';
import './../src/js/services/utility/userSettingsHandler';


import './../src/js/modals/_modalsModule';
import './../src/js/modals/confirmation';


import './../src/js/controllers/_controllersModule';
import './../src/js/controllers/appContainer';
import './../src/js/controllers/home';
import './../src/js/controllers/userArea/changePassword';
import './../src/js/controllers/admin/configuration';
import './../src/js/controllers/admin/group';
import './../src/js/controllers/admin/groups';
import './../src/js/controllers/admin/modelManagement';
import './../src/js/controllers/admin/user';
import './../src/js/controllers/newClassifier/newClassifier';
import './../src/js/controllers/newClassifier/newClassifierStep1Ctrl';
import './../src/js/controllers/classification';


import './../src/js/directives/directivesModule';
import './../src/js/directives/elementLink/elementLink';


import './../src/js/filters/_filtersModule';
import './../src/js/filters/highlight';


export const mock = {
    init: function () {
        beforeEach(angular.mock.module('services'));
        beforeEach(angular.mock.module('controllers'));
        beforeEach(angular.mock.module('directives'));
        beforeEach(angular.mock.module('filters'));
        beforeEach(angular.mock.module('constants'));
        beforeEach(angular.mock.module('modals'));

        beforeEach(angular.mock.module('ng'));
        beforeEach(angular.mock.module('ngMock'));
        beforeEach(angular.mock.module('ui.router'));
    }
};
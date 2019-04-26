

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
import './../src/js/services/DM2DMDataFlowHandler';
import './../src/js/services/exportHandler';
import './../src/js/services/helpDialogueHandler';
import './../src/js/services/jointDiagramService3';
import './../src/js/services/utility/modalHandler';
import './../src/js/services/favouriteHandler';
import './../src/js/services/utility/windowHandler';



import './../src/js/modals/_modalsModule';
import './../src/js/modals/confirmation';



import './../src/js/handlers/_handlersModule';
import './../src/js/handlers/folderHandler';
import './../src/js/handlers/contextSearchHandler';


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
import './../src/js/controllers/dataClass';
import './../src/js/controllers/dataElement';
import './../src/js/controllers/dataFlow/dataFlowDM2DM';
import './../src/js/controllers/dataModelsExport';
import './../src/js/controllers/dataModel';
import './../src/js/controllers/home';
import './../src/js/controllers/import';
import './../src/js/controllers/models';
import './../src/js/controllers/modelsComparison';
import './../src/js/controllers/newVersionDataModel';
import './../src/js/controllers/newVersionTerminology';
import './../src/js/controllers/userArea/profile';
import './../src/js/controllers/register';
import './../src/js/controllers/terminology';
import './../src/js/controllers/term';
import './../src/js/controllers/newClassifier/newClassifier';
import './../src/js/controllers/newClassifier/newClassifierStep1Ctrl';

import './../src/js/controllers/newDataClass/newDataClass';
import './../src/js/controllers/newDataClass/newDataClassStep0Ctrl';
import './../src/js/controllers/newDataClass/newDataClassStep1Ctrl';
import './../src/js/controllers/newDataClass/newDataClassStep2Ctrl';

import './../src/js/controllers/newDataElement/newDataElement';
import './../src/js/controllers/newDataElement/newDataElementStep0Ctrl';
import './../src/js/controllers/newDataElement/newDataElementStep1Ctrl';
import './../src/js/controllers/newDataElement/newDataElementStep2Ctrl';

import './../src/js/controllers/newDataModel/newDataModel';
import './../src/js/controllers/newDataModel/newDataModelStep1Ctrl';
import './../src/js/controllers/newDataModel/newDataModelStep2Ctrl';
import './../src/js/controllers/newDataModel/newDataModelStep3Ctrl';


import './../src/js/controllers/newDataType/newDataType';
import './../src/js/controllers/newDataType/newDataTypeStep0Ctrl';
import './../src/js/controllers/newDataType/newDataTypeStep1Ctrl';
import './../src/js/controllers/newDataType/newDataTypeStep2Ctrl';

import './../src/js/directives/directivesModule';
import './../src/js/directives/mcTable/mcTable';
import './../src/js/directives/elementLink/elementLink';
import './../src/js/directives/annotationList/annotationList';
import './../src/js/directives/attachmentList/attachmentList';
import './../src/js/directives/editableFormButtons/editableFormButtons';
import './../src/js/directives/showIfRoleIsWritable/showIfRoleIsWritable';
import './../src/js/directives/shareWith/shareWith';
import './../src/js/directives/classificationDetails/classificationDetails';



import './../src/js/filters/_filtersModule';
import './../src/js/filters/highlight';
import './../src/js/filters/fileSize';


// window.joint = require('./../src/js/jointjs/joint-min');

export const mock = {
    init: function () {

        beforeEach(angular.mock.module('services', function($provide) {

            $provide.value('jointDiagramService3', {
                DrawDataModel: function () {
                    return {
                        cells:[],
                        rootCell:{}
                    }
                }
            });

            //This will get angular injector
            //we have to do this, as CoreCatalogueUI module is not initialized yet
            //this helps us to have access to $q
            var $injector = angular.injector(['ng']);
            var $q = $injector.get('$q');

            $provide.value('securityHandler', {
                showIfRoleIsWritable: function(element){return true;},
                elementAccess: function(element){return true;},
                isCurrentSessionExpired: function () {return $q.when(false)},
                isValidSession: function () { return $q.when(true) },
                isLoggedIn: function(){return true;},
                getCurrentUser: function () {return {username:'s@s.com'}},
                saveLatestURL: function (url) {},
                getLatestURL: function () {},
                removeLatestURL: function () {},
                dataModelAccess: function () {},
                terminologyAccess: function () {},
                isAdmin: function(){return true;}
            });
        }));
        beforeEach(angular.mock.module('handlers'));
        beforeEach(angular.mock.module('controllers'));
        beforeEach(angular.mock.module('directives'));
        beforeEach(angular.mock.module('filters'));
        beforeEach(angular.mock.module('constants'));
        beforeEach(angular.mock.module('modals'));

        beforeEach(angular.mock.module('ng'));
        beforeEach(angular.mock.module('ngMock'));
        beforeEach(angular.mock.module('ui.router'));
        beforeEach(angular.mock.module('multiStepForm'));
        beforeEach(angular.mock.module('xeditable'));



    }
};
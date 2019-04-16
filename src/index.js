// Icons
import 'font-awesome/css/font-awesome.css';
// Animation
import angularAnimate from 'angular-animate';

// Router
import angularUIRouter from 'angular-ui-router';

import multiStepForm from 'angular-multi-step-form';


import {ngSanitize} from 'angular-sanitize/angular-sanitize'


import 'jquery-ui-dist/jquery-ui.js';
import 'jquery-ui-dist/jquery-ui.css';

import 'ng-toast/dist/ngToast';
import 'ng-toast/dist/ngToast.css';
import 'ng-toast/dist/ngToast-animations.css';

window.zxcvbn = require('zxcvbn/dist/zxcvbn');


// Our modules
import home from './js/home/home.module';
import sidenav from './js/sidenav/sidenav.module';
import aboutControllerModule from './js/controllers/about/about'
import aboutTSControllerModule from './js/controllers/tsTest/aboutTS'


import filtersModule from './js/filters/_filtersModule'
import './js/filters/capitalize'
import './js/filters/biteArrayToBase64'
import './js/filters/bold'
import './js/filters/fileSize'
import './js/filters/propsFilter'
import './js/filters/highlight'
import './js/filters/split'


import controllersModule from './js/controllers/_controllersModule'
import './js/controllers/app'
import './js/controllers/appContainer'
import './js/controllers/classification'
import './js/controllers/dataClass'
import './js/controllers/dataElement'
import './js/controllers/dataModel'
import './js/controllers/dataModelsExport'
import './js/controllers/dataType'
import './js/controllers/diagram'
import './js/controllers/folder'
import './js/controllers/home'
import './js/controllers/import'
import './js/controllers/linkSuggestionCtrl'
import './js/controllers/models'
import './js/controllers/modelsComparison'
import './js/controllers/modelsHome'
import './js/controllers/navbar'
import './js/controllers/newVersionDataModel'
import './js/controllers/newVersionTerminology'
import './js/controllers/register'
import './js/controllers/resetPassword'
import './js/controllers/search'
import './js/controllers/serverError'
import './js/controllers/term'
import './js/controllers/terminology'
import './js/controllers/topicView'
import './js/controllers/twoSidePanel'
import './js/controllers/admin/admin'
import './js/controllers/admin/configuration'
import './js/controllers/admin/emails'
import './js/controllers/admin/group'
import './js/controllers/admin/groups'
import './js/controllers/admin/home'
import './js/controllers/admin/modelManagement'
import './js/controllers/admin/pendingUsers'
import './js/controllers/admin/user'
import './js/controllers/admin/users'
import './js/controllers/dataFlow/dataFlow'
import './js/controllers/dataFlow/dataFlowChain'
import './js/controllers/dataFlow/dataFlowDM2DM'





import constantsModule from './js/constants/constantsModule'
import './js/constants/roles'


import directivesModule from './js/directives/directivesModule'
import './js/directives/advancedSearchBar/advancedSearchBar'
import './js/directives/allLinksInPagedList/allLinksInPagedList'
import './js/directives/admin/groupMembersTable/groupMembersTable'
import './js/directives/admin/groupsTable/groupsTable'
import './js/directives/admin/pendingUsersTable/pendingUsersTable'
import './js/directives/admin/usersTable/usersTable'
import './js/directives/compare/enumerationCompare/enumerationCompare'
import './js/directives/compare/metadataCompare/metadataCompare'
import './js/directives/mcTable/mcTable'
import './js/directives/layout/footer/footer'
import './js/directives/annotationList/annotationList'
import './js/directives/approveButton/approveButton'
import './js/directives/attachmentList/attachmentList'
import './js/directives/classificationDetails/classificationDetails'
import './js/directives/classifiedElementsList/classifiedElementsList'
import './js/directives/comparisonTree/comparisonTree'
import './js/directives/contentTable/contentTable'
import './js/directives/contentTableButtons/contentTableButtons'
import './js/directives/dataClassDetails/dataClassDetails'
import './js/directives/dataElementDetails/dataElementDetails'
import './js/directives/dataFlowSmall/dataFlowSmall'
import './js/directives/dataModelDetails/dataModelDetails'
import './js/directives/dataSetMetadata/dataSetMetadata'
import './js/directives/dataTypeDetails/dataTypeDetails'
import './js/directives/dateFromTo/dateFromTo'
import './js/directives/dateRangeSlider/dateRangeSlider'
import './js/directives/disableSubmitOnEnter/disableSubmitOnEnter'
import './js/directives/dropDownList/dropDownList'
import './js/directives/editableFormButtons/editableFormButtons'
import './js/directives/editDataflow/editDataflow'
import './js/directives/elementAlias/elementAlias'
import './js/directives/elementChildDataClassesList/elementChildDataClassesList'
import './js/directives/elementChildDataClassesListButtons/elementChildDataClassesListButtons'
import './js/directives/elementChildDataElementsList/elementChildDataElementsList'
import './js/directives/elementClassifications/elementClassifications'
import './js/directives/elementDataType/elementDataType'
import './js/directives/elementIcon/elementIcon'
import './js/directives/elementLink/elementLink'
import './js/directives/elementLinksListNew/elementLinksListNew'
import './js/directives/elementOwnedDataTypesList/elementOwnedDataTypesList'
import './js/directives/elementSelector/elementSelector'
import './js/directives/elementSelector2/elementSelector2'
import './js/directives/elementStatus/elementStatus'
import './js/directives/enumerationList/enumerationList'
import './js/directives/enumerationListWithCategory/enumerationListWithCategory'
import './js/directives/equals/equals'
import './js/directives/favourites/favourites'
import './js/directives/fileOnChange/fileOnChange'
import './js/directives/folderDetails/folderDetails'
import './js/directives/foldersTree/foldersTree'
import './js/directives/foldersTree2/foldersTree2'
import './js/directives/groupAccessNew/groupAccessNew'
import './js/directives/hideIfLoggedIn/hideIfLoggedIn'
import './js/directives/history/history'
import './js/directives/jointDiagram/jointDiagram'
import './js/directives/jointDiagram2/jointDiagram2'
import './js/directives/jointDiagram3/jointDiagram3'
import './js/directives/jointDiagram4/jointDiagram4'
import './js/directives/jointDiagram5/jointDiagram5'
import './js/directives/linkSuggestion/linkSuggestion'
import './js/directives/markdown/markdown'
import './js/directives/markdownTextArea/markdownTextArea'
import './js/directives/mcDataTypeListButtons/mcDataTypeListButtons'
import './js/directives/mcImageCroppie/mcImageCroppie'
import './js/directives/mcInfiniteScrollList/mcInfiniteScrollList'
import './js/directives/mcList/mcList'
import './js/directives/mcPagedList/mcPagedList'
import './js/directives/mcSelect2/mcSelect2'
import './js/directives/modelPath/modelPath'
import './js/directives/modelSelectorSelect/modelSelectorSelect'
import './js/directives/modelSelectorTree/modelSelectorTree'
import './js/directives/moreDescription/moreDescription'
import './js/directives/multiplicity/multiplicity'
import './js/directives/myTree/myTree'
import './js/directives/myTreeForAModel/myTreeForAModel'
import './js/directives/myTreeMultiLevel/myTreeMultiLevel'
import './js/directives/myTreeSimple/myTreeSimple'
import './js/directives/newDataTypeInline/newDataTypeInline'
import './js/directives/ngRightClick/ngRightClick'
import './js/directives/passwordChanger/passwordChanger'
import './js/directives/passwordStrenghtometer/passwordStrenghtometer'
import './js/directives/profilePicture/profilePicture'
import './js/directives/shareWith/shareWith'
import './js/directives/showIfLoggedIn/showIfLoggedIn'
import './js/directives/showIfRoleIsWritable/showIfRoleIsWritable'
import './js/directives/showIfRoleIsWritable/showIfRoleIsWritable'
import './js/directives/stateLoadingIndicator/stateLoadingIndicator'
import './js/directives/termDetails/termDetails'
import './js/directives/terminologyDetails/terminologyDetails'
import './js/directives/termRelationships/termRelationships'
import './js/directives/termsTable/termsTable'
import './js/directives/transformationsReadonly/transformationsReadonly'
import './js/directives/userAccessNew/userAccessNew'
import './js/directives/userDetails/userDetails'
import './js/directives/userSelector/userSelector'

import './js/directives/simpleView/elementHierarchy/elementHierarchy'
import './js/directives/simpleView/simpleViewClassifier/simpleViewClassifier'
import './js/directives/simpleView/simpleViewDataClass/simpleViewDataClass'
import './js/directives/simpleView/simpleViewDataElement/simpleViewDataElement'
import './js/directives/simpleView/simpleViewDataModel/simpleViewDataModel'
import './js/directives/simpleView/simpleViewDataType/simpleViewDataType'
import './js/directives/simpleView/simpleViewTerm/simpleViewTerm'
import './js/directives/simpleView/simpleViewTerminology/simpleViewTerminology'

import './js/directives/summaryMetadata/summaryMetadataMap/summaryMetadataMap'
import './js/directives/summaryMetadata/summaryMetadataTable/summaryMetadataTable'







import servicesModule from './js/services/_servicesModule'
import './js/services/utility/appSetting'
import './js/services/utility/elementTypes'
import './js/services/utility/markdownParser'
import './js/services/utility/messageHandler'
import './js/services/utility/modalHandler'
import './js/services/utility/objectEnhancer'
import './js/services/utility/restHandler'
import './js/services/utility/securityHandler'
import './js/services/utility/stateHandler'
import './js/services/utility/stateRoleAccess'
import './js/services/utility/userSettingsHandler'
import './js/services/utility/validator'
import './js/services/utility/windowHandler'
import './js/services/dataFlowHandler'
import './js/services/resources'
import './js/services/DM2DMDataFlowHandler'
import './js/services/exportHandler'
import './js/services/favouriteHandler'
import './js/services/helpDialogueHandler'
import './js/services/importHandler'
import './js/services/jointDiagramDirectedGraph'
import './js/services/jointDiagramService'
import './js/services/jointDiagramService2'
import './js/services/jointDiagramService3'
import './js/services/jointDiagramServiceDC2DCDataFlow'
import './js/services/jointDiagramServiceRecursiveDataflow'
import './js/services/jQueryExtender'
import './js/services/mcHttpInterceptor'
import './js/services/selectionHandler'
import './js/services/topicViewHandler'



import modalsModule from './js/modals/_modalsModule'
import './js/modals/confirmation'
import './js/modals/loginModalForm'
import './js/modals/elementSelectorDialogue'
import './js/modals/forgotPasswordModalForm/forgotPasswordModalForm'
import './js/modals/newDataflowModalForm/newDataflowModalForm'
import './js/modals/sampleModalForm'
import './js/modals/summaryMetadataModalForm/summaryMetadataModalForm'


import handlersModule from './js/handlers/_handlersModule'
import './js/handlers/contextSearchHandler'
import './js/handlers/folderHandler'
import './js/handlers/semanticLinkHandler'



import 'bootstrap/dist/css/bootstrap.min.css';
import './style/main.less';
import './style/bootstrapModifier.less';
import './style/theme.css';


const MODULE_NAME = 'demo';


// Create our demo module
angular.module(MODULE_NAME, [
    angularAnimate,
    angularUIRouter,
    home,
    sidenav,
    aboutControllerModule,
    aboutTSControllerModule,
    controllersModule,
    filtersModule,
    directivesModule,
    constantsModule,
    servicesModule,
    modalsModule,
    handlersModule,
    'ngSanitize',
    multiStepForm.name
]).config(($stateProvider, appSettingProvider, stateRoleAccessProvider, ngToastProvider) => {
    $stateProvider.state("appContainer", {
        abstract: true,
        templateUrl: "./views/app.html",
        controller: 'appCtrl'
    }).state("appContainer.mainApp", {
        abstract: true,
        templateUrl: "./views/appContainer.html",
        controller: "appContainerCtrl"
    }).state("appContainer.mainApp.default", {
        url: "",
        templateUrl: "./views/home.html",
        controller: "homeCtrl"
    }).state("appContainer.mainApp.home", {
        url: "/home",
        templateUrl: "./views/home.html",
        controller: "homeCtrl"
    }).state("appContainer.mainApp.register", {
        url: "/register",
        templateUrl: "./views/register.html",
        controller: "registerCtrl"
    }).state("appContainer.mainApp.twoSidePanel", {
        abstract: true,
        templateUrl: "./views/twoSidePanel.html",
        controller: 'twoSidePanelCtrl'
    }).state("appContainer.mainApp.twoSidePanel.catalogue", {
        abstract: true,
        url: "/catalogue",
        views: {
            "left": {
                templateUrl: './views/models.html',
                controller: "modelsCtrl"
            },
            "": {
                template: '<div ui-view=""></div>'
            }
        }
    }).state("appContainer.mainApp.twoSidePanel.catalogue.allDataModel", {
        url: '/dataModel/all',
        templateUrl: './views/dataModelDefault.html',
        controller: 'modelsHomeCtrl',
        // params: { hideExpandBtn: true }
    }).state("otherwise", {
        url: "*path",
        templateUrl: "./notfound.html"
    });


// .state('public', {
//         url: "/public",
//         templateUrl: "./js/home/home.html",
//         controller: "HomeController"
//     }).state("default1", {
//         url: "/",
//         templateUrl: "./default.html",
//     }).state("default2", {
//         url: "",
//         templateUrl: "./default.html",
//     })


    ngToastProvider.configure({
        animation: 'slide',
        timeout: 60000,
        horizontalPosition: "right",
        verticalPosition: "bottom",
        combineDuplications: true
    });


    //$httpProvider.interceptors.push('mcHttpInterceptor');

    //Do NOT show loginDialogue in Core
    appSettingProvider.add("showLoginDialogue", true);
    appSettingProvider.add("appIsEditable", true);


    stateRoleAccessProvider.add("appContainer", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.about", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.home", ['public']);


    stateRoleAccessProvider.add("appContainer.mainApp", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.default", ['public']);

    stateRoleAccessProvider.add("appContainer.mainApp.register", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.resetPassword", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.about", ['public']);


    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.allDataModel", ['public']);




    stateRoleAccessProvider.add("appContainer.simpleApp", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.home", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.result", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.filter", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.submission", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.element", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.notImplemented", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.serverError", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.resourceNotFound", ['public']);
    stateRoleAccessProvider.add("appContainer.simpleApp.notAuthorized", ['public']);






    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.dataType", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.dataModel", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.terminology", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.term", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.dataElement", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.dataClass", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.selection", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.classification", ['public']);

    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.resourceNotFound", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.serverError", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.notImplemented", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.notAuthorized", ['public']);

    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.search", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.folder", ['public']);
    stateRoleAccessProvider.add("otherwise", ['public']);


    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.newVersionDataModel", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.newVersionTerminology", ['Administrator', 'Editor']);


    stateRoleAccessProvider.add("appContainer.userArea", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.userArea.profile", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.userArea.changePassword", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.userArea.settings", ['Administrator', 'Editor']);


    stateRoleAccessProvider.add("appContainer.mainApp.menuTwoSidePanel.help", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.menuTwoSidePanel.help.index", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.menuTwoSidePanel.help.page", ['public']);

    stateRoleAccessProvider.add("appContainer.mainApp.diagram", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.dataFlowTransformation", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.dataFlowDM2DM", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.dataFlowChain", ['public']);
    stateRoleAccessProvider.add("appContainer.mainApp.topicView", ['public']);


    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataModel", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataElement", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataClass", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataType", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.NewClassifier", ['Administrator', 'Editor']);

    stateRoleAccessProvider.add("appContainer.adminArea", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.users", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.user", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.groups", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.group", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.pendingUsers", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.configuration", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.home", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.resourceNotFound", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.emails", ['Administrator']);
    stateRoleAccessProvider.add("appContainer.adminArea.modelManagement", ['Administrator']);


    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.import", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.twoSidePanel.catalogue.dataModelsExport", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.modelsComparison", ['Administrator', 'Editor']);
    stateRoleAccessProvider.add("appContainer.mainApp.linkSuggestion", ['Administrator', 'Editor']);



}).run(function ($rootScope, $state, $stateParams, $cookies, $window, securityHandler, ngToast, modalHandler, stateRoleAccess, authService, appSetting, userSettingsHandler, stateHandler) {

    const ENV = window.globalConfig;


    //read apiEndpoint from config file scripts/config.js
    //this file is generated automatically based on configs added in Gruntfile.js (in grunt.initConfig({}) section)
    $rootScope.backendURL = ENV.apiEndpoint;
    $rootScope.appVersion = ENV.version;
    $rootScope.appTitle = ENV.appTitle;
    $rootScope.youTrack = ENV.youTrack;
    $rootScope.wiki = ENV.wiki;
    $rootScope.simpleViewSupport = ENV.simpleViewSupport;
    $rootScope.HDFLink = ENV.HDFLink;

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    //Allow any controller/directives to check whether user is logged in
    $rootScope.isLoggedIn = securityHandler.isLoggedIn;
    $rootScope.isAdmin = securityHandler.isAdmin;


    $rootScope.logout = function () {
        securityHandler.logout();
    };

    //selectionHandler.loadSelectionsFromCookie();

    $rootScope.$on('applicationOffline', function () {
        //messageHandler should show a proper message on the main page
        ngToast.danger({content: 'Application is offline!'});
    });

    $rootScope.$on('notAuthenticated', function () {
        stateHandler.NotAuthorized({location: false});
    });

    $rootScope.$on('userLoggedIn', function (event, args) {
        //make sure settings are loaded before going to the next state
        userSettingsHandler.init().then(function () {
            //To remove any ngToast messages specifically sessionExpiry,...
            ngToast.dismiss();
            if (args && args.goTo) {
                $state.go(args.goTo, {}, {reload: true, inherit: false, notify: true});
            }
        });
    });

    $rootScope.$on('userLoggedOut', function (event, args) {
        userSettingsHandler.removeAll();

        //messageHandler should show a proper message on the main page
        if (args && args.goTo) {
            $state.go(args.goTo, {}, {reload: true, inherit: false, notify: true});
        }
    });

    $rootScope.$on('resourceNotFound', function () {
        stateHandler.NotFound({location: false});
    });
    $rootScope.$on('serverError', function (event, response) {
        $rootScope.latestError = {
            url: window.location.href,
            host: window.location.host,
            response: response,
        };
        stateHandler.ServerError({location: false});
    });
    $rootScope.$on('notImplemented', function () {
        stateHandler.NotImplemented({location: false});
    });




    //Run this when the app starts
    //It checks if any expired Session exists and removes it
    handleExpiredSession(true);

    //In each digest cycle, saves the time and then in next cycle
    //check if nothing has happened within, so then remove cookies and expire sessions
    var lastDigestRun = new Date();
    $rootScope.$watch(function detectIdle() {
        var now = new Date();
        if (now - lastDigestRun > (5 * 60) * 1000) {// 5 min
            handleExpiredSession();
        }
        lastDigestRun = now;
    });



    function handleExpiredSession(firstTime) {

        //if 'event:auth-loginRequired' event is fired, then do not check as
        //the event handler will check the status
        if (securityHandler.in_AuthLoginRequiredCheck && !firstTime) {
            return;
        }
        securityHandler.isCurrentSessionExpired().then(function (result) {
            if (result === true) {

                securityHandler.saveLatestURL(window.location.href);

                ngToast.create({
                    className: 'alert alert-danger',
                    content: 'Your session has expired! Please log in.',
                    timeout: 100000
                });
                securityHandler.logout().then(function () {
                    $rootScope.$broadcast('userLoggedOut', {goTo: 'home'});
                });
            }
        });
    }



    //event:auth-loginRequired
    //This event is used internally by HTTP interceptor and when it receives 401, it broadcasts 'event:auth-loginRequired'
    $rootScope.$on('event:auth-loginRequired', function () {

        securityHandler.in_AuthLoginRequiredCheck = true;

        if (securityHandler.in_AuthLoginRequiredCheck) {
            //if showLoginDialogue is FALSE, then just redirect to notAuth
            if (!appSetting.get("showLoginDialogue")) {
                $rootScope.$broadcast('apiCallEnd');
                stateHandler.NotAuthorized({location: false});
                securityHandler.in_AuthLoginRequiredCheck = false;
                return;
            }
            //Ask backend server, if the current session is valid (not expired)
            securityHandler.isValidSession().then(function (response) {
                var sessionIsValid = response;
                //if user is already logged in &
                //if session expired, then show dialogue
                if (securityHandler.getCurrentUser() && sessionIsValid === false) {

                    //Show the dialogue if it's not displayed already
                    if (securityHandler.loginModalDisplayed === true) {
                        securityHandler.in_AuthLoginRequiredCheck = false;
                        return;
                    }

                    //show login modal form, as session expired
                    var modalInstance = modalHandler.prompt("loginModalForm", {});
                    modalInstance.then(function (result) {
                        //if user logged in successfully, then call authService and
                        //confirm that, it will add token into HTTP Header
                        authService.loginConfirmed('success', function (config) {
                            //broadcast that login happened successfully
                            $rootScope.$broadcast('userLoggedIn');
                            //and add the TOKEN
                            //config.headers.Authorization = 'Bearer ' + result.token ;
                            securityHandler.in_AuthLoginRequiredCheck = false;
                            return config;
                        });
                    }, function (error) {
                        //if the user cancels the login, then remove the cookies
                        securityHandler.logout();
                        //if user cancels the login, then just redirect to notAuthorized
                        stateHandler.NotAuthorized({location: false});
                        $rootScope.$broadcast('apiCallEnd');
                        securityHandler.in_AuthLoginRequiredCheck = false;
                        return;
                    });
                }
                else if (securityHandler.getCurrentUser() && sessionIsValid === true) {
                    //if user is already logged in &
                    //if session is NOT expired but user does NOT have enough access to this resource, then redirect to "notAuthorized"
                    $rootScope.$broadcast('apiCallEnd');
                    stateHandler.NotAuthorized({location: false});
                    securityHandler.in_AuthLoginRequiredCheck = false;
                    return;
                } else {
                    //if user is not loggedIn
                    //then just redirect to NotAuthorized page
                    $rootScope.$broadcast('apiCallEnd');
                    stateHandler.NotAuthorized({location: false});
                    securityHandler.in_AuthLoginRequiredCheck = false;
                    return;
                }
            });
        }
    });


    $rootScope.$on('$stateChangeStart', function ($event, next, current) {
        //Check if the user has access to this resource(state)
        if (!stateRoleAccess.hasAccess(next.name)) {
            $rootScope.$broadcast('event:auth-loginRLoggedInequired');
            $event.preventDefault();
            return false;
        }
    });

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
        $rootScope.previousState = {
            name: from.name,
            params: fromParams,
            url: $state.href(from.name, fromParams)
        };
    });


}).controller('MainController', function($mdSidenav, $scope, resources, securityHandler) {

     // resources.features.get('a').then(()=>{
     //     console.log("SUCCESS");
     // }, ()=>{
     //     console.log("ERROR");
     // });

     $scope.hello = "HELLO";
     let vm = this;
     vm.toggleSidenav = () => {
         $mdSidenav('left').toggle();
     };
     vm.closeSidenav = () => {
         $mdSidenav('left').close();
     };
 });

export default MODULE_NAME;


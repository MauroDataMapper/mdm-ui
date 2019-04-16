
angular.module('services').provider("stateHandler", function () {

    var handler = {};
    handler.states = {
        "home":"appContainer.mainApp.home",
        "alldatamodel":"appContainer.mainApp.twoSidePanel.catalogue.allDataModel",
        "datamodel":"appContainer.mainApp.twoSidePanel.catalogue.dataModel",
        "codeset":"appContainer.mainApp.twoSidePanel.catalogue.codeSet",
        "dataclass":"appContainer.mainApp.twoSidePanel.catalogue.dataClass",
        "datatype":"appContainer.mainApp.twoSidePanel.catalogue.dataType",
        "dataelement":"appContainer.mainApp.twoSidePanel.catalogue.dataElement",
        "folder":"appContainer.mainApp.twoSidePanel.catalogue.folder",
        "classification":"appContainer.mainApp.twoSidePanel.catalogue.classification",
        "diagram":"appContainer.mainApp.diagram",

        "terminology":"appContainer.mainApp.twoSidePanel.catalogue.terminology",
        "term":"appContainer.mainApp.twoSidePanel.catalogue.term",

        "newcodeset":"appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet",
        "newdatamodel":"appContainer.mainApp.twoSidePanel.catalogue.NewDataModel",
        "newdataclass":"appContainer.mainApp.twoSidePanel.catalogue.NewDataClass",
        "newdataelement":"appContainer.mainApp.twoSidePanel.catalogue.NewDataElement",
        "newdatatype":"appContainer.mainApp.twoSidePanel.catalogue.NewDataType",
        "newclassification":"appContainer.mainApp.twoSidePanel.catalogue.NewClassifier",
        "newversiondatamodel":"appContainer.mainApp.twoSidePanel.catalogue.newVersionDataModel",
        "newversionterminology":"appContainer.mainApp.twoSidePanel.catalogue.newVersionTerminology",

        "admin.user":"appContainer.adminArea.user",
        "admin.users":"appContainer.adminArea.users",

        "userarea.profile":"menuTwoSidePanel.userArea.profile",

        "admin.group":"appContainer.adminArea.group",
        "admin.groups":"appContainer.adminArea.groups",
        "dataflowtransformation":"appContainer.mainApp.dataFlowTransformation",
        "dataflowdm2dm":"appContainer.mainApp.dataFlowDM2DM",
        "dataflowchain":"appContainer.mainApp.dataFlowChain",
        "modelscomparison":"appContainer.mainApp.modelsComparison",
        "linksuggestion":"appContainer.mainApp.linkSuggestion",
        "datamodelsexport":"appContainer.mainApp.twoSidePanel.catalogue.dataModelsExport",
        "import":"appContainer.mainApp.twoSidePanel.catalogue.import",

        "simpleviewhome":"appContainer.simpleApp.home",
        "simpleviewresult":"appContainer.simpleApp.result",
        "simpleviewelement":"appContainer.simpleApp.element"
    };

    handler.$get = function ($state, $rootScope) {
        'ngInject'

        var factoryObject = {};

        //This actually redirects any link to main element type from simpleView states such as simpleViewResult and simpleViewElement to simpleViewElement
        factoryObject.handleSimpleView = function(name, params) {
            if((params && params.mode === "advancedView") ||
                (["appContainer.simpleApp.result", "appContainer.simpleApp.element"].indexOf($state.current.name) === -1)){
                return name;
            }

            var state = name;
            var needsRedirect = [
                "appContainer.mainapp.twoSidePanel.catalogue.folder","folder",
                "appContainer.mainapp.twoSidePanel.catalogue.datamodel","datamodel",
                "appContainer.mainapp.twoSidePanel.catalogue.dataclass","dataclass",
                "appContainer.mainapp.twoSidePanel.catalogue.dataelement","dataelement",
                "appContainer.mainapp.twoSidePanel.catalogue.terminology","terminology",
                "appContainer.mainapp.twoSidePanel.catalogue.term","term",
                "appContainer.mainapp.twoSidePanel.catalogue.datatype", "datatype",
                "appContainer.mainapp.twoSidePanel.catalogue.classification","classification",
            ];


            var index = _.findIndex(needsRedirect, function (item) {
                return item.toLowerCase() === name.toLowerCase();
            });

            if(index !== -1){
                state = "appContainer.simpleApp.element";
                //if this is going to be redirected to simpleViewElement, do not transmit pagination settings of the current page
                params.criteria = null;
                params.pageIndex = null;
                params.pageSize = null;
                params.offset = null;
            }
            return state;
        };


        factoryObject.getStateName = function(name, params) {
            var state = name;
            if(handler.states[name.toLowerCase().trim()]){
                state = handler.states[name.toLowerCase().trim()];
            }

            state = factoryObject.handleSimpleView(state, params);

            return state;
        };


        factoryObject.NotFound = function (option) {
            if($rootScope.simpleViewSupport){
                $state.go("appContainer.simpleApp.resourceNotFound", {}, option);
            }else{
                $state.go("appContainer.mainApp.twoSidePanel.catalogue.resourceNotFound", {}, option);
            }
        };
        factoryObject.ServerError = function (option) {
            if($rootScope.simpleViewSupport){
                $state.go("appContainer.simpleApp.serverError", {}, option);
            }else{
                $state.go("appContainer.mainApp.twoSidePanel.catalogue.serverError", {}, option);
            }
        };
        factoryObject.NotImplemented = function (option) {
            if($rootScope.simpleViewSupport){
                $state.go("appContainer.simpleApp.notImplemented", {}, option);
            }else{
                $state.go("appContainer.mainApp.twoSidePanel.catalogue.notImplemented", {}, option);
            }
        };
        factoryObject.NotAuthorized = function (option) {
            if($rootScope.simpleViewSupport){
                $state.go("appContainer.simpleApp.notAuthorized", {}, option);
            }else{
                $state.go("appContainer.mainApp.twoSidePanel.catalogue.notAuthorized", {}, option);
            }
        };


        factoryObject.Go = function (name, params, option) {
            var state = factoryObject.getStateName(name);
            return $state.go(state, params, option);
        };

        factoryObject.GoPrevious = function () {
            if($rootScope.previousState && $rootScope.previousState.name){
                var params = $rootScope.previousState.params;
                $state.go($rootScope.previousState.name, params);
            }else{
                $state.go("appContainer.mainApp.twoSidePanel.catalogue.allDataModel");
            }
        };

        factoryObject.NewWindow = function (name, params, windowsOptions) {
            var url = $state.href(factoryObject.getStateName(name), params);
            window.open(url,'_blank', windowsOptions);
        };

        factoryObject.CurrentWindow = function (url) {
            window.location.href = url;
        };

        factoryObject.reload = function () {
            $state.reload();
        };

        factoryObject.getURL = function(name, params){
            var state = factoryObject.getStateName(name, params);
            return $state.href(state, params, {absolute: false});
        };

        return factoryObject;
    };

    return handler;

});


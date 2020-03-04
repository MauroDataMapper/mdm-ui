import { Injectable, forwardRef, Inject } from '@angular/core';
//import {CookieService} from "ngx-cookie-service";
import { SecurityHandlerService } from "../handlers/security-handler.service";

@Injectable({
    providedIn: 'root'

})
export class StateRoleAccessService {

    constructor(private securityHandler: SecurityHandlerService) {

        this.add("appContainer", ['public']);
        this.add("appContainer.mainApp", ['public']);
        this.add("appContainer.mainApp.about", ['public']);
        this.add("appContainer.mainApp.home", ['public']);


        this.add("appContainer.mainApp", ['public']);
        this.add("appContainer.mainApp.default", ['public']);

        this.add("appContainer.mainApp.register", ['public']);
        this.add("appContainer.mainApp.resetPassword", ['public']);
        this.add("appContainer.mainApp.about", ['public']);

        this.add("appContainer.mainApp.twoSidePanel", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.allDataModel", ['public']);

        this.add("appContainer.simpleApp", ['public']);
        this.add("appContainer.simpleApp.home", ['public']);
        this.add("appContainer.simpleApp.result", ['public']);
        this.add("appContainer.simpleApp.filter", ['public']);
        this.add("appContainer.simpleApp.submission", ['public']);
        this.add("appContainer.simpleApp.element", ['public']);
        this.add("appContainer.simpleApp.notImplemented", ['public']);
        this.add("appContainer.simpleApp.serverError", ['public']);
        this.add("appContainer.simpleApp.resourceNotFound", ['public']);
        this.add("appContainer.simpleApp.notAuthorized", ['public']);

        this.add("appContainer.mainApp.twoSidePanel.catalogue.dataType", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.dataModel", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.codeSet", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.terminology", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.term", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.dataElement", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.dataClass", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.selection", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.classification", ['public']);

        this.add("appContainer.mainApp.twoSidePanel.catalogue.resourceNotFound", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.serverError", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.notImplemented", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.notAuthorized", ['public']);

        this.add("appContainer.mainApp.twoSidePanel.catalogue.search", ['public']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.folder", ['public']);
        this.add("otherwise", ['public']);

        this.add("appContainer.mainApp.twoSidePanel.catalogue.newVersionDataModel", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.newVersionTerminology", ['administrator', 'editor']);

        this.add("appContainer.userArea", ['administrator', 'editor']);
        this.add("appContainer.userArea.profile", ['administrator', 'editor']);
        this.add("appContainer.userArea.changePassword", ['administrator', 'editor']);
        this.add("appContainer.userArea.settings", ['administrator', 'editor']);

        this.add("appContainer.mainApp.diagram", ['public']);
        this.add("appContainer.mainApp.dataFlowTransformation", ['public']);
        this.add("appContainer.mainApp.dataFlowDM2DM", ['public']);
        this.add("appContainer.mainApp.dataFlowChain", ['public']);
        this.add("appContainer.mainApp.topicView", ['public']);

        this.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataModel", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataElement", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataClass", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataType", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.NewClassifier", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet", ['administrator', 'editor']);

        this.add("appContainer.adminArea", ['administrator']);
        this.add("appContainer.adminArea.users", ['administrator']);
        this.add("appContainer.adminArea.user", ['administrator']);
        this.add("appContainer.adminArea.groups", ['administrator']);
        this.add("appContainer.adminArea.group", ['administrator']);
        this.add("appContainer.adminArea.pendingUsers", ['administrator']);
        this.add("appContainer.adminArea.configuration", ['administrator']);
        this.add("appContainer.adminArea.home", ['administrator']);
        this.add("appContainer.adminArea.resourceNotFound", ['administrator']);
        this.add("appContainer.adminArea.emails", ['administrator']);
        this.add("appContainer.adminArea.modelManagement", ['administrator']);

        this.add("appContainer.mainApp.twoSidePanel.catalogue.import", ['administrator', 'editor']);
        this.add("appContainer.mainApp.twoSidePanel.catalogue.dataModelsExport", ['administrator', 'editor']);
        this.add("appContainer.mainApp.modelsComparison", ['administrator', 'editor']);
        this.add("appContainer.mainApp.linkSuggestion", ['administrator', 'editor']);
    }

    allRoles = {
        unregistered: { writable: false },
        editor: { writable: true },
        administrator: { writable: true }
    };

    stateRoleAccessProvider: any = {};
    mappings: any = {};

    add = (state, accessRoles) => {

        if (accessRoles === undefined || accessRoles === null || state === undefined || state == null) {
            return;
        }

        //lowercase the values
        // angular.forEach(accessRoles, function(value, index) {
        //   accessRoles[index] = value.toLowerCase();
        // });

        for (var item of accessRoles) {
            item = item.toLowerCase();
        }

        this.mappings[state.toLowerCase()] = accessRoles;
    };

    getAccessMap = () => {
        return this.mappings;
    };

    hasAccess = (state) => {


        var allowedStates = [
            "appContainer.mainApp.about", "appContainer.userArea.profile",
            "appContainer.userArea.changePassword"
        ];

        //if(cookies.get('needsToResetPassword') === "true"){
        //  if(allowedStates.indexOf(state) === -1){
        //    return false;
        //  }else{
        //    return true;
        //  }
        //}

        if (state) {
            state = state.toLowerCase();
        }
        //if this state does not exist, JUST DOT NOT LET THEM ACCESS!!!!
        if (!this.mappings[state]) {
            return false;
        }

        //if it is a public resource, then show it, regardless of the user role
        if (this.mappings[state].indexOf('public') !== -1) {
            return true;
        }

        //if it is NOT a public resource, then check if user has enough access

        ////if the user is not logged in then return false
        if (!this.securityHandler.isLoggedIn()) {
            return false;
        }
        
        //////if this user is logged In but its role does NOT exist in valid role for this resource
        var user = this.securityHandler.getCurrentUser();
        return this.mappings[state].indexOf(user.role.toLowerCase()) !== -1;

    }

    getAllRoles = () => {
        return this.allRoles;
    }
}



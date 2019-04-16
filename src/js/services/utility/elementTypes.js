angular.module('services').provider('elementTypes', function () {

	var provider = {};

    var semanticLinkTypes = {
        'Refines': { title:'Refines', editable: true},
        'Does Not Refine': {title:'Does Not Refine', editable: true},

        'Is From': {title:'Is From',  editable: false},
        'Superseded By' :{title:'Superseded By', editable: false},
        'New Version Of':{title:'New Version Of', editable: false}
    };


	var allTypes =  {
        'Folder':   {id:"Folder", link: "folder", title: 'Folder', markdown:"FD", isBase:true},

        'DataModel':   {id:"DataModel", link: "dataModel", title: 'DataModel', markdown:"DM", isBase:true, classifiable:true},

        'DataSet':   {id:"DataSet",  link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},
        'Database':  {id:"Database", link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},
        'DataStandard': {id:"DataStandard",link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},
        'Form':     {id:"Form",link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},
        'Message':  {id:"Message",link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},
        'Report':   {id:"Report",link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},
        'Workflow': {id:"Workflow",link: "dataModel", title: 'DataModel', baseTitle: 'DataModel', markdown:"DM", classifiable:true},

        'DataClass': {id:"DataClass",link: "dataClass", title: 'DataClass', markdown:"DC", baseTitle: 'DataClass', isBase:true, classifiable:true},

        'DataElement': {id:"DataElement",link: "dataElement", title: 'DataElement', markdown:"DE", baseTitle: 'DataElement', isBase:true, classifiable:true},


        'DataType':        {id:"DataType",link: "dataType", title: 'DataType', markdown:"DT", isBase:true, classifiable:true},

        'EnumerationType': {id:"EnumerationType",link: "dataType", title: 'DataType (Enum)', baseTitle: 'DataType', markdown:"DT", displayLabel:"Enumeration", classifiable:true},
        'PrimitiveType':   {id:"PrimitiveType",link: "dataType", title: 'DataType (Primitive)', baseTitle: 'DataType', markdown:"DT", displayLabel:"Primitive", classifiable:true},
        'ReferenceType':   {id:"ReferenceType",link: "dataType", title: 'DataType (Reference)', baseTitle: 'DataType', markdown:"DT", displayLabel:"Reference", classifiable:true},
        'TerminologyType':   {id:"TerminologyType",link: "dataType", title: 'DataType (Terminology)', baseTitle: 'DataType', markdown:"DT", displayLabel:"Terminology", classifiable:true},


        'EnumerationValue':{id:"EnumerationValue",link: "dataType", title: 'EnumerationValue', baseTitle: 'CatalogueItem', markdown:"EV", isBase:true},


        'Terminology':  {id:"Terminology",link: "terminology", title: 'Terminology', baseTitle: 'Terminology', markdown:"TG", isBase:true},
        'Term':         {id:"Term",       link: "term",        title: 'Term',        baseTitle: 'Term', markdown:"TM",        isBase:true},


        'Classifier':    {id:"Classifier",link: "classification", title: 'Classifier', resourceName:'classifier', markdown:"CS",  isBase:true},


    };

	var baseTypes = {
        'DataModel':   {id:"DataModel", link: "dataModel", title: 'DataModel', resourceName:'dataModel', markdown:"DM", classifiable:true},
        'DataClass':   {id:"DataClass", link: "dataClass", title: 'DataClass', resourceName:'dataClass', markdown:"DC", classifiable:true},
        'DataElement': {id:"DataElement", link: "dataElement", title: 'DataElement', resourceName:'dataElement', markdown:"DE", classifiable:true},
        'DataType':    {id:"DataType",link: "dataType", title: 'DataType', resourceName:'dataType', markdown:"DT", classifiable:true},

        'Classifier':    {id:"Classifier",link: "classifier", title: 'Classifier', resourceName:'classifier', markdown:"CS"},

        'Terminology':  {id:"Terminology",link: "terminology", title: 'Terminology', resourceName:'terminology', markdown:"TG", classifiable:true},
        'Term':         {id:"Term",link: "term", title: 'Term', resourceName:'term', markdown:"TM", classifiable:true},

        'Folder':         {id:"Folder",link: "folder", title: 'Folder', resourceName:'folder', markdown:"FD", classifiable:true},

        'EnumerationValue':{id:"EnumerationValue",link: "dataType", title: 'EnumerationValue', baseTitle: 'CatalogueItem', markdown:"EV", isBase:true},

    };


	var userTypes = {
        'UserGroup': {id:"UserGroup", link: "userGroup", title: 'UserGroup', resourceName:'userGroup'},
        'User':      {id:"User", link: "user", title: 'User', resourceName:'user'},
    };



	provider.$get =  function($rootScope, stateHandler){
        'ngInject'

        var factory = {};

		factory.getSemanticLinkTypes = function(){
		    return semanticLinkTypes;
        };


		factory.getTypes = function (){
			return allTypes;
		};

        factory.getBaseTypes = function (){
            return baseTypes;
        };

        factory.getUserTypes = function (){
            return userTypes;
        };

		factory.getTypesAsArray = function () {
			var array = [];
            for (var property in allTypes) {
                if (allTypes.hasOwnProperty(property)) {
                    array.push(allTypes[property])
                }
            }
            return array;
        };


        factory.getBaseTypesAsArray = function () {
            var array = [];
            for (var property in baseTypes) {
                if (baseTypes.hasOwnProperty(property)) {
                    array.push(baseTypes[property])
                }
            }
            return array;
        };

		factory.equals = function (actual, expected) {
			if(actual.toLowerCase() === expected.toLowerCase() ||
				(allTypes[actual] && allTypes[actual].baseTitle && allTypes[actual].baseTitle.toLowerCase() === expected.toLowerCase() )) {
                return true;
            }
            return false;
        };


        factory.getLinkUrl = function (element, mode) {
            if(!element || !element.id){
                return "";
            }

            var types = this.getTypes();
            var parentDataModel = null;
            var parentDataClass = null;
            if(element.dataModel){
                parentDataModel = element.dataModel;
            }else if(element.breadcrumbs){
                parentDataModel = element.breadcrumbs[0].id;
            }

            if(element.domainType === "DataClass"){
                if(element.parentDataClass){
                    parentDataClass = element.parentDataClass;
                }else if(element.breadcrumbs && element.breadcrumbs.length >= 2){
                    parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1].id;
                }
            }


            if(element.domainType === "DataElement"){
                if(element.dataClass) {
                    parentDataClass = element.dataClass;
                }else if (element.breadcrumbs){
                    parentDataClass = element.breadcrumbs[element.breadcrumbs.length-1].id;
                }
            }


            if(element.domainType === "EnumerationValue"){
                var dataTypeId = element.dataType;
                if(!dataTypeId){
                    dataTypeId = element.breadcrumbs[1].id;
                }
                return stateHandler.getURL('appContainer.mainApp.twoSidePanel.catalogue.' + types[element.domainType].link,
                    {   id: dataTypeId,
                        dataModelId: parentDataModel,
                    });
            }

            return stateHandler.getURL('appContainer.mainApp.twoSidePanel.catalogue.' + types[element.domainType].link,
                {   id: element.id,
                    dataModelId: parentDataModel,
                    dataClassId: parentDataClass,
                    terminologyId: element.terminology,
                    domainType: element.domainType,
                    mode: mode
                });
        };



		factory.getTypesForBaseTypeArray = function(baseType) {
            var array = [];
            for (var property in allTypes) {
                if (allTypes.hasOwnProperty(property)) {
                    if(!allTypes[property].isBase && allTypes[property].baseTitle.toLowerCase() === baseType.toLowerCase()){
                        array.push(allTypes[property]);
                    }
                }
            }
            return array;
        };

        factory.getTypesForBaseType = function(baseType) {
            var result = {};
            for (var property in allTypes) {
                if (allTypes.hasOwnProperty(property)) {
                    if(!allTypes[property].isBase && allTypes[property].baseTitle.toLowerCase() === baseType.toLowerCase()){
                            result[property] = allTypes[property];
                    }
                }
            }
            return result;
        };

		factory.getType = function (type) {
            return allTypes[type];
        };

        factory.getAllDataTypesArray = function () {
            var dataTypes = _.filter(allTypes, function(type){ return type.baseTitle === 'DataType'; });
            return dataTypes;
        };
        factory.getAllDataTypesMap = function () {
            var dataTypes = factory.getAllDataTypesArray();
            var dtMap = {};
            angular.forEach(dataTypes, function (dt) {
                dtMap[dt.id] = dt;
            });
            return dtMap;
        };

		return factory;
	};
	return provider;
});


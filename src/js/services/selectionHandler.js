
'use strict';

angular.module('services').provider('selectionHandler', function () {
	var provider = {};
	provider.selections = null;

	provider.$get = ['localStorageService', function(localStorageService){
		var factory = {};

		factory.getSelections = function (){
			var result = localStorageService.get("selections");
			if(result) {
				return result;
			}
			return {};
		};

		factory.add = function(element,elementType) {
			var selections = factory.getSelections();
			element.mcType = elementType;
			element.selected = true;
			selections[element.id] = element;
			localStorageService.set("selections",selections);
			return element;
		};

		factory.remove = function(element){
			var selections = factory.getSelections();
			element.selected = false;
			delete selections[element.id];
			localStorageService.set("selections",selections);
			return element;
		};


		factory.isSelected = function(element) {
			var selections = factory.getSelections();
			if(element.id) {
				return (selections[element.id] !== undefined );
			}else{
				return false;
			}
		};
		return factory;
	}];
	return provider;
});
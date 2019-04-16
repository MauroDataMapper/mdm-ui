angular.module('directives').directive('elementStatus', function () {
		return{
			restrict: 'E',
			scope: {
				mcElement: "="
			},
			template: '<span ng-show="!mcElement.finalised" class="label label-warning" style="vertical-align: middle;font-size: 9px;">Draft</span>\
					   <span ng-show="mcElement.finalised" class="label label-success"  style="vertical-align: middle;font-size: 9px;" title="Finalised element is not editable!">Finalised</span>'

		};
	});
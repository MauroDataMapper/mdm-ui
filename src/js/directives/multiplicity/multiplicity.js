angular.module('directives').directive('multiplicity', function () {
		return{
			restrict: 'E',
			scope: {
				min: "=",
				max: "="
			},
			template:
			'<span class="multiplicity" ng-hide="(min == null && max == null) || (min == undefined && max == undefined) || (min.trim().length == 0 && max.trim().length == 0)">'+
				'<span ng-show="min != null && min != -1">{{min}}</span>'+
            	'<span ng-show="min != null && min == -1"><span class="unboundMultiplicity">*</span></span>'+
				'<span>..</span>'+
				'<span ng-show="max != null && max != -1" >{{max}}</span>'+
				'<span ng-show="max != null && max == -1"><span class="unboundMultiplicity">*</span></span>'+
            '</span>'

		};
	});
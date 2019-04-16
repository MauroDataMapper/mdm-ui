angular.module('directives').directive('mcList', function () {
		return{
			restrict: 'E',
			replace: true,
			scope: {
				rows: "=",
				columns: "=",
				tableWidth: "=",
				tableTitle: "@"
			},
			template:
				'<table class="table table-bordered">\
					<thead>\
						<tr ng-show="tableTitle" class="tableTitle"> <td colspan="{{columns.length}}">{{tableTitle}}</td> </tr>\
						<tr style="font-weight: bold;">\
							<td ng-repeat="column in columns">\
								{{column.title}}\
							</td>\
						</tr>\
					</thead>\
					<tbody>\
						<tr ng-repeat="row in rows">\
							<td ng-repeat="column in columns" ng-style="{ \'width\' : column.width}">\
								{{row[column.name]}}\
							</td>\
						</tr>\
					</tbody>\
				</table>\
				',
			link: function(scope, element, attrs){
			}
		};
	});
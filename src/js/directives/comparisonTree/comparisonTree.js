angular.module('directives').directive('comparisonTree', function ($compile, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            type:'=', //static, dynamic
            onNodeExpand:'=',
            onNodeClick:'=',
            treeName:'=',
            diffMap:'=',
            val: '=',
            parentData: '=',
            childElementName: '='
        },

        link: function (scope, element, iAttrs, ctrl) {

            if(scope.childElementName && scope.val && scope.val[scope.childElementName]){
                scope.val.items = [].concat(scope.val[scope.childElementName]);
            }

            if(scope.val.close !== false){
                scope.val.close = true;
            }
            // scope.val.close = true;
            var template = '<span style="padding-right:9px;"></span>';
            if ( (angular.isArray(scope.val.items) && scope.val.items.length > 0) || (scope.val.hasChildren)) {
                template = '<i ng-class="{\'fa\':true, \'fa-plus\':val.close ,\'fa-minus\':!val.close, \'plusMinusElement\':true,\'comparisonTree\':true}"' +
                  ' style="margin-right: 3px; font-size: 10px;' +
                  ' font-weight:' +
                  ' normal" ng-click="toggleExpand()"></i>';
            }

            template += '<span ng-class="{\'nodeLabel\':true, \'comparisonTree\':true, \'created\':val.created,' +
              ' \'deleted\':val.deleted, \'selected\':val.selected, \'isGhost\':val.isGhost, \'modified\':val.modified}"' +
              ' ng-click="nodeClick()">{{val.label}}</span>';

            template +=
              ['<ul ng-class="{\'myTree\':true, \'comparisonTree\':true, \'hide\':val.close}">',
                  '<li class="myTreeEmptyRoot comparisonTree node" ng-repeat="item in val.items">',
                      '<comparison-tree ' +
                          'val="item" ' +
                          'parent-data="val.items" ' +
                          'child-element-name="childElementName" ' +
                          'tree-name="treeName" ' +
                          'type="type"' +
                          'diff-map="diffMap"'+
                          'on-node-click="onNodeClick"'+
                          'on-node-expand="onNodeExpand">',
                      '</comparisonTree>',
                  '</li>',
               '</ul>'
              ].join('\n');

            scope.deleteMe = function (index) {
                if (scope.parentData) {
                    var itemIndex = scope.parentData.indexOf(scope.val);
                    scope.parentData.splice(itemIndex, 1);
                }
                scope.val = {};
            };

            scope.toggleExpand = function () {
                if(scope.type === 'dynamic' && scope.onNodeExpand){
                    scope.onNodeExpand(scope.val).then(function (data) {
                        scope.val.items = data;
                        scope.val.close = !scope.val.close;
                        scope.safeApply();
                    })
                }else{
                    scope.val.close = !scope.val.close;
                }
            };

            scope.nodeClick = function() {
                scope.val.selected = !scope.val.selected;
                $rootScope.$broadcast(scope.treeName + '-nodeSelected', {node: scope.val});
                if(scope.onNodeClick){
                    scope.onNodeClick(scope.val);
                }

            };


            $rootScope.$on(scope.treeName + '-nodeSelected', function(ev, data){
                if(scope.val && data.node.id !== scope.val.id && scope.val.selected) {
                    scope.val.selected = false;
                }
            });


            scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                if(phase === '$apply' || phase === '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };


            var newElement = angular.element(template);
            $compile(newElement)(scope);
            element.replaceWith(newElement);
        },

        controller: function ($scope) {

        }
    };
});

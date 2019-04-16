angular.module('directives').directive('mcImageCroppie', function () {
    return {
        restrict: 'E',
        scope: {
            src: '=',
            ngModel: '=',
            thumbnail: '=',
            thumbnailSize: '=',
            options: '='
        },
        template: '<div>    \n' +
                '    <div class="imageHolder">\n' +
                '    </div>\n' +
                '</div>',

        link: function (scope, element, attrs) {
            var options = angular.extend({
                viewport: { width: 200, height: 200 },
                boundary: { width: 300, height: 300 }
            }, scope.options);

            scope.$watch('src', function (newValue, oldValue, scope) {
                if (newValue !== null) {
                    var imageHolder = jQuery(jQuery(element[0]).find("div.imageHolder"));

                    options.url = newValue;
                    options.update = function (ev, data) {
                        //create the original output 200X200
                        imageHolder.croppie("result", {type:"base64"}).then(function (result) {
                            scope.ngModel = result;
                            scope.safeApply();
                        });
                        //create the thubmnail output 69x69
                        imageHolder.croppie("result", {type:"base64", size:{width: scope.thumbnailSize, height: scope.thumbnailSize}}).then(function (result) {
                            scope.thumbnail = result;
                            scope.safeApply();
                        });
                    };
                    //remove croppie and build it again
                    imageHolder.croppie("destroy");
                    imageHolder.croppie(options);
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
        },

        controller: function ($scope) {
        }
    };
});
angular.module('directives').directive('disableSubmitOnEnter',  function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            parent: "="
        },
        link: function (scope, iElement, iAttrs, ctrl) {
            $(iElement).keydown(function(event){
                if ( event.keyCode == 13 && (jQuery(event.target).is("select") || jQuery(event.target).is("input"))){
                    event.preventDefault();
                }
            });
        },

        controller:  function ($scope) {

        }
    };
});

angular.module('directives').directive('markdownTextArea', function (elementSelectorDialogue, markdownParser) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            hideHelpText:"=",
            rows:"=",
            //These are used for NON editableForm
            description: "=",
            inEditMode: "=",

            //These are used for editableForm
            mcEditableForm: "=",
            mcElement: "=",
            mcProperty: "=",
        },
        templateUrl: './markdownTextArea.html',
        link: function (scope, iElement, iAttrs, ctrl) {

            scope.$watch("description", function (newVal, oldVal, scope) {
                if(newVal === null || newVal === undefined){
                    scope.formData.description = "";
                }else {
                    scope.formData.description = newVal;
                }
            });

            scope.showAddElementToMarkdown = function () {


                elementSelectorDialogue.open([], true).then(function (selectedElement) {
                    if (!selectedElement) {
                        return;
                    }

                    var markdownLink = markdownParser.createMarkdownLink(selectedElement);

                    if(!scope.mcEditableForm) {
                        var textArea = jQuery(iElement).find(".markdownTextArea");
                        var position = textArea.prop("selectionStart");

                        var description = scope.formData.description.slice(0, position) + " " + markdownLink + " " + scope.formData.description.slice(position);
                        textArea.val(description);
                        scope.formData.description = description;
                        scope.description = description;
                    }else{

                        var pos = jQuery("div.xeditableTextArea").find("textarea").prop("selectionStart");

                        var currentValue = scope.mcEditableForm.$data[scope.mcProperty] ? scope.mcEditableForm.$data[scope.mcProperty] : "";
                        var desc = currentValue.slice(0, pos) + " " + markdownLink + " " + currentValue.slice(pos);
                        jQuery("div.xeditableTextArea").find("textarea").val(desc);
                        scope.mcEditableForm.$data[scope.mcProperty] = desc;
                    }
                });
            };


            scope.onDescriptionChange = function ($event) {
                if(!scope.mcEditableForm) {
                    scope.description = scope.formData.description;
                }
            };
        },

        controller: function ($scope) {

            $scope.lastWasShiftKey = null;
            $scope.formData = {
                showMarkDownPreview: false,
                description: $scope.description
            };


            $scope.descriptionKeyUp = function ($event) {
                $event.stopImmediatePropagation();

                $scope.currentShiftKey = ($event.keyCode === 16);

                if ($scope.lastWasShiftKey && $scope.currentShiftKey) {
                    $scope.showAddElementToMarkdown();
                    $scope.lastWasShiftKey = false;
                    return;
                }

                if ($scope.currentShiftKey) {
                    $scope.lastWasShiftKey = true;
                } else {
                    $scope.lastWasShiftKey = false;
                }

            };

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };


        }
    };
});

angular.module('modals').factory('elementSelectorDialogue', function ($http, $compile, $rootScope, $q) {

    return {

        open: function (validTypesToSelect, notAllowedToSelectIds) {
            var deferred = $q.defer();

            var scope = $rootScope.$new();
            scope.dialogue = {};

            if(!validTypesToSelect || (validTypesToSelect && validTypesToSelect.length === 0)){
                validTypesToSelect = ["Folder", "DataModel", "DataClass", "DataType", "DataElement", "Term"];
            }
            scope.validTypesToSelect = validTypesToSelect;
            scope.notAllowedToSelectIds = notAllowedToSelectIds;

            var element = angular.element('<div id="myDialogId" style="overflow-x:hidden !important;overflow-y:hidden !important;"><element-selector-2 dialogue="dialogue" valid-types-to-select="validTypesToSelect" not-allowed-to-select-ids="notAllowedToSelectIds"></element-selector-2></div>');
            $compile(element)(scope);

            scope.dialogue = jQuery( element ).dialog({
                modal: true,
                width:500,
                autoResize:false,
                position: undefined,
                title:"Element Selector",
                resizable: false,
                open: function (event, ui) {
                    jQuery('.ui-dialog').css('z-index',1000);
                    jQuery('.ui-dialog').css('overflow-y', 'hidden !important');
                    jQuery('.ui-dialog').css('overflow-x', 'hidden !important');

                    jQuery(".ui-dialog-titlebar").addClass("themeBackground");
                    jQuery(".ui-dialog-titlebar").css("color","#fff");
                    $('#myDialogId').css('overflow-x', 'hidden !important'); //this line does the actual hiding
                    $('#myDialogId').css('overflow-y', 'hidden !important'); //this line does the actual hiding
                },
                close: function (event, ui) {
                    var selectedElement = jQuery(this).data("selectedElement");
                    deferred.resolve(selectedElement);
                },
                resize: function(event, ui) {
                    // alert("Width: " + $(this).outerWidth() + ", height: " + $(this).outerHeight());
                    // jQuery($scope.dialogue).dialog({width: 900,height:800});
                }
            });


            return deferred.promise;
        },
    };
});

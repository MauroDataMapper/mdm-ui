angular.module('directives').directive('editableFormButtons', function () {
	return{
		restrict: 'E',
		scope: {
			deleteIcon:"=",
            deleteTitle:"=",
            editTitle:"=",
			processing: "=",
			editable: "=",
			onEditClicked:"&",
			onDeleteClicked:"&",
			onConfirmDelete:"&",
			onCancelDelete:"&",
			onCancelEdit:"&",
			onSave:"&",
			hasSeparateEditForm:"@",
			textLocation:"@",
			hideDelete:"@",
			hideEdit:"@",
			hideCancel:"="
		},
		templateUrl: './editableFormButtons.html',
		link: function (scope, element, attrs) {

			scope.displayDeleteTitle = scope.deleteTitle;
            scope.displayDeleteIcon  = scope.deleteIcon;

            if(!scope.displayDeleteTitle){
                scope.displayDeleteTitle = "Delete";
            }

			if(!scope.displayDeleteIcon){
                scope.displayDeleteIcon = "fa-trash-o";
			}

            scope.displayEditTitle = scope.editTitle;
            if(!scope.displayEditTitle){
                scope.displayEditTitle = "Edit";
            }

            if(scope.onConfirmDelete) {
                scope.onConfirmDelete = scope.onConfirmDelete();
            }

            if(scope.onEditClicked) {
                scope.onEditClicked = scope.onEditClicked();
            }

            if(scope.onCancelEdit){
            	scope.onCancelEdit = scope.onCancelEdit();
						}


			if(scope.editable) {
				scope.editable.$deletePending = false;
			}

			scope.editClicked = function () {
				if (scope.onEditClicked) {
					scope.onEditClicked();
				}
				//if it does not have 'hasSeparateEditForm' && has 'editable'
				if(!scope.hasSeparateEditForm && scope.editable) {
					scope.editable.$show();
				}
			}
			/// Delete ----------------------------------------
			scope.deleteClicked = function(){
				if (scope.onDeleteClicked) {
					scope.onDeleteClicked();
				}
				if(scope.editable) {
					scope.editable.$deletePending = true;
				}
			};

			scope.cancelDeleteClicked = function(){
				if(scope.editable) {
					scope.editable.$deletePending = false;
				}
				if(scope.onCancelDelete) {
					scope.onCancelDelete();
				}
			};

			scope.confirmDeleteClicked = function(){
				if(scope.editable) {
					scope.editable.$deletePending = false;
				}
				if(scope.onConfirmDelete) {
					scope.onConfirmDelete();
				}
			};
			/// 	----------------------------------------



			scope.cancelEditClicked = function(){
				if(scope.editable) {
					scope.editable.$cancel();
				}
				if(scope.onCancelEdit) {
					scope.onCancelEdit();
				}
			};

			scope.saveClicked = function(){
				if(scope.onSave) {
					scope.onSave();
				}
				return true;//as it is submit
			};

		}
	};
});



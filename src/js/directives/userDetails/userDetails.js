angular.module('directives').directive('userDetails', function (resources, $timeout) {
	return{
		restrict: 'E',
		replace: true,
		scope: {
			user: '=?',
			onAfterSave: '=?',
			onEditClicked: '&?',
			showEditable: '=?',
			hideCancelButton: '=?',
			hideUpdated: '=?',
			editUsername: '=?',
			public: '=?'
		},
        templateUrl: './userDetails.html',
		controllerAs: 'vm',
		link: function (scope, element) {
			if (scope.showEditable && scope.editableForm) {
				scope.editableForm.$show();
			}

			scope.$watch('showEditable', function (showEditable) {
				if (showEditable) {
					
					$timeout(function() {
						(angular.element(element[0].querySelector("input[name='username']"))[0]).focus();
					});

					scope.editableForm.$show();
				} else {
					scope.editableForm.$hide();
				}
			});


            scope.$watch('editUsername', function (newValue, oldValue) {
                if (newValue == true) {
                    $timeout(function() {
                        (angular.element(element[0].querySelector("input[name='username']"))[0]).focus();
                    });
				}
            });

		},
		controller: function(){

			this.checkEmailExists = function (data) {
				return resources.catalogueUser.get(null, "userExists/"+ data).then(function (exists) {
					if (!data) {
						return 'User "email address" can not be empty.'
					}
					return exists ? 'Email address already exists.' : null;
				});
			};

			this.validate = function(label, data){
				if (!data || !data.trim()) {
					return 'User "'+label+'" can not be empty.';
				}
			};
		}
	};
});

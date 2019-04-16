
import 'ng-toast';

angular.module('services').factory('messageHandler',  function ($q, resources, ngToast) {


    //manually added messages from .../metadata-catalogue/mc-core/grails-app/i18n/messages.properties
    // var messages = [
    //     {
    //         pattern: 'Property (\\[.*\\]) of class (\\[.*\\]) with value (\\[.*\\]) does not match the required pattern (\\[.*\\])',
    //         text: 'Property {0} with value {2} does not match the required pattern'
    //     },
    //     {
    //         pattern: 'Property (\\[.*\\]) of class (\\[.*\\]) with value (\\[.*\\]) is not a valid URL',
    //         text: 'Property {0} with value {2} is not a valid URL'
    //     },
    //     {
    //         pattern: 'Property (\\[.*\\]) of class (\\[.*\\]) with value (\\[.*\\]) is not a valid e-mail address',
    //         text: 'Property {0} with value {2} is not a valid e-mail address'
    //     },
    //     {
    //         pattern: 'Property (\\[.*\\]) of class (\\[.*\\]) cannot be null',
    //         text: 'Property {0} cannot be null'
    //     },
    //     {
    //         pattern:'Property (\\[.*\\]) of class (\\[.*\\]) with value (\\[.*\\]) must be unique',
    //         text:'Property {0} with value {2} must be unique'
    //     },
    //
    //     {
    //         pattern:'Property (\\[.*\\]) of class (\\[.*\\]) cannot be (\\[.*\\]) for admin registrations',
    //         text:'Property {0} cannot be {2} for admin registrations'
    //     },
    //     {
    //         pattern:'Cannot change password for user (\\[.*\\]) as old password is not valid',
    //         text:'Old password is not valid'
    //     },
    //     {
    //         pattern:'A search term must be provided',
    //         text:'Please provide a search term'
    //     },
    //     {
    //         pattern:'Cannot confirm user registration for (\\[.*\\]) as user is already registered',
    //         text:'Cannot confirm user registration for {0} as user is already registered'},
    //     {
    //         pattern:'Cannot make user (\\[.*\\]) administrator as user is already an administrator',
    //         text:'Cannot make user administrator as user is already an administrator'},
    //     {
    //         pattern:'Cannot revoke user (\\[.*\\]) as administrator as user is not an administrator',
    //         text:'Cannot revoke user as administrator as user is not an administrator'
    //     },
    //     {
    //         pattern:'Cannot revoke self as administrator',
    //         text:'Cannot revoke self as administrator'
    //     },
    //     {
    //         pattern:'Property (\\[.*\\]) of class (\\[.*\\]) has non-unique values (\\[.*\\]) on property (\\[.*\\])',
    //         text:"Property '{0}' has non-unique values '{2}' on property '{3}'"
    //     },
    //     {
    //         pattern:'Property (\\[.*\\]) of class (\\[.*\\]) cannot be the same as property (\\[.*\\])',
    //         text:'Property {0} cannot be the same as property {2}'
    //     },
    //     {
    //         pattern:'Property (\\[.*\\]) of class (\\[.*\\]) cannot be updated once it has been set',
    //         text:'Property {0} cannot be updated once it has been set'
    //     },
    //     {
    //         pattern:'DataModel (\\[.*\\]) cannot have a new version as it is not finalised',
    //         text:'Data Model cannot have a new version as it is not finalised'
    //     },
    //     {
    //         pattern:'DataModel (\\[.*\\]) cannot have a new version as it has been superseded by (\\[.*\\])',
    //         text:'Data Model cannot have a new version as it has been superseded by another Data Model'
    //     },
    //     {
    //         pattern:'Property (\\[.*\\]) of class (\\[.*\\]) with value (\\[.*\\]) must already exist with a documentation version prior to (\\[.*\\])',
    //         text:'Property {0} with value {2} must already exist with a documentation version prior to {3}'
    //     },
    //     {
    //         pattern:'DataFlow (\\[.*\\]) already exists between target (\\[.*\\]) and source (\\[.*\\])',
    //         text:'DataFlow already exists between target {1} and source {2}',
    //     },
    //     {
    //         pattern:'Property (\\[.*\\]) is type-mismatched',
    //         text:'Property {0} is type-mismatched',
    //     }
    // ];

    return {

        showError: function (defaultMessage, error) {
            var text = defaultMessage;
            if (error && error.status === 422) {
                var result = this.getErrorText(error);
                if (result) {
                    text = result;
                }
            }
            ngToast.create({
                className: 'alert alert-danger',
                content: text
            });
        },

        showSuccess: function (message) {
            ngToast.create(message);
        },

        showWarning: function (message, timeout, className) {
            ngToast.create({
                timeout: timeout,
                className: 'alert alert-warning ' + className,
                content: message});
        },

        getErrorText: function (error) {
            var errorText = "";

            if (error.data && error.data.errors) {
                errorText = error.data.errors[0].message;
            }
            if (error.data && error.data.validationErrors && error.data.validationErrors.errors) {
                errorText = error.data.validationErrors.errors[0].message;
            }
            return errorText;

            // for (var i = 0; i < messages.length; i++) {
            //     var message = messages[i];
            //     var match = errorText.match(new RegExp(message.pattern));
            //     if (match) {
            //         var text = message.text;
            //         for (var j = 1; j < match.length; j++) {
            //             var word = match[j].replace('[', '').replace(']', '');
            //             text = text.replace('{' + (j - 1) + '}', word);
            //         }
            //         return text;
            //     }
            // }
        }


    };
});

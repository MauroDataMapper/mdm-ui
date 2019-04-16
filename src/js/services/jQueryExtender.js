'use strict';
angular.module('services').factory("jQueryExtender",[ function() {
	return {
        addContainsi: function () {
            //This will extend jQuery to support case insensitive search by using 'containsi' .........................
            jQuery.extend($.expr[':'], {
                'containsi': function (elem, i, match, array) {
                    var text = (elem.textContent || elem.innerText || '');
                    return text.toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
                }
            });
            //.........................................................................................................
        }
    }
}]);

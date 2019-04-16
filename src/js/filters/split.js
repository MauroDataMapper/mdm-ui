angular.module('filters').filter('split', function() {
    return function(input, splitChar, splitIndex) {
        var splitted = input.split(splitChar);
        var index = (splitIndex === 'last') ? splitted.length - 1 : splitIndex;

        return splitted[index];
    }
});
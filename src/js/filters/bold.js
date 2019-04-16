angular.module('filters').filter('mcBold', function($sce) {
	return function (text, phrase) {
		if (phrase && text && phrase.trim().length > 0 && text.trim().length > 0) {
			text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<strong>$1</strong>');
			return $sce.trustAsHtml(text)
		}else{
			return $sce.trustAsHtml(text)
		}
	}
});
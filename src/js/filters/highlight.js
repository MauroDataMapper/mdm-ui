angular.module('filters').filter('mchighlighter', function($sce) {


    function escape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

	return function (text, phrase, wildcardMatch) {

		if (phrase && text && phrase.trim().length > 0 && text.trim().length > 0) {

            //if wildcardMatch then for "patient demographic" it should match patient and demographic
            if(wildcardMatch){
                var sections = phrase.split(" ");
                angular.forEach(sections, function (section) {
                    text = text.replace(new RegExp('(' + escape(section) + ')', 'gi'), '<span class="mcHighlighter">$1</span>');
				});
            }else {
                text = text.replace(new RegExp('(' + escape(phrase) + ')', 'gi'), '<span class="mcHighlighter">$1</span>');
            }
			return $sce.trustAsHtml(text);
		}else{
			return $sce.trustAsHtml(text);
		}
	};
});
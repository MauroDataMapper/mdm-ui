/**
 * Created by soheil on 20/06/2017.
 * http://plnkr.co/edit/3TZCMUb9XXPGP5ifHf6x?p=preview
 * https://stackoverflow.com/questions/16207202/required-attribute-not-working-with-file-input-in-angular-js
 */

angular.module('directives').directive('validFile',function(){
    return {
        require:'ngModel',
        link:function(scope,el,attrs,ngModel){
            //change event is fired when file is selected
            el.bind('change',function(){
                if(el && el.length> 0 && el[0].type != "file"){
                    return
                }
                scope.$apply(function(){
                    ngModel.$setViewValue(el.val());
                    ngModel.$render();
                });
            });
        }
    }
});
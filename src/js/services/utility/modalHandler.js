'use strict';

angular.module('services').provider("modalHandler",function(){
    //provider private section
    var allModals = {};

    return {
        //Provider config methods
        addModal: function(modalName,modalFactory) {
            allModals[modalName] = modalFactory
        },

        $get:function($injector){
            //factory private section
            var factoryObject = {};
            factoryObject.prompt = function(modalName,args){
                var modalFactory = allModals[modalName];
                var result = $injector.invoke(modalFactory,undefined,{args:args});
                return result;
            };
            return factoryObject;
        }
    };
});


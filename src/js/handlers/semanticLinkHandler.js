angular.module('handlers').factory('semanticLinkHandler', function (resources, $rootScope, messageHandler, $q) {

    function findSemanticLinkType(source, target) {
        if (source.domainType === "Term") {
            if (target.domainType === "Term") {
                //Term->Term
                return "TermSemanticLink";
            } else {
                //Term->CI
                return "TermCatalogueSemanticLink";
            }
        } else {
            if (source.domainType !== "Term" && target.domainType === "Term") {
                //CI->Term
                return "CatalogueTermSemanticLink";
            } else {
                //CI->CI
                return "CatalogueSemanticLink";
            }
        }
    }



   function action(source, target, linkId, linkType, operation){
        var deferred = $q.defer();

        var resource = {
            target: {id: target.id},
            linkType: linkType,
            domainType: findSemanticLinkType(source, target)
        };

        if (source.domainType === "Term") {

            if(operation === "POST"){
                resources.term.post(source.terminology, source.id, "semanticLinks", {resource: resource}).then(function (response) {
                    deferred.resolve(response);
                }).catch(function (error) {
                    deferred.reject(error);
                });
            }else{
                resources.term.put(source.terminology, source.id, "semanticLinks/" + linkId, {resource: resource}).then(function (response) {
                    deferred.resolve(response);
                }).catch(function (error) {
                    deferred.reject(error);
                });
            }

        }else{

            if(operation === "POST"){
                resources.catalogueItem.post(source.id, "semanticLinks", {resource: resource})
                    .then(function (response) {
                        deferred.resolve(response);
                    })
                    .catch(function (error) {
                        deferred.reject(error);
                    });
            }else{
                resources.catalogueItem.put(source.id, "semanticLinks", linkId, {resource: resource})
                    .then(function (response) {
                        deferred.resolve(response);
                    })
                    .catch(function (error) {
                        deferred.reject(error);
                    });
            }
        }

        return deferred.promise;
    }


    return {

        post: function (source, target, linkType) {
            return action(source, target, null, linkType, "POST");
        },

        put: function (source, target, linkId, linkType) {
            return action(source, target, linkId, linkType, "PUT");
        }
    };

});

angular.module('services').factory('importHandler', function() {
    return {
        getDataFlowImporters: function () {
            return resources.public.get("plugins/dataFlowImporters")
        }
    }
});

angular.module('services').factory('objectEnhancer',function(){
    return {
        diff: function (newObj, oldObj) {
            return Object.keys(newObj)
                .filter(function (key) {
                    return newObj[key] !== oldObj[key];
                })
                .reduce(function (res, key) {
                    res[key] = newObj[key];
                    return res;
                }, {});
        },

        diffCollection: function (newObj, oldObj) {
            return Object.keys(this.diff(newObj, oldObj)).reduce(function (res, key) {
                var obj = {};
                obj[key] = newObj[key];
                res.push(obj)
                return res;
            }, []);
        }
    };
});

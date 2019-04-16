angular.module('directives').directive('summaryMetadataTable', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            parent: "="
        },
        templateUrl: './summaryMetadataTable.html',
        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: function ($scope, securityHandler, $q, resources) {

            $scope.$watch('parent', function (newValue, oldValue, scope) {
                if (newValue === null || newValue === undefined) {
                    return;
                }
            });


            // $scope.random = function(){
            //     return {
            //         male: Math.floor(Math.random() * 100) + 1 ,
            //         female: Math.floor(Math.random() * 100) + 1 ,
            //         xyz: Math.floor(Math.random() * 100) + 1 ,
            //         abc: Math.floor(Math.random() * 100) + 1 ,
            //         mn:Math.floor(Math.random() * 100) + 1 ,
            //         xz:Math.floor(Math.random() * 100) + 1 ,
            //     };
            // };

            $scope.summaryMetadataFetch = function(pageSize, pageIndex, sortBy, sortType, filters) {
                var deferred = $q.defer();

                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };
                resources.facets.get($scope.parent.id, "summaryMetadata", options).then(function(result){
                    angular.forEach(result.items, function (item) {
                        if(item.summaryMetadataType && item.summaryMetadataType.toLowerCase() === "map"){
                            item.summaryMetadataType = "map";
                            angular.forEach(item.summaryMetadataReports, function (report) {
                                report.reportValue = JSON.parse(report.reportValue);
                                report.reportDate  = report.reportDate.substring(0,10);

                            });
                        }else if(item.summaryMetadataType && item.summaryMetadataType.toLowerCase() === "number"){
                            item.summaryMetadataType = "number";
                            angular.forEach(item.summaryMetadataReports, function (report) {
                                report.reportValue = parseInt(report.reportValue);
                                report.reportDate  = report.reportDate.substring(0,10);
                            });
                        }
                    });

                    $scope.result = result;
                    deferred.resolve(result);
                });

                return deferred.promise;


                // var deferred = $q.defer();
                //
                //
                //
                //
                // setTimeout(function () {
                //     var items = [
                //         {
                //             id:"GUID1",
                //             name: "Gender Distribution",
                //             description: "A Description",
                //             type: "map",
                //             summary: [
                //                 {
                //                     date: "2017-01-16",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-17",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-12",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-28",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-20",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-23",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-18",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-15",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-28",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-12",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2017-01-11",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2018-01-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2018-02-16",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2018-09-16",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-01-16",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-02-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-03-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-04-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-05-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-06-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-07-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-08-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-10-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-11-10",
                //                     value: $scope.random()
                //                 },
                //                 {
                //                     date: "2019-12-10",
                //                     value: $scope.random()
                //                 },
                //                 // {
                //                 //     date: "2020-01-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-02-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-03-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-04-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-05-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-06-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-07-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-08-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-09-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-10-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-11-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2020-12-10",
                //                 //     value: $scope.random()
                //                 // },
                //                 // {
                //                 //     date: "2021-02-10",
                //                 //     value: $scope.random()
                //                 // }
                //             ]
                //         },
                //         {
                //             id:"GUID2",
                //             name: "Population",
                //             description: "A Description",
                //             type: "number",
                //             summary: [
                //                 {
                //                     date: "2001",
                //                     value: 200,
                //                 },
                //                 {
                //                     date: "2000",
                //                     value: 240,
                //                 },
                //                 {
                //                     date: "2001",
                //                     value: 240,
                //                 },
                //                 {
                //                     date: "2019",
                //                     value: 180,
                //                 },
                //                 {
                //                     date: "2018",
                //                     value: 500,
                //                 },
                //                 {
                //                     date: "2007",
                //                     value: 300,
                //                 }
                //             ]
                //         },
                //         {
                //             id:"GUID3",
                //             name: "Coding",
                //             description: "A Description",
                //             type: "string",
                //             summary: [
                //                 {
                //                     date: "2018-10-01",
                //                     value: "ABC",
                //                 },
                //                 {
                //                     date: "2018-10-02",
                //                     male: "DEF",
                //                 },
                //                 {
                //                     date: "2018-10-03",
                //                     male: "GHI"
                //                 }
                //             ]
                //         }
                //     ];
                //
                //     var data ={
                //         items: items,
                //         count: items.length
                //     };
                //
                //
                //     deferred.resolve(data);
                // }, 500);
                //
                //
                // return deferred.promise;

            };


        }
    };
});

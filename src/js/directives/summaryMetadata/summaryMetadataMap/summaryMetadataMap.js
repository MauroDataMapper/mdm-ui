angular.module('directives').directive('summaryMetadataMap',  function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            summary: "=",
            chartType: "=",
            showMoreDetailsBtn: "="
        },
        templateUrl: './summaryMetadataMap.html',
        link: function (scope, iElement, iAttrs, ctrl) {


            scope.$watch("chartType", function (newVal, oldVal, scope) {
                if (newVal === undefined || newVal == null){return;}


                var result = scope.createDataSet(scope.summary);
                scope.chartData = {
                    originalLabels: angular.copy(result.dates),

                    labels: result.dates,
                    datasets:result.datasets
                };


                if(scope.chart){
                    scope.chart.destroy();
                }
                scope.draw(scope.chartData);
                scope.handleRangeSlider();

            });
        },

        controller: function ($scope, $element, $q, resources, messageHandler, validator, modalHandler) {

            //Just have 7 different colors, in case if we have more value categories, it should be generated randomly
            $scope.backgroundColor = ['rgba(255,99,132,0.2)', 'rgba(191, 215, 239, 0.6)', 'rgba(252, 217, 166, 0.6)', 'rgba(126, 188, 153, 0.6)', 'rgba(240, 242, 147, 0.6)' , 'rgba(188, 188, 188, 0.6)', 'rgba(40, 72, 237, 0.5)','rgba(14, 238, 249, 0.5)','rgba(255, 71, 193, 0.5)'];
            $scope.borderColor     = ['rgba(255,99,132,1.0)', 'rgba(32, 80, 129, 1.0)',   'rgba(240, 173, 78, 1.0)',  'rgba(57, 119, 84, 1.0)',   'rgba(202, 204, 122, 1.0)',  'rgba(132, 132, 132, 1.0)', 'rgba(17, 57, 255, 1.0)','rgba(0, 167, 175, 1.0)', 'rgba(150, 12, 104, 1.0)'];

            $scope.showRangeSlider = false;
            $scope.minValue = 0;

            $scope.handleRangeSlider = function(){
                if($scope.summary.summaryMetadataReports.length <= 10 ){
                    $scope.showRangeSlider = false;
                }else{
                    $scope.showRangeSlider = true;

                }

            };

            $scope.onStop = function(event, ui, fromDate, toDate){
                var data = $scope.summary;
                var result = $scope.createDataSet(data, fromDate, toDate);
                $scope.chartData.labels = result.dates;
                $scope.chartData.datasets = result.datasets;

                angular.forEach($scope.chart.data.datasets, function (dataset) {
                    dataset.data.push(data);
                });

                if($scope.chart){
                    $scope.chart.destroy();
                }
                $scope.draw($scope.chartData);
            };


            $scope.createDataSet = function (values, fromDate, toDate) {
                var dataSets = {};
                var dates = [];
                var dataSetsArray = [];

                if(typeof values.summaryMetadataReports[0].reportValue === 'object'){
                    for(var name in values.summaryMetadataReports[0].reportValue) {
                        dataSets[name] = {name:name, displayLabel: validator.capitalize(name) , data:[]};
                    }

                    var sorted =_.sortBy(values.summaryMetadataReports, function(row){ return row.reportDate; });
                    var filtered = angular.copy(sorted);

                    if(fromDate && toDate){
                        var fromDateStr = validator.formatDate(fromDate);
                        var toDateStr   = validator.formatDate(toDate);
                        filtered = _.filter(sorted, function(item){
                            if(item.reportDate > fromDateStr && item.reportDate < toDateStr){
                                return true;
                            }
                        });
                    }

                    for (var i = 0; i < filtered.length; i++) {
                        dates.push(filtered[i].reportDate);
                        angular.forEach(dataSets, function (dataset) {
                            dataSets[dataset.name].data.push(filtered[i].reportValue[dataset.name]);
                        });
                    }
                    var index = 0;
                    angular.forEach(dataSets, function (row) {
                        dataSetsArray.push({
                            label:row.displayLabel,
                            data: row.data,
                            backgroundColor: index>=$scope.backgroundColor.length ? null :$scope.backgroundColor[index],
                            borderColor:     index>=$scope.borderColor[index] ? null : $scope.borderColor[index],
                            borderWidth: 1,
                        });
                        index++;
                    });
                }

                if(typeof values.summaryMetadataReports[0].reportValue === 'number'){
                    dataSets['value'] = {data:[], displayLabel: validator.capitalize(values.name)};

                    var sorted =_.sortBy(values.summaryMetadataReports, function(row){ return row.reportDate; });
                    var filtered = angular.copy(sorted);

                    if(fromDate && toDate){
                        var fromDateStr = validator.formatDate(fromDate);
                        var toDateStr   = validator.formatDate(toDate);
                         filtered = _.filter(sorted, function(item){
                             if(item.reportDate > fromDateStr && item.reportDate < toDateStr){
                                return true;
                            }
                        });
                    }

                    for (var i = 0; i < filtered.length; i++) {
                        dates.push(filtered[i].reportDate);
                        dataSets['value'].data.push(filtered[i].reportValue);
                    }

                    dataSetsArray.push({
                        label: dataSets['value'].displayLabel,
                        data: dataSets['value'].data,
                        backgroundColor: $scope.backgroundColor[0],
                        borderColor:  $scope.borderColor[0],
                        borderWidth: 1,
                    });

                }
                return {datasets:dataSetsArray, dates:dates};
            };

            $scope.draw = function (chartData) {
                $scope.chartDiv = $($element).find("#chart");
                $scope.chart = new Chart( $scope.chartDiv, {
                    type: $scope.chartType ? $scope.chartType: 'bar',
                    data: {
                        labels: chartData.labels,
                        datasets: chartData.datasets
                    },
                    plugins: {
                        beforeDraw: function(c) {
                            //var reset_zoom = document.getElementById("reset_zoom"); //reset button
                            //var ticks  = c.scales['x-axis-0'].ticks.length; //x-axis ticks array
                            var labels = c.data.labels.length; //labels array


                            // if (ticks < labels) reset_zoom.hidden = false;
                            // else reset_zoom.hidden = true;
                        },
                        afterRender: function () {
                            if($scope.chartDiv) {

                            }
                        }
                    },
                    pan: {
                        enabled: true,
                        mode: 'y'
                    },
                    zoom: {
                        enabled: true,
                        mode: 'y',
                        limits: {
                            max: 10,
                            min: 0.5
                        }
                    },
                    options: {
                        responsive:true,
                        maintainAspectRatio: false,

                        legend: {
                            // labels: {
                            //     filter: function(legendItem, chartData) {
                            //         debugger
                            //         if (legendItem.datasetIndex > 1) {
                            //             return false;
                            //         }
                            //         return true;
                            //     }
                            // },
                            // onClick: function(e, legendItem) {
                            //     debugger
                            //     const index = legendItem.datasetIndex;
                            //     if (index === 1) {
                            //         const ci = this.chart;
                            //         [
                            //             ci.getDatasetMeta(1),
                            //             ci.getDatasetMeta(2),
                            //             ci.getDatasetMeta(3)
                            //         ].forEach(function(meta) {
                            //             meta.hidden = meta.hidden === null ? !ci.data.datasets[1].hidden : null;
                            //         });
                            //         ci.update();
                            //     } else {
                            //         // Do the original logic
                            //         Chart.defaults.global.legend.onClick.call(this, e, legendItem);
                            //     }
                            // }
                        },

                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        },
                        tooltips: {
                            callbacks: {
                                label: function () {

                                }
                            },

                        },
                    }
                });
            };


            $scope.moreDetails = function() {
                var modalInstance = modalHandler.prompt("summaryMetadataModalForm", {summary: $scope.summary, chartType:$scope.chartType});
                modalInstance.then(function (user) {

                });
            };

        }
    };
});

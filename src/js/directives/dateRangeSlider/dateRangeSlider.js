angular.module('directives').directive('dateRangeSlider', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            min: "=",
            max: "=",

            values: "=",

            onChange: "=",
            onStop:"=",
            onSlide: "=",
        },
        template: '<div><div class="flat-slider" id="slider-range"></div></div>',

        link: function (scope, iElement, iAttrs, ctrl) {

            scope.months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            scope.displayDates = [];

            
            jQuery(iElement).find("#slider-range").slider({
                range: true,
                min: 0,
                max: 100,
                values: [0,100],
                change: function( event, ui ) {
                    if(scope.onChane){
                        scope.onChane(event, ui);
                    }
                },
                slide: function( event, ui ) {
                    if(scope.onSlide){
                        scope.onSlide(event, ui);
                    }
                },
                stop: function( event, ui ) {
                    if(scope.onStop){
                        var min = ui.values[0];
                        var max = ui.values[1];

                        var result = scope.percentageToDate(min, max, scope.daysCount, scope.minDateToDisplay);
                        scope.onStop(event, ui, result.fromDate, result.toDate);
                    }
                },
            }).each(function() {
                if(!scope.values){return;}

                var result = scope.calculateDisplayDates(scope.values);
                scope.minDate = result.minDate;
                scope.maxDate = result.maxDate;
                scope.displayDates = result.displayDates;
                scope.minDateToDisplay = result.minDateToDisplay;
                scope.maxDateToDisplay = result.maxDateToDisplay;
                scope.daysCount = scope.datediff(scope.minDateToDisplay, scope.maxDateToDisplay);


                for (var i = 0; i < scope.displayDates.length; i++) {
                    var el = $('<span style="font-size: 10px;margin-left:-10px; padding-top: 8px;">' + scope.displayDates[i] + '</span>').css('left', ((i/scope.displayDates.length)*100) + '%');
                    el.css("position","absolute");

                    jQuery(iElement).find("div.flat-slider.ui-slider").append('<span style="font-size: 10px; padding-top: 8px; left: ' + ((i/scope.displayDates.length)*100)  +'%; position: absolute;border-left: 1px solid #DDD"></span>');

                    $(iElement).find("#slider-range").append(el);
                }
            });
        },

        controller: function ($scope) {


            $scope.percentageToDate = function(minPercent, maxPercent, daysCount, minDateToDisplay){

                var days1 = Math.round((daysCount * minPercent) /100);
                var days2 = Math.round((daysCount * maxPercent) /100);


                var fromDate =  $scope.addDays(minDateToDisplay, days1);
                var toDate   =  $scope.addDays(minDateToDisplay, days2);

                return {
                    fromDate: fromDate,
                    toDate: toDate
                };

            };

            $scope.calculateDisplayDates = function (values) {
                var displayDates = [];

                var sortedValues =_.sortBy(values, function(row){ return row; });

                //min & max Date in summary meta data
                var minDate = new Date(sortedValues[0]);
                var maxDate = new Date(sortedValues[sortedValues.length - 1]);

                var minDateToDisplay = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                var maxDateToDisplay = null;

                if(minDate.getFullYear() === maxDate.getFullYear() && minDate.getMonth() === maxDate.getMonth()){
                    //It's a month,  so just show middle date as 15th of the month ..............
                    displayDates.push("");
                    displayDates.push("");
                    displayDates.push("");
                    displayDates.push("");
                    maxDateToDisplay =   new Date(minDate.getFullYear(), minDate.getMonth()+1, 1);
                }else if (minDate.getFullYear() === maxDate.getFullYear()){
                    //add all months in between..................................................
                    for (var i = minDate.getMonth(); i <= maxDate.getMonth(); i++) {
                        displayDates.push($scope.months[i]);
                    }
                    maxDateToDisplay =   new Date(maxDate.getFullYear(), maxDate.getMonth()+1, 1);
                }else{
                    //add all years in between...................................................
                    for (var j = minDate.getFullYear(); j <= maxDate.getFullYear(); j++) {
                        displayDates.push(j);
                    }
                    maxDateToDisplay =   new Date(maxDate.getFullYear()+1, 0, 1);
                }
                return {
                    displayDates:displayDates,
                    minDate:minDate,
                    maxDate:maxDate,
                    minDateToDisplay:minDateToDisplay,
                    maxDateToDisplay:maxDateToDisplay};
            };

            $scope.datediff = function(first, second) {
                // Take the difference between the dates and divide by milliseconds per day.
                // Round to nearest whole number to deal with DST.
                return Math.round((second-first)/(1000*60*60*24));
            };

            $scope.addDays = function (date, days) {
                var newDate = angular.copy(date);
                newDate.setDate(newDate.getDate() + days);
                return newDate;
            };

        }
    };
});

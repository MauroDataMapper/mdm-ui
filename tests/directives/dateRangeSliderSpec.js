import {mock} from '../_globalMock';

describe('Directive: dateRangeSlider', function () {

    var scope, $rootScope, element, securityHandler, resources, $q,$httpBackend, ngToast;

    var parent = {
        id: "P-DM-ID",
        label: "P-DM-Label"
    };
    var currentUser = {
        firstName: "userFirstName",
        lastName: "userLastName"
    };

    mock.init();

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
    }));

    beforeEach(inject(function ($compile, _$rootScope_, _securityHandler_, _resources_, _$q_,_ngToast_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;
        ngToast= _ngToast_;

        scope.parent = angular.copy(parent);
        scope.mcDisplayRecords = [];

        // element = angular.element('<annotation-list parent="parent"></annotation-list>');
        element = angular.element('<date-range-slider min="0" max="100" values="values" on-stop="onStop"></date-range-slider>');
        $compile(element)(scope);

        spyOn(securityHandler, 'getCurrentUser').and.returnValue(currentUser);
    }));


    it("calculateDisplayDates creates years in slider if date values are scattered between a number of years", function () {
        scope.$digest();
        debugger
        var isolateScope = element.isolateScope();

        var dates = [
            "2010-02-03",
            "2015-02",

            "2012-01-01",
            "2012-02-01",

            "2013-02-01",

            "2019-11",
            "2016-02-01",
        ];
        var result = isolateScope.calculateDisplayDates(dates);
        expect(result.displayDates).toEqual([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019]);

        expect(result.minDate).toEqual(new Date(2010,1,3));  //2010-Feb-03
        expect(result.maxDate).toEqual(new Date(2019,10,1)); //2019-Nov-01

        expect(result.minDateToDisplay).toEqual(new Date(2010,1,1));  //2010-Feb-01
        expect(result.maxDateToDisplay).toEqual(new Date(2020,0,1));  //2020-Jan-01
    });



    it("calculateDisplayDates creates months in slider if date values are scattered within ONE year", function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        var dates = [
            "2010-02-01",
            "2010-02-16",

            "2010-03-01",
            "2010-03-05",

            "2010-04-01",
            "2010-04-15",

            "2010-08-01",
            "2010-11-15",

        ];
        var result = isolateScope.calculateDisplayDates(dates);
        expect(result.displayDates).toEqual(["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]);
        expect(result.minDate).toEqual(new Date(2010,1,1));   //2010-Feb-01
        expect(result.maxDate).toEqual(new Date(2010,10,15)); //2019-Nov-15

        expect(result.minDateToDisplay).toEqual(new Date(2010,1,1));  //2010-Feb-01
        expect(result.maxDateToDisplay).toEqual(new Date(2010,11,1)); //2020-Dec-01
    });


    it("calculateDisplayDates creates FOUR marks in slider if date values are within a MONTH", function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        var dates = [
            "2010-02",
            "2010-02-16",
            "2010-02-07",
            "2010-02-17",
        ];
        var result = isolateScope.calculateDisplayDates(dates);
        expect(result.displayDates).toEqual(["", "", "", ""]);
        expect(result.minDate).toEqual(new Date(2010,1,1));   //2010-Feb-01
        expect(result.maxDate).toEqual(new Date(2010,1,17));  //2019-Feb-17

        expect(result.minDateToDisplay).toEqual(new Date(2010,1,1));  //2010-Feb-01
        expect(result.maxDateToDisplay).toEqual(new Date(2010,2,1));  //2010-Mar-01
    });

    it("percentageToDate translate selected min/max percentage to ", function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        //From 1st January to the middle of January 2019
        var result = isolateScope.percentageToDate(0, 50, 31, new Date(2019,0,1));
        expect(result).toEqual({
            fromDate:new Date(2019,0,1),//2019-Jan-01
            toDate:new Date(2019,0,17)  //2019-Jan-17
        });

        //quarter of January 2019
        result = isolateScope.percentageToDate(0, 25, 31, new Date(2019,0,1));
        expect(result).toEqual({
            fromDate:new Date(2019,0,1),//2019-Jan-01
            toDate:new Date(2019,0,9)   //2019-Jan-09
        });

        //From middle of January 2019 to the end of January
        result = isolateScope.percentageToDate(50, 100, 31, new Date(2019,0,1));
        expect(result).toEqual({
            fromDate:new Date(2019,0,17), //2019-Jan-15
            toDate:new Date(2019,1,1)     //2019-Feb-01
        });

        //From beginning of 2019 to the middle of 2019
        result = isolateScope.percentageToDate(0, 50, 365, new Date(2019,0,1));
        expect(result).toEqual({
            fromDate:new Date(2019,0,1), //2019-Jan-01
            toDate:new Date(2019,6,3)    //2019-Jul-03
        });

        //From middle of 2019 to the end of 2019
        result = isolateScope.percentageToDate(50, 100, 365, new Date(2019,0,1));
        expect(result).toEqual({
            fromDate:new Date(2019,6,3), //2019-Jan-01
            toDate:new Date(2020,0,1)   //2019-Jul-03
        });

        //From middle of 2019 to the 3rd quarter of 2019
        result = isolateScope.percentageToDate(50, 75, 365, new Date(2019,0,1));
        expect(result).toEqual({
            fromDate:new Date(2019,6,3), //2019-Jan-01
            toDate:new Date(2019,9,2)    //2019-Oct-02
        });

    });


});
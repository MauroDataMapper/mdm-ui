import {mock} from './_globalMock';

describe('Directive: elementLink', function () {

    var scope, $rootScope, element, $httpBackend, $compile;
    var showParentDataModelName = false;

    mock.init();
    beforeEach(inject(function (_$httpBackend_, _$compile_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $compile = _$compile_;
    }));

    function init(mcElement, showTypeTitle) {
        scope.mcElement = mcElement;
        scope.showTypeTitle = showTypeTitle;
        scope.showParentDataModelName = showParentDataModelName;

        element = angular.element('<element-link mc-element="mcElement" show-type-title="showTypeTitle" show-parent-data-model-name="showParentDataModelName"></element-link>');
        $compile(element)(scope);
    }

    it('Displays element label & type',  function () {
        var mcElement = {id:"DM-ID", label:"DM-LABEL", domainType: "DataModel"};
        init(mcElement, true);
        scope.$digest();
        var linkEl = jQuery(element).find("a");
        var typeLabelEl = jQuery(element).find("span.MCElementType");

        expect(linkEl.length).toEqual(1);
        expect(linkEl.text()).toEqual("DM-LABEL");

        expect(typeLabelEl.length).toEqual(1);
        expect(typeLabelEl.text()).toEqual("DataModel");


        mcElement = {code:"TM-ID", definition:"TM-LABEL", domainType: "Term"};
        init(mcElement, true);
        scope.$digest();
        linkEl = jQuery(element).find("a");
        typeLabelEl = jQuery(element).find("span.MCElementType");

        expect(linkEl.length).toEqual(1);
        expect(linkEl.text()).toEqual("TM-ID : TM-LABEL");

        expect(typeLabelEl.length).toEqual(1);
        expect(typeLabelEl.text()).toEqual("Term");
    });

    it('Displays parent dataModel label if showParentDataModelName is True',  function () {
        showParentDataModelName = true;
        var mcElement = {id:"DM-ID", label:"DC-LABEL", domainType: "DataClass", breadcrumbs:[{id:"P-DM-ID", label:"P-DM-LABEL"}]};
        init(mcElement, true);
        scope.$digest();
        var linkEl = jQuery(element).find("a");
        var typeLabelEl = jQuery(element).find("span.MCElementType");

        expect(linkEl.length).toEqual(1);
        expect(linkEl.text()).toEqual("P-DM-LABEL : DC-LABEL");

        expect(typeLabelEl.length).toEqual(1);
        expect(typeLabelEl.text()).toEqual("DataClass");
    });

});
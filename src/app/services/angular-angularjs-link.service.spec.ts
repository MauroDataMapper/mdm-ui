import { TestBed } from "@angular/core/testing";
import { AngularAngularjsLinkService } from "./angular-angularjs-link.service";

describe('AngularAngularjsLinkService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AngularAngularjsLinkService,
                // {provide: $rootScope, }
            ]
        });
    });

    it('should create', () => {
        // const service: AngularAngularjsLinkService = TestBed.get(AngularAngularjsLinkService);
        const service = new AngularAngularjsLinkService(null);
        expect(service).toBeTruthy();
    });
});
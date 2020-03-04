import {TestBed, ComponentFixture} from '@angular/core/testing';

import {StateHandlerService} from './state-handler.service';
import {UIRouter, StateService, StateDeclaration, StateOrName, RawParams, HrefOptions} from '@uirouter/core';

describe('StateHandlerService', () => {
  let spyRouter: UIRouter;
  let currentText = "";   // What the spyRouter.stateService.current.toString() returns.

  beforeEach(() => {
    /**
     * Build a mock UIRouter and add some spies the tests can use.
     */
    spyRouter = <UIRouter> {
      stateService: <StateService> {
        reload: function () {
        },
        href: function (name: string, params): string {
          return name;
        },
        current: <StateDeclaration> {
        }
      }
    }

    spyOn(spyRouter.stateService, "reload");  // To verify if reload() is called.

    /**
     * Calls to the routers href() always return the value of the stateOrName
     * giving a predictable value to be checked in the test.
     */
    spyOn(spyRouter.stateService, "href").and.callFake((stateOrName, params) => {
      return stateOrName.toString();
    });
    /**
     * Allow tests to control the result by setting currentText.
     */
    spyRouter.stateService.current.toString = jasmine.createSpy("toString()").and.callFake(function() {
      return currentText;
    })

    /**
     * Set up the test bed to support creation of StateHandlerService instances.
     */
    TestBed.configureTestingModule({
      providers: [
        StateHandlerService,
        {provide: UIRouter, useValue: spyRouter}
      ]
    }).compileComponents();
  });

  it('should be created', () => {
    const handlerService = TestBed.get(StateHandlerService);
    expect(handlerService).toBeTruthy();
  });

  /**
   * Verifies that calling reload() gets passed through to the UIRouter's
   * reload and that no arguments are passed.
   */
  it('should reload', function () {
    const handlerService = TestBed.get(StateHandlerService);

    handlerService.reload();
    expect(spyRouter.stateService.reload).toHaveBeenCalledWith();
  });

  /**
   * Getting a Url for a folder.
   */
  it('should get folder url', () => {
    const handlerService = TestBed.get(StateHandlerService);

    currentText = "";
    let result = handlerService.getURL('folder', null);
    expect(spyRouter.stateService.href).toHaveBeenCalled();
    expect(result).toEqual(handlerService.handler.states['folder']);
  });

  /**
   * The handler responds to a request for a simple app result.
   */
  it('should get simple app result', () => {
    const handlerService = TestBed.get(StateHandlerService);

    let params = {
      mode: "notAdvanced",
      criteria: "criteria",
      pageIndex: 1,
      pageSize: 256,
      offset: 0
    }
    currentText = "appContainer.simpleApp.result";
    let result = handlerService.getURL('terminology', params);
    
    expect(result).toEqual('appContainer.simpleApp.element');
    expect(params.criteria).toBeNull();
    expect(params.pageIndex).toBeNull();
    expect(params.pageSize).toBeNull();
    expect(params.offset).toBeNull();
  });

  /**
   * Unknown result, expect the name passed into become the result.
   */
  it('should get unknown', () => {
    const handlerService = TestBed.get(StateHandlerService);
    currentText = "";
    let name = 'Fjord defect';
    let result = handlerService.getURL(name, null);
    expect(result).toEqual(name);
  });
});

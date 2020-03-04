import { TestBed } from '@angular/core/testing';

import { ValidatorService } from './validator.service';

describe('ValidatorService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: ValidatorService = TestBed.get(ValidatorService);
        expect(service).toBeTruthy();
    });

    it('should captalise', () => {
        const service: ValidatorService = TestBed.get(ValidatorService);

        expect(service.capitalize("blobert")).toEqual("Blobert");
        expect(service.capitalize("1234")).toEqual("1234");
        expect(service.capitalize("PEANUT")).toEqual("PEANUT");

        /**
         * Not sure if this really is how it should work.
         */
        expect(service.capitalize(" blobert")).toEqual(" blobert");

        /**
         * Check it does not muss up some unicode sets.
         */
        expect(service.capitalize("رأس المال")).toEqual("رأس المال");
        expect(service.capitalize("कैपिटल")).toEqual("कैपिटल");
        expect(service.capitalize("קאַפּיטאַל")).toEqual("קאַפּיטאַל");
        expect(service.capitalize("首都")).toEqual("首都");
    });

    it('should validate emails', () => {
        let validEmails = [
            'me@home.com',
            'you@this.that-and-the.other.org',
            'you.and.me@example.co.uk',
            'this+that@co.uk',
            '123456789-8765@gruffalo.monster',

            '"quoted"@batty.fk',
            'bish-bosh_bash@nowhere.org.gs',
     
            'sharon@125.45.79.101',

            'tracy@[101.220.34.127]'
        ];
        const service: ValidatorService = TestBed.get(ValidatorService);

        for (let email of validEmails)
            expect(service.validateEmail(email)).toBe(true);

        let inValidEmails = [
            'nothing-at-home.com',
            '@home.gone',
            'whatever@.org',
            'Nobby Clarke <nobby.clarke@fidget.eu>',
            'boink.boink.boink',
            'too@many@ts',
            '.gordon@moron.co.uk',
            ' space @ here.com',
            'dotty..dotty@example.org',
            'မမှန်ကန်တဲ့@unicode.bad',
            'no.trailing@text.allowed.uk What Ho',
            'no@tld',    
            'no.dash@-allowed.es',
            'person@192.168.111.4567',
            'no-double-dot.in@domain..org'
        ];
        for (let email of inValidEmails)
            expect(service.validateEmail(email)).toBe(false);
    });
    it('should validate date instances', () => {
        const service: ValidatorService = TestBed.get(ValidatorService);

        let validDates = [
            new Date('2019-09-30'),
            new Date(),
            new Date(2019, 9, 30, 10, 32, 18)
        ];
        for (let value of validDates)
            expect(service.isDate(value)).toBe(true);

        let inValidDates = [
            '2019-09-30',
            null,
            undefined,
            2019
        ];
        for (let value of inValidDates)
            expect(service.isDate(value)).toBe(false);
    });
    it('should identify empty strings', () => {
        const service: ValidatorService = TestBed.get(ValidatorService);

        expect(service.isEmpty(null)).toBe(true);
        expect(service.isEmpty(undefined)).toBe(true);
        expect(service.isEmpty("")).toBe(true);
        expect(service.isEmpty(" ")).toBe(true);
        expect(service.isEmpty("\n")).toBe(true);
        expect(service.isEmpty("\t")).toBe(true);
        expect(service.isEmpty("\r")).toBe(true);
        expect(service.isEmpty("x")).toBe(false);
        expect(service.isEmpty(" x")).toBe(false);
        expect(service.isEmpty("x ")).toBe(false);
        expect(service.isEmpty(" x ")).toBe(false);
        const num:number = 0;
        expect(service.isEmpty(num.toString())).toBe(false);
    });
});

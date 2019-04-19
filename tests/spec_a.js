const myModule = require('./../src/indexa.js');
describe("Module should return", function () {

    it("some number2", function () {
        debugger
        //this is a test
        console.log("Herere")
        expect(myModule()).toEqual(160);
    });
});
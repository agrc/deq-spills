require([
    'app/FindAddress'
],

function (
    FindAddress
    ) {
    describe('app/FindAddress', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new FindAddress();
            testWidget.startup();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(FindAddress));
        });
    });
});
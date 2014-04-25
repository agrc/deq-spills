(function () {
    var projectUrl;
    if (typeof location === 'object') {
        // **begin dev code
        // // running in browser
        // projectUrl = location.pathname.replace(/\/[^\/]+$/, "") + '/';

        // // jasmine unit tests
        // if (projectUrl === '/') {
        //     projectUrl += 'src/';
        // }
        // **end dev code

        // ** begin prod code
        // projectUrl = 'http://mapserv.utah.gov/deqspills/';
        projectUrl = 'http://test.mapserv.utah.gov/deqspills/';
        // ** end prod code
    } else {
        // running in build system
        projectUrl = '';
    }
    require({
        packages: [
            {
                name: 'app',
                location: projectUrl + 'app'
            },{
                name: 'agrc',
                location: projectUrl + 'agrc'
            },{
                name: 'ijit',
                location: projectUrl + 'ijit'
            }
        ]
    }, ['app']);
})();
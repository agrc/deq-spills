/* jshint evil:true */
(function(){
    // start server replace
    var server = location.pathname.replace(/\/[^\/]+$/, '');
    // end server replace

    var head = document.getElementsByTagName('head').item(0);

    function loadCss(href){
        // summary:
        //      Adds a css link element to the document head with the
        //      passed in href
        // console.log(this.declaredClass + "::loadCss", arguments);

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        head.appendChild(link);
    }

    // start replace
    document.write('<script type=\'text/javascript\' src=\'' +
        server + '/dojo/dojo.js\' data-dojo-config=\'isDebug: 1\'></script>');
    document.write('<script type=\'text/javascript\' src=\'' +
        server + '/app/run.js\'></script>');
    // end replace
    
    loadCss(server + '/app/resources/App.css');
})();
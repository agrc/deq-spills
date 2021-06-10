/* jshint evil:true, camelcase:false */
(function () {
    var head = document.getElementsByTagName('head').item(0);

    function loadCss(href) {
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

    loadCss(window.AGRC_server + '/app/resources/App.css');
    loadCss(window.AGRC_server + '/bootstrap/dist/css/bootstrap.css');

    document.write('<script type=\'text/javascript\' src=\'/dojo/dojo.js\' data-dojo-config=\'isDebug: 1\'></script>');
    document.write('<script type=\'text/javascript\' src=\'/app/run.js\'></script>');
}());

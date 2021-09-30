/* jshint evil:true, camelcase:false */
(function () {
    var head = document.getElementsByTagName('head').item(0);

    // start server replace
    const ugrcServer = 'https://localhost';
    // end server replace

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

    // these URLs need to be non-relative since this file will be loaded on various sites
    loadCss(`${ugrcServer}/app/resources/App.css`);
    loadCss(`${ugrcServer}/bootstrap/dist/css/bootstrap.css`); // dev
    loadCss(`${ugrcServer}/bootstrap/css/bootstrap.css`); // built

    document.write(`<script type="text/javascript" src="${ugrcServer}/dojo/dojo.js"></script>`);
    document.write(`<script type="text/javascript" src="${ugrcServer}/app/run.js"></script>`);

    // google analytics
    document.write('<script async src="https://www.googletagmanager.com/gtag/js?id=G-PECSFZVT9S"></script>');

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-PECSFZVT9S');
}());

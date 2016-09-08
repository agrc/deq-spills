define([
    'dojo/_base/declare',
    'dojo/text!app/templates/TRSsearch.html',
    'agrc/widgets/locate/TRSsearch'

], function (
    declare,
    template,
    TRSsearch
    ) {
    // this is just to change the layout from veritcal to horizontal
    return declare([TRSsearch], {
        templateString: template
    });
});

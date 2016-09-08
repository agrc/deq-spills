/*eslint-disable no-unused-vars, no-undef */
profile = {
    resourceTags: {
        test: function (filename, mid) {
            return /\/tests\//.test(mid);
        },

        copyOnly: function (filename, mid) {
            return (/^app\/resources\//.test(mid) && !/\.css$/.test(filename));
        },

        amd: function (filename, mid) {
            return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
        },

        miniExclude: function (filename, mid) {
            return mid in {
                'app/package': 1
            };
        }
    }
};
/*eslint-enable no-unused-vars, no-undef */

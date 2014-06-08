var harbors = require('../index');

var url = require('url');

harbors.Request = {

    //_parseUrl: null,
    //_postParam: null,
    //_fileParam: null,
    //_cookie: null,

    /**
     *
     * @param name
     * @returns {*}
     */
    getHeaders: function(name){
        return name ? this.headers[name] : this.headers;
    },

    /**
     *
     * @returns {string|Url.pathname|*}
     */
    getURL: function(){
        if(this._parseUrl === undefined)
            this._parseUrl = url.parse(this.url, true);

        return this._parseUrl.pathname;
    },

    /**
     *
     * @returns {Url.query|*}
     */
    getGetParam: function(name){
        if(this._parseUrl === undefined)
            this._parseUrl = url.parse(this.url, true);
        return name ? this._parseUrl.query[name] : this._parseUrl.query;
    },

    /**
     *
     * @param name
     * @returns {*}
     */
    getPostParam: function(name){
        if(this._postParam){
            harbors.log('The server did not accept the post parameter');
            return;
        }
        return name ? this._postParam[name] : this._postParam;
    },

    /**
     *
     * @param name
     * @returns {*}
     */
    getFiles: function(name){
        return name ? this._fileParam[name] : this._fileParam;
    },

    /**
     *
     * @param name
     * @returns {*}
     */
    getCookie: function(name){
        if(!this._cookie){
            var string = this.headers['cookie'];
            this._cookie = {};
            if(string === undefined){
                return this._cookie;
            }
            var strArr = string.split(";");
            for(var i = 0; i < strArr.length; i++){
                var map = strArr[i].split("=");
                this._cookie[map[0]] = map[1];
            }
        }
        return name ? this._cookie[name] : this._cookie;
    },

    /**
     *
     * @param name
     * @returns {*}
     */
    getSession: function(name){
        if(!this._session){
            harbors.log('Session does not exist');
            return;
        }
        return name ? this._session['data'][name] : this._session['data'];
    }
};

/**
 *
 * @param req
 * @returns {*}
 */
harbors.Request.create = function(req){
    for(var p in harbors.Request){
        req[p] = harbors.Request[p];
    }
    return req;
};
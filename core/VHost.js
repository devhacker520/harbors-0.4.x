var harbors = require('../index');

var path = require('path');
var multiparty = require('multiparty');

harbors.VHost = harbors.Class.extend({

    //Default handle function
    _handle: null,
    //Monitoring domain name list
    _domain: null,
    //domain - url cache list
    _cache: null,
    //session class
    _session: null,
    _acceptPost: true,
    _tmpDir: path.join(__dirname,'../tmp'),

    /**
     * Initialize the new harbor.Handle object
     * @param {Function} router
     */
    ctor: function(router){
        this._domain = {};
        this._cache = {};
        this._router = router;
        this._session = harbors.FileSession.create();
    },

    getRouter: function(){
        return this._router;
    },

    /**
     * Acquisition processing function
     * @param {http.object} req
     * @param {http.object} res
     */
    _packaging: function(req, res){

        var self = this;

        var task = harbors.Sync.create();
        task.setTask(function(next){

            //create req
            req = harbors.Request.create(req);
            res = harbors.Response.create(res);

            next();
        });

        task.setTask(function(next){
            //session
            self._session.update(req, res, req.getCookie(), function(){
                next();
            });

        });

        task.setTask(function(next){
            if(self._acceptPost && req.method === "POST"){
                var form = new multiparty.Form({
                    uploadDir:self._tmpDir
                });
                form.parse(req, function(err, fields, files){
                    if(err){
                        self._notFound(req, res);
                        return;
                    }
                    req._postParam = fields;
                    req._fileParam = files;
                    self._findDomain(req, res);
                    next();
                });
            }else{
                next();
            }
        });

        task.runTask(function(){

            self._findDomain(req, res);
        });

    },

    /**
     * Distinguish between domain name
     * @param req
     * @param res
     * @private
     */
    _findDomain: function(req, res){

        var _fullHost = req.headers.host;
        //Find cache
        if(this._cache[_fullHost]){
            res._workDir = this._domain[ this._cache[_fullHost] ]._workDir;
            this._domain[ this._cache[_fullHost] ].route.call(this._domain[ this._cache[_fullHost]], req, res);
            return;
        }

        var _execUrl = _fullHost.split(':')[0];

        for(var p in this._domain){
            var _tmp, _urlTemp = _execUrl;

            //Domain name completely equal
            if(p === _urlTemp){
                res._workDir = this._domain[_urlTemp]._workDir;
                this._domain[_urlTemp].route.call(this._domain[_urlTemp], req, res);
                //cache
                this._cache[_fullHost] = _urlTemp;
                return;
            }

            //The list of matching domain name
            while(_urlTemp != p && _tmp != _urlTemp){
                _tmp = _urlTemp;
                _urlTemp = this._backHost(_urlTemp);
            }

            if(_tmp != _urlTemp){
                res._workDir = this._domain[_urlTemp]._workDir;
                this._domain[_urlTemp].route.call(this._domain[_urlTemp], req, res);
                //cache
                this._cache[_fullHost] = _urlTemp;
                return;
            }
        }

        if(this._router){
            //Host is not Found.
            this._router(req, res);
            res._workDir = this._router._workDir;
        }else{
            res.end("1. Did not find any relevant Domain Hosting\n2. Default router does not exist");
        }
    },

    /**
     * Level to find domain
     * @param {String} url
     * @returns {*|XML|string|void}
     * @private
     */
    _backHost: function(url){
        return url.replace(/^(\*\.[^\.]*|[^\.]*)/, '*');
    },

    /**
     * The host does not exist
     * @param {http.object} req
     * @param {http.object} res
     * @private
     */
    _notFound: function(req, res){
        res.end('host is not found!');
        return this;
    },

    /**
     * Set not found host router
     * @param handle
     */
    setNotFound: function(handle){
        this._notFoundHost = handle;
        return this;
    },

    /**
     * Add listen domain
     * @param {String}   name    - Must
     * @param {harbors.Router} router  - Must
     */
    addDomain: function(name, router){
        if(router instanceof harbors.Router || router instanceof harbors.AutoRouter) {
            this._domain[name] = router;
        }else {
            this._domain[name] = router;
        }
        return this;
    },

    /**
     * Set accept post date
     * @param Boolean
     */
    setAcceptPost: function(Boolean){
        this._acceptPost = !!Boolean;
        return this;
    }
});

/**
 * Creare new harbors.Handle
 * @param handle
 * @returns {harbors.Router}
 */
harbors.vHost = harbors.VHost.create = function(router){
    return new harbors.VHost(router);
};
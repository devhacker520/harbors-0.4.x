var harbors = require('../index');

harbors.Router = harbors.Class.extend({
    //route rule
    _routeTable: null,
    //route rule length
    length: null,
    //If access to a folder, find the default file
    _defaultController: null,
    //route is not found
    _notFound: null,
    //route error
    _error: null,
    //rewrite witch
    _rewrite: null,

    /**
     * Init Router object
     *
     * @param routeTable
     */
    ctor: function(routeTable){

        this._routeTable = routeTable || {};
        this._defaultController = [];

        this.length = 0;
        for(var p in this._routeTable){
            this.length++;
        }

        this._notFound = function(req, res){
            res.end('Router did not find any address.');
        };
    },

    /**
     * Gets the routing handler function
     *
     * @returns {Function}
     * @private
     */
    route: function(req, res){
        var url = req.url.split('?')[0];

        if(this._rewrite){
            url = this._rewrite(url);
        }
        res.setHeader("Content-Type", "text/html");

        if(this._routeTable[url]){

            this._routeTable[url](req, res);
        }else{

            if(/\/$/.test(url)){

                for(var i=0;i<this._defaultController.length;i++){
                    if(this._routeTable[url + this._defaultController[i]]){

                        this._routeTable[url + this._defaultController[i]](req, res);
                        return;
                    }
                }

                this._fuzzyRouter(req, res, url);
            }else{
                this._fuzzyRouter(req, res, url);
            }
        }

    },

    _fuzzyRouter: function(req, res, url){
        for(var p in this._routeTable){
            if(/\*/.test(p)){
                var n = new RegExp(p.replace(/\*/g, "(.*)?"));
                if(n.test(url)){
                    this._routeTable[p](req, res);
                    return;
                }
            }
        }

        this._notFound(req, res);

    },

    /**
     * Set rewrite function
     * @param func
     */
    setRewrite: function(func){
        if(typeof func === 'function')
            this._rewrite = func;
        else
            harbors.error('setRewrite param is not a function');
    },

    /**
     * Set default controller list
     *
     * @param {Array|string} fileArray
     */
    setDefaultController: function(fileArray){
        var _type = typeof fileArray;
        if(_type === 'object'){

            if(Array.isArray(fileArray)){
                this._defaultController.concat(fileArray);
            }
        }else{
            this._defaultController.push(fileArray);

        }
    },

    /**
     * Remove default file list
     *
     * @param {string} file
     */
    removeDefaultController: function(file){
        for(var i=0;i<this._defaultController.length;i++){
            if(this._defaultController[i] == file){
                this._defaultController.splice(i, 1);
                i--;
            }
        }
    },

    /**
     * Set new mime info
     *
     * @param {String} name
     * @param {String} value
     */
    setMime: function(name, value){

        if(typeof name === 'string' && typeof value === 'string'){

            this._mime[name] = value;
        }else{
            harbors.log('setMime is error.');
        }
    },

    /**
     * Get mime or list
     *
     * @returns {*}
     */
    getMime: function(){
        switch(arguments.length){
            case 1:
                if(this._mime[arguments[0]]){
                    return this._mime[arguments[0]];
                }
                break;
            default:
                return this._mime;
        }
    },

    /**
     * Get route function of handle
     *
     * @param {Number} num
     * @returns {*}
     */
    getRoute: function(num){
        switch(arguments.length){
            case 1:
                if(this._routeTable[arguments[0]]){
                    return this._routeTable[arguments[0]];
                }else{
                    return undefined;
                }
                break;
            default:
                return this._routeTable;
        }
    },

    /**
     * Add route function of handle
     *
     * @param handle
     */
    addRoute: function(name, handle){
        if(typeof name === "string" && typeof handle === "function"){
            this._routeTable[name] = handle;
        }else{
            harbors.error("setRouter is error");
        }
    },

    /**
     * Set a function for not found route
     *
     * @param {Function} Function
     */
    setNotFound: function(Function){
        if(typeof Function === 'function')
            this._notFound = Function;
        else
            harbors.log('setNotFound is error.');
    },

    /**
     * Set a function for error
     *
     * @param {Function} Function
     */
    setError: function(Function){
        if(typeof Function === 'function')
            this._error = Function;
        else
            harbors.log('setError is error.');
    }
});

harbors.Router.create = function(routeTable){

    if(typeof routeTable !== 'object') routeTable = undefined;
    return new harbors.Router(routeTable);
};
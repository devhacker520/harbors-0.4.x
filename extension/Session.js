var harbors = require('../index');

var fs = require('fs');
var path = require('path');

harbors.Session = harbors.Class.extend({

    _cookieName: "HARBORS_SID",
    _sessionLength: 20,
    _timeOut: 0,

    /**
     * Init session object
     */
    ctor: function(){
        harbors.log("Please cover the method.");
    },

    saveSession: function(session, name, value, option){
        harbors.log("Please cover the method.");
    },

    /**
     * Create session for client
     */
    update: function(req, res, cookie){
        var self = this;
        var session = cookie[this._cookieName];
        if(session === 'undefined'){
            session = this.createCookie(req, res);
        }

        res.setSession = function(name, value, option){
            self.saveSession(session, name, value, option);
        };
    },

    createCookie: function(req, res){
        var session = harbors.String.random(this._sessionLength);
        res.setCookie(this._cookieName, session, {
            httpOnly: true
        });
        return session;
    }
});

harbors.FileSession = harbors.Session.extend({

    _path: null,

    ctor: function(){
        //Default dirname path
        this._path = path.join(__dirname, '../tmp');
        //create directory
        harbors.Directory.recursiveCreate(this._path);
    },

    /**
     * Set a path for this session
     * @param string
     */
    setPath: function(string){
        if(typeof string === 'string'){
            this._path = string;
            //create directory
            harbors.Directory.recursiveCreate(this._path);
        }
    }
});

harbors.FileSession.create = function(){

    return new harbors.FileSession();
};
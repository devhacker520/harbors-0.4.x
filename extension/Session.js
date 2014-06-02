var harbors = require('../index');

var fs = require('fs');
var path = require('path');

/*

 The data format:

 {
     data: {
         -sessionName-: -sessionValue-
     },
     expired: -dateNumber-
 }

 */

harbors.Session = harbors.Class.extend({

    _cookieName: "HARBORS_SID",
    _sessionLength: 20,
    _expired: 3600000,

    /**
     * Init session object
     */
    ctor: function(){
        harbors.log("Please cover the method.");
    },

    saveSession: function(cookieName){
        harbors.log("Please cover the method.");
    },

    readSession: function(cookieName, callback){
        harbors.log("Please cover the method.");
    },

    /**
     * Create session for client
     */
    update: function(req, res, cookie, callback){
        var self = this;
        var cookieName = cookie[this._cookieName];
        if(cookieName === undefined){
            cookieName = this.createCookie(req, res);
        }

        res.saveSession = function(){
            self.saveSession(cookieName, res._session);
        };

        this.readSession(cookieName, function(session){
            req._session = session;
            res._session = session;
            callback();
        });


    },

    createCookie: function(req, res){
        var session = harbors.String.random(this._sessionLength);
        res.setCookie(this._cookieName, session, {
            httpOnly: true
        });
        return session;
    },

    completeData: function(data){

        if(typeof data !== 'object' || data['expired'] === undefined || data['expired'] < new Date() - 0){
            data = {};
        }

        //update expire time
        data['expired'] = new Date() - 0 + this._expired;

        if(data['data'] === undefined){
            data['data'] = {};
        }

        return data;
    }
});

harbors.FileSession = harbors.Session.extend({

    _path: null,

    ctor: function(){
        //Default dirname path
        this._path = path.join(__dirname, '../tmp');
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
    },

    readSession: function(cookieName, callback){
        var self = this;
        var sessionFile = path.join(this._path, cookieName);
        if(fs.existsSync(sessionFile)){
            fs.readFile(sessionFile, function(err, data){
                if(err){
                    harbors.error(err);
                    return;
                }
                var session;
                try{
                    session = self.completeData(JSON.parse(data.toString()));
                    callback(session);
                }catch(err){
                    callback(self.completeData({}));
                }
            });
        }else{
            callback(self.completeData({}));
        }
    },

    saveSession: function(cookieName, session){
        //create directory
        harbors.Directory.recursiveCreate(this._path);
        var sessionFile = path.join(this._path, cookieName);
        for(var save in session){
            break;
        }
        if(save){
            fs.writeFile(sessionFile, JSON.stringify(session), function(err){
                if(err){
                    harbors.error(err);
                }
            });
        }

    }
});

harbors.FileSession.create = function(){

    return new harbors.FileSession();
};
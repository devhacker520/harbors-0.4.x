var harbors = require('../index');

var cluster = require('cluster');

harbors.Config = harbors.Class.extend({

    _config: null,
    _listen: null,
    _serverList: null,

    ctor: function(obj){
        this._serverList = [];
        this.parse(obj);
    },

    parse: function(obj){
        if(!obj.server) {
            harbors.error("config param is error");
            return;
        }
        this._config = obj;
        this._filterConfig();
        this._extractListen();
        var num = this._config['server'].process || 1;
        if(cluster.isMaster){
            for(var i= 0;i<num; i++){
                cluster.fork();
            }
        }
        this._runTask();
    },

    _filterConfig: function(){
        //set default vHost
        if(!this._config.vhost || !Array.isArray(this._config.vhost) || this._config.vhost.length < 1){
            this._config.vhost = [{}];
        }

        //set default protocol
        if(!this._config.server.protocol){
            this._config.server.protocol = 'http';
        }

        var config = this._config;
        config.vhost.forEach(function(vhost){
            //check server name
            if(!vhost.server_name){
                vhost.server_name = harbors.String.random();
            }
            //check listen
            if(vhost.listen && !Array.isArray(vhost.listen)){
                vhost.listen = [vhost.listen];
            }
            //check dirname
            if(!vhost.dir){
                vhost.dir = config.server.dir;
            }
        });
    },

    /**
     * Extract listen port
     * @private
     */
    _extractListen: function(){
        var config = this._config;
        var listen = {};
        config.vhost.forEach(function(vhost, index){
            var _tmpListen = vhost['listen'] || config['server']['listen'];
            _tmpListen.forEach(function(_port){
                if(_port){
                    if(listen[_port]){
                        listen[_port].push(index);
                    }else{
                        listen[_port] = [index];
                    }
                }
            });

        });
        this._listen = listen;
    },

    _runTask: function(){
        if(cluster.isWorker){
            var self = this;
            for(var p in self._listen){
                this._createServer(p, self._listen[p]);
            }
        }
    },

    _createServer: function(port, hostArray){
        var self = this;
        var config = this._config;
        hostArray.forEach(function(num){
            //Current Host Configuration
            var _con = config["vhost"][num];
            //Necessary variables
            var _protocol, _ip, _port, match;
            _protocol = _con['protocol'] || config['server']['protocol'];
            _ip = _con['ip'] || config['server']['ip'] || null;
            _port = port;
            //The host loop already exists
            self._serverList.forEach(function(_server){
                if(
                    _server['protocol'] === _protocol &&
                    _server['ip'] === _ip &&
                    _server['port'] === _port
                ){
                    match = true;
                    self._bindingRouter(_server, _con);
                }
            });
            if(!match){
                var _server = {
                    protocol: _protocol,
                    ip: _ip,
                    port: _port,
                    //Create Server
                    server:  harbors.Server.create(
                        _protocol,
                        _ip,
                        _port,
                        //Create VHost
                        harbors.VHost.create()
                    )
                };
                self._serverList.push(_server);
                self._bindingRouter(_server, _con);
            }
        });

    },

    _bindingRouter: function(_server, _con){

        _server.server.getVHost().setAcceptPost(true);
        //Create Router
        var _router = harbors.AutoRouter.create();
        _router.setWorkDir(_con.dir);
        _con.rewrite && _router.setRewrite(_con.rewrite);
        _server.server.getVHost().addDomain( _con.domain || '*', _router);
    }
});

harbors.Config.create = function(obj){
    return new harbors.Config(obj);
};

harbors.JsonConfig = harbors.Config.extend({
    parse: function(){

    }
});

harbors.XmlConfig = harbors.Config.extend({
    parse: function(){

    }
});
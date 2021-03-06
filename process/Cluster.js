var harbors = require('../index');

var cluster = require('cluster');

harbors.Cluster = harbors.Class.extend({

    //Cluster worker length
    length: null,

    //Worker object
    _worker: null,

    //Worker task list
    _task: null,

    /**
     * init function
     */
    ctor: function(){
        this.length = 0;
        this._worker = [];
        this._task = {};

        if(cluster.isWorker){
            var self = this;
            process.on('message', function(info){

                if(self && info.type === 'task'){
                    //Delete unnecessary tasks
                    for(var p in self._task){
                        if(p == info.name){
                            self._task[p]();
                        }else{
                            delete self._task[p];
                        }
                    }
                    self = null;
                }
            });
        }
    },

    /**
     * Set new task into list
     * @param name
     * @param handle
     * @returns {harbors.Cluster}
     */
    setTask: function(name, handle){
        if(typeof name === 'string' && typeof handle === 'function'){
            this._task[name] = handle;
        }else{
            harbors.log('setWorker is error.');
        }

        return this;
    },

    /**
     * Create child process and run task
     * @param name
     * @param num
     * @returns {harbors.Cluster}
     */
    fork: function(name, num){
        if(cluster.isMaster){

            num = num || 1;

            for(var i=0;i<num;i++){
                if(this._task[name]){
                    var _cp = cluster.fork();
                    this._event(_cp);

                    _cp.send({
                        type: 'task',
                        name: name
                    });

                    this.length++;
                    this._worker.push(_cp);
                }else{
                    harbors.log('fork error, %s is not found.', name);
                }
            }
        }

        return this;
    },

    /**
     * Get a sub process object or process list
     * @param num
     * @returns {*}
     */
    getWorker: function(num){
        if(cluster.isMaster){
            num = parseInt(num);
            if(isNaN(num)){
                return this._worker;
            }else{
                return this._worker[num];
            }
        }
    },

    /**
     * Bind a default event
     * @param cp
     * @private
     */
    _event: function(cp){
        var self = this;
        cp.on('close', function(){
            self.length--;
        });

        cp.on('error', function(){
            self.length--;
        });
    },

    /**
     * Close all the child process
     */
    closeAll: function(){
        var _worker = this._worker;
        _worker.forEach(function(cp, i){
            cp.kill();
        });
    },

    /**
     * Closing a child process
     * @param {Number} pid
     */
    close: function(pid){
        var _worker = this._worker;
        _worker.forEach(function(cp, i){
            if(cp.pid == pid){
                cp.kill();
            }
        });
    }

});

harbors.Cluster.create = function(){

    return new harbors.Cluster();
};
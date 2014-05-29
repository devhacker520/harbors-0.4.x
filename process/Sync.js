var harbors = require('../index');

harbors.Sync = harbors.Class.extend({

    //save task list
    _task: null,

    //sync type
    _type: null,

    _con: null,
    _callback: null,

    //init
    ctor: function(type){

        this.ctor = type;
        this.task = [];
        this._con = 0;
    },

    //add task
    setTask: function(fun){
        if(typeof fun === 'function'){
            this._task.push(fun);
        }else{
            harbors.log('setTask is error.');
        }
    },

    _normalCallback: function(){
        this._con++;
        if(this._con >= this._task.length){
            this._callback();
        }
    },

    _runTask: function(){
        for(var i=0;i<this._task.length;i++){
            this._task[i](this._normalCallback);
        }
    },

    //run task list
    runTask: function(fun){
        if(typeof fun === 'function'){
            this._callback = fun;
            this._runTask();
        }else{
            harbors.log('runTask is error.');
        }
    }
});

//create sync object
harbors.Sync.create = function(type){

    if(typeof type !== 'string') type = 'enhance';
    return new harbors.Sync(type);
};
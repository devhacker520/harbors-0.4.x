
module.exports = {
    SERVER: 'HARBORS/0.4.0'

};

var moduleList = [
    './core/Debugger',
    './core/Class',
    './core/Request',
    './core/Response',
    './core/Server',
    './core/VHost',

    './extension/Config',
    './extension/Session',

    './process/Sync',
    './process/Cluster',

    './route/Router',
    './route/AutoRouter',

    './tools/Directory',
    './tools/String'

];

moduleList.forEach(function(module){
    require(module);
});
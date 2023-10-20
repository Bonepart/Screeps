var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var processCreeps = require('process.creeps');
var config = require('config');

config.memory();

function isAvailable(index){
    return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
}

module.exports.loop = function () {
    processCreeps.clearMemory();



    for (let i in Game.spawns){
        //console.log('Spawn Name:' + Game.spawns[i].name);
        //console.log('isAvailable: ' + isAvailable(i));
        processCreeps.checkForSpawn(i);
    }
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch(creep.memory.role){
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
        }
    }

};
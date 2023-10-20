var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var processCreeps = require('process.creeps');

const maxHarvesters = 1;
const maxUpgraders  = 1;
const maxBuilders   = 1;

module.exports.loop = function () {

    console.log('GameTime: ' + Game.time);
    var priSpawn = Game.spawns['Spawn1'];
    processCreeps.checkForSpawn(priSpawn);
    processCreeps.clearMemory();
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
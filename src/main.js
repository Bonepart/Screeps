var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleDefender = require('role.defender');
var processCreeps = require('process.creeps');
var construction = require('construction');
var config = require('config');

config.memory();
config.sourceData();

/*console.log('Start Source Data...');
for (let i in Memory.sourceList){
    console.log(`Index: ${i}`);
    console.log(`ID: ${Memory.sourceList[i].id}`);
    console.log(`openSpaces: ${Memory.sourceList[i].openSpaces}`);
    console.log(`roadStatus: ${Memory.sourceList[i].roadStatus}`);
}
console.log('...finished');*/

function isAvailable(index){
    return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
}

module.exports.loop = function () {
    processCreeps.clearMemory();

    //let exCount = (_.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_EXTENSION)).length;
    //const maxEnergy = 300 + exCount * 50;


    for (let i in Game.spawns){
        if (!Memory.spawns[i]) { Memory.spawns[i] = {} }
        //console.log('Spawn Name:' + Game.spawns[i].name);
        //console.log('isAvailable: ' + isAvailable(i));
        processCreeps.checkForSpawn(i);
        if(_.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length > 0){
            construction.checkSpawnRoads(i);
            construction.buildSourceRoads(i);
        };
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
            case 'defender':
                roleDefender.run(creep);
                break;
        }
    }

};
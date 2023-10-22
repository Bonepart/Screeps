var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaint = require('role.maint');
var roleDefender = require('role.defender');
var processCreeps = require('process.creeps');
var processDefense = require('process.defense');
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

module.exports.loop = function () {
    Game.functions = require('console');
    processCreeps.clearMemory();

    for (let i in Game.spawns){
        if (!Memory.spawns) { Memory.spawns = {}};
        if (!Memory.spawns[i]) { Memory.spawns[i] = { hasRoads: 0} }
        processDefense.checkForKeeperLair(Game.spawns[i].room.name);
        //console.log('Spawn Name:' + Game.spawns[i].name);
        //console.log('isAvailable: ' + isAvailable(i));
        processCreeps.checkForSpawn(i);
        if(_.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length > 0){
            if (Memory.spawns[i].hasRoads == 0) {construction.checkSpawnRoads(i)}
            else { 
                construction.checkExtensions(i);
                construction.buildSourceRoads(i);
            }
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
            case 'maintenance':
                roleMaint.run(creep);
                break;
            case 'defender':
                roleDefender.run(creep);
                break;
        }
    }
};

function isAvailable(index){
    return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
}
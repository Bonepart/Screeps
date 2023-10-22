var roleBuilder = require('role.builder');
var roleDefender = require('role.defender');
var roleHarvester = require('role.harvester');
var roleHealer = require('rold.healer');
var roleMaint = require('role.maint');
var roleRanged = require('role.ranged');
var roleUpgrader = require('role.upgrader');

var processCreeps = require('process.creeps');
var processDefense = require('process.defense');
var construction = require('construction');
var config = require('config');

config.memory();
config.sourceData();

module.exports.loop = function () {
    Game.functions = require('console');
    processCreeps.clearMemory();
    for (let roomName in Game.rooms){
        thisRoom = Game.rooms[roomName];
        if (!Memory.rooms) { Memory.rooms = {}};
        if (!Memory.rooms[roomName]) { Memory.rooms[roomName] = { spawnTier: 0, controllerRoad: 0} }
        if (thisRoom.energyCapacityAvailable >= 500) { thisRoom.memory.spawnTier = 1 }
        else { thisRoom.memory.spawnTier = 0 };
    }
    for (let i in Game.spawns){
        if (!Memory.spawns) { Memory.spawns = {}};
        if (!Memory.spawns[i]) { Memory.spawns[i] = { hasRoads: 0} }
        let spawner = Game.spawns[i];
        processDefense.checkForKeeperLair(Game.spawns[i].room.name);
        if (isAvailable(i)) {processCreeps.checkForSpawn(i)}
        if(_.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length > 0){
            if (spawner.memory.hasRoads == 0) {construction.checkSpawnRoads(i)}
            else { 
                construction.checkExtensions(i);
                if (construction.buildSourceRoads(i)) {
                    if (spawner.room.memory.controllerRoad != 2){ construction.buildControllerRoad(spawner.room.controller)};
                }
            }
        };
    }
    
    let maintOffset = 0;
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        switch(creep.memory.role){
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'defender':
                roleDefender.run(creep);
                break;
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'healer':
                roleHealer.run(creep);
                break;
            case 'maintenance':
                roleMaint.run(creep, maintOffset);
                maintOffset++;
                break;
            case 'ranged':
                roleRanged.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
        }
    }
};

function isAvailable(index){
    return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
}
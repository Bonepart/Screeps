let roleBuilder = require('role.builder');
let roleDefender = require('role.defender');
let roleHarvester = require('role.harvester');
let roleHealer = require('role.healer');
let roleMaint = require('role.maint');
let roleRanged = require('role.ranged');
let roleUpgrader = require('role.upgrader');
let roleZombie = require('role.zombie');

let roleLonghaul = require('role.longhaul');

let towerLogic = require('structure.tower');

let processCreeps = require('process.creeps');
let processDefense = require('process.defense');
let explorer = require('process.exploration');
let construction = require('construction');
let config = require('config');

config.memory();
config.sourceData();

module.exports.loop = function () {
    Game.functions = require('console');
    processCreeps.clearMemory();
    for (let roomName in Game.rooms){
        let thisRoom = Game.rooms[roomName];
        if (!Memory.rooms) { Memory.rooms = {}};
        if (!Memory.rooms[roomName]) { Memory.rooms[roomName] = { spawnTier: 0, controllerRoad: 0} }
        if (thisRoom.energyCapacityAvailable >= 800) { 
            thisRoom.memory.spawnTier = 2;
            explorer.run(roomName) 
        }
        else if (thisRoom.energyCapacityAvailable >= 500) { thisRoom.memory.spawnTier = 1 }
        else { thisRoom.memory.spawnTier = 0 };
        if(Game.time % 20 == 0){
            console.log(`${thisRoom.name} energy available: ${thisRoom.energyAvailable.toString().padStart(4, ' ')}/${thisRoom.energyCapacityAvailable}`);
        }

        let structuresToRun = thisRoom.find(FIND_MY_STRUCTURES);
        for (let structure in structuresToRun){
            switch (structuresToRun[structure].structureType){
                case STRUCTURE_TOWER:
                    towerLogic.run(structuresToRun[structure]);
                    break;
            }
        }
    }
    for (let i in Game.spawns){
        let roomName = Game.spawns[i].room.name;
        if (!Memory.rooms[roomName].spawns) { Memory.rooms[roomName].spawns = []};
        if (!Memory.rooms[roomName].spawns[0]) { Memory.rooms[roomName].spawns[0] = { name: i, hasRoads: 0} }

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
            case 'zombie':
                roleZombie.run(creep);
                break;
            case 'longhauler':
                roleLonghaul.run(creep);
                break;
            default:
                console.log(`Unsupported role! (${creep.memory.role})`);
        }
    }

    
};

function isAvailable(index){
    return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
}
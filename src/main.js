require('constants');
let config = require('config');

let roleBuilder = require('role.builder');
let roleDefender = require('role.defender');
let roleHarvester = require('role.harvester');
let roleHealer = require('role.healer');
let roleMaint = require('role.maint');
let roleRanged = require('role.ranged');
let roleUpgrader = require('role.upgrader');
let roleZombie = require('role.zombie');

let roleGeneral = require('role.general');
let roleLonghaul = require('role.longhaul');
let roleGofer = require('role.gofer');
let roleClaimer = require('role.claimer');

let towerLogic = require('structure.tower');
let linkLogic = require('structure.link');
let bodytype = require('constants.bodytype');
let processCreeps = require('process.creeps');
let processDefense = require('process.defense');
let processRooms = require('process.rooms');
let explorer = require('process.exploration');
let construction = require('construction');
let helper = require('helper');
const roleSentry = require('./role.sentry');

config.loadRoles();

module.exports.loop = function () {
    Game.functions = require('console');
    processCreeps.clearMemory();
    
    for (let roomName in Game.rooms){
        let thisRoom = Game.rooms[roomName];

        if (Memory.rooms === undefined) { Memory.rooms = {}};
        if (Memory.rooms[roomName] === undefined) { Memory.rooms[roomName] = { spawnTier: 0, controllerRoad: 0} }
        explorer.checkExits(roomName)
        processRooms.sourceData(roomName);
        processRooms.checkRoomState(roomName);
        processDefense.checkForKeeperLair(roomName);

        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        switch (thisRoom.memory.roomState){
            case ROOM_NEUTRAL:
                break;
            case ROOM_RESERVED:         
                if (thisRoom.memory.sentryID == undefined) { thisRoom.memory.sentryID = null}
                explorer.checkExits(roomName);
                explorer.assignLongHauls(roomName);
                break;
            case ROOM_OWNED:
            case ROOM_OWNED_SAFE:
                roomLogging(thisRoom.name);

                explorer.checkExits(roomName)
                if (thisRoom.memory.sentryID != undefined) { thisRoom.memory.sentryID = undefined}
                processDefense.scanForHostiles(roomName);
                if (thisRoom.energyAvailable >= 1300) { explorer.checkForMissionary(roomName) }
                
                if (thisRoom.energyCapacityAvailable >= 1300) { thisRoom.memory.spawnTier = 4 }
                else if (thisRoom.energyCapacityAvailable >= 800) { thisRoom.memory.spawnTier = 3 }
                else if (thisRoom.energyCapacityAvailable >= 500) { thisRoom.memory.spawnTier = 2 }
                else { thisRoom.memory.spawnTier = 1 };

                let structuresToRun = thisRoom.find(FIND_MY_STRUCTURES);
                for (let structure in structuresToRun){
                    switch (structuresToRun[structure].structureType){
                        case STRUCTURE_TOWER:
                            towerLogic.run(structuresToRun[structure]);
                            break;
                        case STRUCTURE_LINK:
                            linkLogic.run(structuresToRun[structure]);
                            break;
                    }
                }

                break;
            case ROOM_HOSTILE_SAFE:
                if (thisRoom.memory.sentryID != undefined) { thisRoom.memory.sentryID = undefined}
                /*
                if (thisRoom.controller.safeMode < 400) {
                    if (vikingList.length < 4) {
                        processDefense.spawnViking(roomName);
                    }
                    if (vikingList.length > 0) {
                        roleGeneral.run();
                    }
                }*/
                break;
            case ROOM_HOSTILE:
                if (thisRoom.memory.sentryID != undefined) { thisRoom.memory.sentryID = undefined}
                /*
                if (vikingList.length < 4) {
                    processDefense.spawnViking(roomName);
                }
                if (vikingList.length > 0) {
                    roleGeneral.run(roomName);
                }*/
                break;
        }
    }

    for (let i in Game.spawns){
        let roomName = Game.spawns[i].room.name;
        //roleGeneral.moveToFlag(roomName);
        if (Memory.rooms[roomName].spawns === undefined) { Memory.rooms[roomName].spawns = []};
        if (Memory.rooms[roomName].spawns[0 === undefined]) { Memory.rooms[roomName].spawns[0] = { name: i, hasRoads: 0} }
        let spawner = Game.spawns[i];

        if (isAvailable(i)) { processCreeps.checkForSpawn(i) }
        //if (isAvailable(i)) { explorer.spawnSentry(i) }

        if(_.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER).length > 0){
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
        if (creep.spawning) { continue }
        switch(creep.memory.role){
            case ROLE_BUILDER:
                roleBuilder.run(creep);
                break;
            case ARMY_DEFENDER:
                roleDefender.run(creep);
                break;
            case ROLE_HARVESTER:
                roleHarvester.run(creep);
                break;
            case ARMY_HEALER:
                roleHealer.run(creep);
                break;
            case ROLE_MAINTENANCE:
                roleMaint.run(creep, maintOffset);
                maintOffset++;
                break;
            case ARMY_RANGED:
                roleRanged.run(creep);
                break;
            case ROLE_UPGRADER:
                roleUpgrader.run(creep);
                break;
            case ZOMBIE:
                roleZombie.run(creep);
                break;
            case ROLE_LONGHAUL:
                roleLonghaul.run(creep);
                break;
            case ROLE_GOFER:
                roleGofer.run(creep);
                break;
            case ROLE_CLAIMER:
                roleClaimer.run(creep);
                break;
            case ROLE_SENTRY:
                roleSentry.run(creep);
                break;
            case ARMY_VIKING:
                break;
            default:
                console.log(`Unsupported role! (${creep.memory.role})`);
        }
    }

    
};

function isAvailable(index){
    return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
}

function roomLogging(roomName){
    
    if(Game.time % 20 == 0){
        let thisRoom = Game.rooms[roomName];
        let storage = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE}});
        console.log(`${thisRoom.name} energy available: ${thisRoom.energyAvailable.toString().padStart(4, ' ')}/${thisRoom.energyCapacityAvailable}`);
        if (storage.length > 0) {
            console.log(`${thisRoom.name} storage used:\t ${storage[0].store.getUsedCapacity(RESOURCE_ENERGY)}`);
        }
    }
}

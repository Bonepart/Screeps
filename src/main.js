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
let roleStorageBud = require('role.storagebuddy');
let roleClaimer = require('role.claimer');

let towerLogic = require('structure.tower');
let linkLogic = require('structure.link');
let bodytype = require('constants.bodytype');
let processCreeps = require('process.creeps');
let processDefense = require('process.defense');
let processRooms = require('process.rooms');
let explorer = require('process.exploration');
let construction = require('construction');
let common = require('common.logic');
let helper = require('helper');
const roleSentry = require('./role.sentry');

config.loadRoles();

module.exports.loop = function () {
    Game.c = require('console');
    processCreeps.clearMemory();
    
    let buildList = common.getBuildList();
    for (let roomName in Game.rooms){
        let thisRoom = Game.rooms[roomName];

        if (Memory.rooms === undefined) { Memory.rooms = {}};
        if (Memory.rooms[roomName] === undefined) { Memory.rooms[roomName] = { spawnTier: 0, controllerRoad: 0} }
        processRooms.sourceData(roomName);
        processRooms.checkRoomState(roomName);
        processDefense.checkForKeeperLair(roomName);

        switch (thisRoom.memory.roomState){
            case ROOM_NEUTRAL:
                break;
            case ROOM_RESERVED:         
                if (thisRoom.memory.sentryID == undefined) { thisRoom.memory.sentryID = null}
                if(Game.time % 100 == 0) { explorer.checkExits(roomName, true) }
                else { explorer.checkExits(roomName) }
                explorer.assignLongHauls(roomName);
                processDefense.scanForHostiles(roomName);
                break;
            case ROOM_OWNED:
            case ROOM_OWNED_SAFE:
                roomLogging(thisRoom.name);

                explorer.checkExits(roomName)
                if (thisRoom.memory.sentryID !== undefined) { thisRoom.memory.sentryID = undefined}
                if (thisRoom.memory.missionaryID !== undefined) { thisRoom.memory.missionaryID = undefined}
                processDefense.scanForHostiles(roomName);
                explorer.checkForMissionary(roomName);

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
                break;
            case ROOM_HOSTILE:
                //if (thisRoom.memory.sentryID === undefined) { thisRoom.memory.sentryID = null }
                //processDefense.scanForHostiles(roomName);
                break;
        }

        let repairList = common.getRepairList(roomName);
        let creepList = _.filter(Game.creeps, (creep) => creep.room.name == roomName);
        if (creepList.length > 0) {
            let hasDroppedResources = helper.checkDroppedEnergy(roomName);
            let hasRuins = helper.checkRuins(roomName);
            runCreeps(creepList, buildList, repairList, hasDroppedResources || hasRuins);
        }
    }
    if (Memory.flags.listCreeps) { Memory.flags.listCreeps = false }

    for (let i in Game.spawns){
        let roomName = Game.spawns[i].room.name;
        //roleGeneral.defend();
        if (Memory.rooms[roomName].spawns === undefined) { Memory.rooms[roomName].spawns = []};
        if (Memory.rooms[roomName].spawns[0] === undefined) { Memory.rooms[roomName].spawns[0] = { name: i, hasRoads: 0} }
        let spawner = Game.spawns[i];

        //if (helper.isAvailable(i)) { explorer.spawnSentry(i) }
        if (helper.isAvailable(i)) { processCreeps.checkForSpawn(i) }

        if(_.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER).length > 0){
            if (Memory.rooms[roomName].spawns[0].hasRoads == 0) {construction.checkSpawnRoads(i)}
            else { 
                construction.checkExtensions(i);
                if (construction.buildSourceRoads(i)) {
                    if (spawner.room.memory.controllerRoad != 2){ construction.buildControllerRoad(spawner.room.controller)};
                }
            }
        };
    }
    processDefense.checkKillList();
};

function runCreeps(creepList, buildList, repairList, hasLooseEnergy) {
    if (Memory.flags.listCreeps) { helper.listCreeps(_.sortBy(creepList, (creep) => creep.name)) }
    let maintOffset = 0;
    for(let creepIndex in creepList) {
        let creep = creepList[creepIndex];
        if (creep.spawning) { continue }
        switch(creep.memory.role){
            case ROLE_BUILDER:
                roleBuilder.run(creep, buildList);
                break;
            case ARMY_DEFENDER:
                roleDefender.run(creep);
                break;
            case ROLE_HARVESTER:
                roleHarvester.run(creep, hasLooseEnergy);
                break;
            case ARMY_HEALER:
                roleHealer.run(creep);
                break;
            case ROLE_MAINTENANCE:
                roleMaint.run(creep, repairList, maintOffset);
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
            case ROLE_STORAGEBUDDY:
                roleStorageBud.run(creep);
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
}

function roomLogging(roomName){
    
    if(Game.time % 20 == 0){
        let thisRoom = Game.rooms[roomName];
        let storage = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE}});
        console.log(`${thisRoom.name} energy available: ${thisRoom.energyAvailable.toString().padStart(4, '0')}/${thisRoom.energyCapacityAvailable}`);
        if (storage.length > 0) {
            console.log(`${thisRoom.name} energy storage:   ${storage[0].store.getUsedCapacity(RESOURCE_ENERGY)}`);
        }
    }
}
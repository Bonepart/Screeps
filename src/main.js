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
let bodytype = require('constants.bodytype');
let processCreeps = require('process.creeps');
let processDefense = require('process.defense');
let explorer = require('process.exploration');
let construction = require('construction');
let helper = require('helper');

config.loadRoles();
config.sourceData();

module.exports.loop = function () {
    Game.functions = require('console');
    processCreeps.clearMemory();
    
    for (let roomName in Game.rooms){
        let thisRoom = Game.rooms[roomName];
        if(Game.time % 20 == 0){
            console.log(`${thisRoom.name} energy available: ${thisRoom.energyAvailable.toString().padStart(4, ' ')}/${thisRoom.energyCapacityAvailable}`);
        }

        if (Memory.rooms === undefined) { Memory.rooms = {}};
        if (Memory.rooms[roomName] === undefined) { Memory.rooms[roomName] = { spawnTier: 0, controllerRoad: 0} }

        //Determine Room State

        if (thisRoom.controller.owner == undefined) { 

            if (thisRoom.controller.reservation != undefined){
                if (thisRoom.controller.reservation.username == ME) {thisRoom.memory.roomState = ROOM_RESERVED}
                else {thisRoom.memory.roomState = ROOM_HOSTILE_RESERVED}
            }
            else {thisRoom.memory.roomState = ROOM_NEUTRAL}
        }
        else if (thisRoom.controller.my) { 
            if (thisRoom.controller.safeMode > 0) { thisRoom.memory.roomState = ROOM_OWNED_SAFE}
            else {thisRoom.memory.roomState = ROOM_OWNED}
        }
        else if (thisRoom.controller.owner.username != ME) { 
            if (thisRoom.controller.safeMode > 0) { thisRoom.memory.roomState = ROOM_HOSTILE_SAFE}
            else {thisRoom.memory.roomState = ROOM_HOSTILE}
        }

        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        switch (thisRoom.memory.roomState){
            case ROOM_NEUTRAL:
            case ROOM_RESERVED:
                if (thisRoom.memory.missionaryID == undefined) { thisRoom.memory.missionaryID = null}
                if (thisRoom.memory.missionaryID == null) { 
                    if (explorer.spawnCreep(ROLE_CLAIMER, bodytype.claimer[0], roomName)){
                        thisRoom.memory.missionaryID = 'spawning';
                    }
                }
                break;
            case ROOM_OWNED:
            case ROOM_OWNED_SAFE:
                processDefense.scanForHostiles(roomName);
                if (thisRoom.energyCapacityAvailable >= 800) { 
                    thisRoom.memory.spawnTier = 3;
                    explorer.run(roomName) 
                }
                else if (thisRoom.energyCapacityAvailable >= 500) { thisRoom.memory.spawnTier = 1 }
                else { thisRoom.memory.spawnTier = 1 };

                let structuresToRun = thisRoom.find(FIND_MY_STRUCTURES);
                for (let structure in structuresToRun){
                    switch (structuresToRun[structure].structureType){
                        case STRUCTURE_TOWER:
                            towerLogic.run(structuresToRun[structure]);
                            break;
                    }
                }

                break;
            case ROOM_HOSTILE_SAFE:
                if (thisRoom.controller.safeMode < 400) {
                    if (vikingList.length < 4) {
                        processDefense.spawnViking(roomName);
                    }
                    if (vikingList.length > 0) {
                        roleGeneral.run();
                    }
                }
                break;
            case ROOM_HOSTILE:
                if (vikingList.length < 4) {
                    processDefense.spawnViking(roomName);
                }
                if (vikingList.length > 0) {
                    roleGeneral.run(roomName);
                }
                break;
            

        }

        processDefense.checkForKeeperLair(roomName);
        


    }
    for (let i in Game.spawns){
        let roomName = Game.spawns[i].room.name;
        //roleGeneral.moveToFlag(roomName);
        if (Memory.rooms[roomName].spawns === undefined) { Memory.rooms[roomName].spawns = []};
        if (Memory.rooms[roomName].spawns[0 === undefined]) { Memory.rooms[roomName].spawns[0] = { name: i, hasRoads: 0} }
        let spawner = Game.spawns[i];

        if (isAvailable(i)) {processCreeps.checkForSpawn(i)}
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

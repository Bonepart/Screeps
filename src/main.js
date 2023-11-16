require('constants');
const config = require('config');

const roleBuilder = require('role.builder');
const roleHarvester = require('role.harvester');
const roleHealer = require('role.healer');
const roleMaint = require('role.maint');
const roleMiner = require('role.miner');
const roleRanged = require('role.ranged');
const roleUpgrader = require('role.upgrader');
const roleZombie = require('role.zombie');

const roleLonghaul = require('role.longhaul');
const roleGofer = require('role.gofer');
const roleStorageBud = require('role.storagebuddy');
const roleClaimer = require('role.claimer');
const roleSentry = require('role.sentry');

const terminalLogic = require('structure.terminal');
const towerLogic = require('structure.tower');
const linkLogic = require('structure.link');
const bodytype = require('constants.bodytype');
const processCreeps = require('process.creeps');
const processDefense = require('process.defense');
const processRooms = require('process.rooms');
const explorer = require('process.exploration');
const construction = require('construction');
const spawnLogic = require('logic.spawning');
const common = require('logic.common');
const helper = require('helper');

config.loadRoles();

module.exports.loop = function () {
    
    Game.c = require('console');
    clearMemory();
    resetIndex();
    
    let buildList = common.getBuildList();
    for (let roomName in Game.rooms){
        let thisRoom = Game.rooms[roomName];

        if (Memory.rooms === undefined) { Memory.rooms = {}};
        if (Memory.rooms[roomName] === undefined) { Memory.rooms[roomName] = {} }
        processRooms.sourceData(roomName);
        processRooms.checkRoomState(roomName);
        processDefense.checkForKeeperLair(roomName);

        if(Memory.flags.runReport){ helper.runMineralReport(roomName) }
        if(Game.time % 100 == 0){ if (thisRoom.find(FIND_NUKES).length > 0){ Game.notify(`***WARNING NUKE DETECTED IN ${thisRoom.name}***`)} }

        switch (thisRoom.memory.roomState){
            case ROOM_NEUTRAL:
                break;
            case ROOM_RESERVED:         
                if (thisRoom.memory.sentryID == undefined) { thisRoom.memory.sentryID = null}
                if(Game.time % 100 == 0) { explorer.checkExits(roomName, true) }
                else { explorer.checkExits(roomName) }
                processCreeps.checkForMaintenance(roomName);
                explorer.assignLongHauls(roomName);
                processDefense.scanForHostiles(roomName);
                break;
            case ROOM_OWNED:
            case ROOM_OWNED_SAFE:
                roomLogging(thisRoom.name);
                if (thisRoom.memory.spawnTier == undefined) { thisRoom.memory.spawnTier = 0 }
                if (thisRoom.memory.controllerRoad == undefined) { thisRoom.memory.controllerRoad = 0 }
                if(Game.time % 100 == 0) { explorer.checkExits(roomName, true) }
                else { explorer.checkExits(roomName) }
                if (thisRoom.memory.sentryID !== 'NA') { thisRoom.memory.sentryID = 'NA' }
                if (thisRoom.memory.missionaryID !== undefined) { thisRoom.memory.missionaryID = undefined}
                processDefense.scanForHostiles(roomName);
                if (Memory.flags.useMissionaries) { explorer.checkForMissionary(roomName) }

                if (thisRoom.energyCapacityAvailable >= 1300) { thisRoom.memory.spawnTier = 4 }
                else if (thisRoom.energyCapacityAvailable >= 800) { thisRoom.memory.spawnTier = 3 }
                else if (thisRoom.energyCapacityAvailable >= 500) { thisRoom.memory.spawnTier = 2 }
                else { thisRoom.memory.spawnTier = 1 };

                let structuresToRun = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { 
                    return structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_LINK ||
                            structure.structureType == STRUCTURE_TERMINAL ||
                            structure.structureType == STRUCTURE_LAB }
                });
                for (let structure of structuresToRun){
                    switch (structure.structureType){
                        case STRUCTURE_TERMINAL:
                            //terminalLogic.run(structure);
                            break;
                        case STRUCTURE_TOWER:
                            towerLogic.run(structure);
                            break;
                        case STRUCTURE_LINK:
                            linkLogic.run(structure);
                            break;
                        default:
                            //console.log(`${structure.structureType}`);
                            break;
                    }
                }
                break;
            case ROOM_HOSTILE_RESERVED:
                processDefense.scanForHostiles(roomName);
                break;
            case ROOM_HOSTILE_SAFE: 
            case ROOM_HOSTILE:
                if (thisRoom.memory.sentryID !== 'NA') { thisRoom.memory.sentryID = 'NA' }
                if (thisRoom.memory.missionaryID !== 'NA') { thisRoom.memory.missionaryID = 'NA'}
                break;
        }

        let creepList = _.filter(Game.creeps, (creep) => creep.room.name == roomName);
        if (creepList.length > 0) { runCreeps(roomName, creepList, buildList) }
    }
    if (Memory.flags.listCreeps) { Memory.flags.listCreeps = false }

    processDefense.checkForCrusade();

    for (let i in Game.spawns){
        let spawner = Game.spawns[i];
        let roomName = spawner.room.name;
        if (Memory.rooms[roomName].spawns === undefined) { Memory.rooms[roomName].spawns = []};
        if (Memory.rooms[roomName].spawns[0] === undefined) { Memory.rooms[roomName].spawns[0] = { name: i, hasRoads: 0} }
        

        if (spawner.room.controller.level >= 6) {
            let minerList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MINER && creep.memory.assignedRoom == roomName);
            let extractorCount = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_EXTRACTOR}}).length;
            if (minerList.length < extractorCount && helper.isAvailable(i)) { 
                let roomMineral = spawner.room.find(FIND_MINERALS)[0];
                if (roomMineral.mineralAmount > 0){
                    let memoryObject = { role: ROLE_MINER, tier: 0, assignedRoom: roomName };
                    spawnLogic.spawnCreep(i, ROLE_MINER, bodytype.miner[0], memoryObject)
                }
            }
        }

        if (helper.isAvailable(i)) { spawnLogic.spawnSentry(i) }
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
    monitorBucket();
};

function runCreeps(roomName, creepList, buildList) {
    let energyList = common.getEnergyConsumerList(roomName, creepList);
    let repairList = common.getRepairList(roomName, creepList);
    let hasLooseEnergy = helper.checkDroppedEnergy(roomName) || helper.checkRuins(roomName);

    if (Memory.flags.listCreeps) { helper.listCreeps(_.sortBy(creepList, (creep) => creep.name)) }
    for(let creepIndex in creepList) {
        let creep = creepList[creepIndex];
        if (creep.spawning) { continue }
        switch(creep.memory.role){
            case ROLE_BUILDER:
                roleBuilder.run(creep, buildList);
                break;
            case ROLE_HARVESTER:
                roleHarvester.run(creep, energyList, hasLooseEnergy);
                break;
            case ARMY_HEALER:
                roleHealer.run(creep);
                break;
            case ROLE_MAINTENANCE:
                roleMaint.run(creep, repairList);
                break;
            case ROLE_MINER:
                roleMiner.run(creep);
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
                roleGofer.run(creep, energyList);
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
                console.log(`${creep.name}: Unsupported role! (${creep.memory.role})`);
        }
    }
}

function roomLogging(roomName){
    if(Game.time % 40 == 0){
        let thisRoom = Game.rooms[roomName];
        let storage = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE}});
        //console.log(`${thisRoom.name} energy available: ${thisRoom.energyAvailable.toString().padStart(4, '0')}/${thisRoom.energyCapacityAvailable}`);
        if (storage.length > 0 && storage[0].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            console.log(`${thisRoom.name} energy storage:   ${storage[0].store.getUsedCapacity(RESOURCE_ENERGY)}`);
        }
    }
}

function clearMemory(){
    if(Game.time % 10 == 0) {
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
        for(let name in Memory.rooms) {
            if (Memory.rooms[name].sentryID === undefined || Memory.rooms[name].sentryID == 'NA') { continue }
            if (Memory.rooms[name].sentryID !== null && Game.creeps[Memory.rooms[name].sentryID] === undefined) {
                Memory.rooms[name].sentryID = null;
                console.log(`Clearing invalid Sentry ID from ${name}`);
            }
        }
    }
}

function resetIndex(){
    if(Game.time % 100 == 0){
        for (let i in Memory.roles.index){
            if (Memory.roles.index[i] >= 90) { 
                console.log(`${i} index = ${Memory.roles.index[i]}. Reset to 1`);
                Memory.roles.index[i] = 1;
            }
        }
    }
}

function monitorBucket(){
    if (Memory.flags.runReport) { Memory.flags.runReport = false }
    if (Game.cpu.bucket == 10000){
        Game.cpu.generatePixel();
        Memory.flags.bucket = 0;
        console.log('Turned in 10,000 ticks for 1 Pixel');
    }
    if(Game.time % 200 == 0){
        if (Memory.flags.bucket == undefined) { Memory.flags.bucket = Game.cpu.bucket }
        if (Game.cpu.bucket < Memory.flags.bucket){
            console.log(`***WARNING*** Bucket is being emptied! (${Memory.flags.bucket} => ${Game.cpu.bucket})`);
            Game.notify(`***WARNING*** Bucket is being emptied! (${Memory.flags.bucket} => ${Game.cpu.bucket})`, 60);
        }
        else if (Game.cpu.bucket > Memory.flags.bucket){
            let tickGain = Game.cpu.bucket - Memory.flags.bucket;
            console.log(`CPU Bucket: ${Game.cpu.bucket} (Gained ${tickGain})`);
            //Game.notify(`CPU Bucket: ${Game.cpu.bucket} (Gained ${tickGain})`, 60);
        }
        else { console.log(`CPU Bucket: ${Game.cpu.bucket}`) }
        Memory.flags.bucket = Game.cpu.bucket;
        //Memory.flags.runReport = true;
    }
}

function* displayUsedCPU( activeLog=true){
    let usedCPU = Game.cpu.getUsed();
    if (activeLog) { console.log(`New Tick, CPU used so far: ${usedCPU}`) }
    while (true){
        let getReading = Game.cpu.getUsed();
        if (activeLog) { console.log(`CPU Used since last call: ${getReading - usedCPU}`) }
        usedCPU = getReading;
        yield;
    }
}
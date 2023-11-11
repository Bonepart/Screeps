let helper = require('helper');
let spawnLogic = require('logic.spawning');
let bodytype = require('constants.bodytype');
const { ceil } = require("lodash");

let processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];
        let i = spawner.room.name;

        let builderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER && creep.memory.assignedRoom == i);
        let harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_HARVESTER && creep.memory.assignedRoom == i);
        let upgraderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_UPGRADER && creep.memory.assignedRoom == i);
        let maintList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MAINTENANCE && creep.memory.assignedRoom == i);
        let storageBuddyList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_STORAGEBUDDY && creep.memory.assignedRoom == i);
        
        let defenderList = 0;
        let vikingList = 0;
        let rangedList = 0;
        let healerList = 0;

        if (Memory.roles.limit[ARMY_DEFENDER] > 0){defenderList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_DEFENDER)}
        if (Memory.roles.limit[ARMY_VIKING] > 0){vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING)}
        if (Memory.roles.limit[ARMY_RANGED] > 0){rangedList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_RANGED)}
        if (Memory.roles.limit[ARMY_HEALER] > 0){healerList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_HEALER)}

        let zombieList = _.filter(Game.creeps, (creep) => creep.memory.role == ZOMBIE);

        if (zombieList == 0){
            if (builderList.length > Memory.roles.limit[ROLE_BUILDER]){ 
                builderList[0].memory.role = ZOMBIE;
                console.log(`Too many Builders: ${builderList.length}/${Memory.roles.limit[ROLE_BUILDER]}, ${builderList[0].name} is now a zombie`);
            }
        }

        let creepTier = spawner.room.memory.spawnTier - 1;

        if (spawner.store.getUsedCapacity(RESOURCE_ENERGY) >= 250){
            let body = null;
            if (defenderList.length < Memory.roles.limit[ARMY_DEFENDER]){
                if (creepTier >= bodytype.defender.length) { creepTier = bodytype.defender.length - 1}
                body = bodytype.defender[creepTier]
                spawnLogic.spawnCreep(spawnIndex, ARMY_DEFENDER, body, creepTier);
            }
            else if (healerList.length < Memory.roles.limit[ARMY_HEALER]){
                if (creepTier >= bodytype.healer.length) { creepTier = bodytype.healer.length - 1}
                body = bodytype.healer[creepTier]
                spawnLogic.spawnCreep(spawnIndex, ARMY_HEALER, body, creepTier);
            }
            else {
                if (harvesterList.length < Memory.roles.limit[ROLE_HARVESTER]){
                    if (creepTier >= bodytype.harvester.length) { creepTier = bodytype.harvester.length - 1}
                    body = bodytype.harvester[creepTier]
                    if (spawnLogic.spawnCreep(spawnIndex, ROLE_HARVESTER, body, creepTier, i)) { return }
                }
                else if(maintList.length < Memory.roles.limit[ROLE_MAINTENANCE]){
                    if (creepTier >= bodytype.maintenance.length) { creepTier = bodytype.maintenance.length - 1}
                    body = bodytype.maintenance[creepTier]
                    if (spawnLogic.spawnCreep(spawnIndex, ROLE_MAINTENANCE, body, creepTier, i)) { return }
                }
                else if(builderList.length < Memory.roles.limit[ROLE_BUILDER]){
                    if (creepTier >= bodytype.builder.length) { creepTier = bodytype.builder.length - 1}
                    body = bodytype.builder[creepTier]
                    if (spawnLogic.spawnCreep(spawnIndex, ROLE_BUILDER, body, creepTier, i)) { return }
                }
                else if(upgraderList.length < Memory.roles.limit[ROLE_UPGRADER]){
                    if (creepTier >= bodytype.upgrader.length) { creepTier = bodytype.upgrader.length - 1}
                    body = bodytype.upgrader[creepTier]
                    if (spawnLogic.spawnCreep(spawnIndex, ROLE_UPGRADER, body, creepTier, i)) { return }
                }
                else if (storageBuddyList.length == 0){
                    let energyStorage = Game.rooms[i].find(FIND_STRUCTURES, {
                        filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }}).length;
                    if (energyStorage > 0 && Memory.rooms[i].links != undefined){
                        body = bodytype.storagebuddy;
                        if (spawnLogic.spawnCreep(spawnIndex, ROLE_STORAGEBUDDY, body, -1, i)) { return }
                    }
                }
            }
            checkGofers(spawnIndex, creepTier);
        }
    },

    clearMemory: function(){
        if(Game.time % 10 == 0) {
            for(let name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log('Clearing non-existing creep memory:', name);
                }
            }
            for(let name in Memory.rooms) {
                if (Memory.rooms[name].sentryID === undefined) { continue }
                if (Memory.rooms[name].sentryID !== null && Game.creeps[Memory.rooms[name].sentryID] === undefined) {
                    Memory.rooms[name].sentryID = null;
                    console.log(`Clearing invalid Sentry ID from ${name}`);
                }
            }
        }
    }
};
module.exports = processCreeps;

function checkGofers(spawnIndex, creepTier) {
    let thisSpawn = Game.spawns[spawnIndex];
    let thisRoom = Game.rooms[thisSpawn.room.name];
    let roomStorage = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE}});
    let roomTowers = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_TOWER}});

    if (thisRoom.controller.level >= 6){
        let myExtractor = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_EXTRACTOR}});
        if (myExtractor.length > 0){
            let mineral = thisRoom.find(FIND_MINERALS)[0];
            let goferList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER && creep.memory.assignedRoom == thisRoom.name && creep.memory.task == TASK_STORE_MINERALS);
            if (goferList.length < 1){
                let depositContainer = mineral.pos.findInRange(FIND_STRUCTURES, 10, {filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER}});
                if (depositContainer.length > 0){
                    if (spawnLogic.spawnGofer(spawnIndex, creepTier, { 
                        assignedRoom: thisRoom.name, 
                        task: TASK_STORE_MINERALS, 
                        containerID: depositContainer[0].id,
                        storageID: roomStorage[0].id,
                        mineralType: mineral.mineralType
                    })) { return }
                }
            }
        }
    }
    if (thisRoom.memory.importContainerID) {
        let container = Game.getObjectById(thisRoom.memory.importContainerID);
        if (container != null && container.structureType == STRUCTURE_CONTAINER) {

        }
    }
    if (roomStorage.length > 0 && roomTowers.length > 0){
        let goferList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER && creep.memory.assignedRoom == thisRoom.name && creep.memory.task == TASK_TOWER_SUPPLY);
        if (goferList.length < roomTowers.length && roomStorage[0].store.getUsedCapacity(RESOURCE_ENERGY) >= 100000){
            for (let tower of roomTowers){
                let hasGofer = false;
                for (let gofer of goferList){ if (gofer.memory.towerID == tower.id) { hasGofer = true; break } }
                if (!hasGofer){
                    if (spawnLogic.spawnGofer(spawnIndex, creepTier, { assignedRoom: thisRoom.name, task: TASK_TOWER_SUPPLY, towerID: tower.id, storageID: roomStorage[0].id })) { return }
                }
            }
        }
    }

}
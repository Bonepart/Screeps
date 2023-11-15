let spawnLogic = require('logic.spawning');
let bodytype = require('constants.bodytype');
let helper = require('helper');

let processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];
        let roomName = spawner.room.name;
        let hasStorage = Game.rooms[roomName].find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }}).length > 0;
        let builderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER && creep.memory.assignedRoom == roomName);
        let harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_HARVESTER && creep.memory.assignedRoom == roomName && creep.memory.sourceID == undefined);
        let upgraderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_UPGRADER && creep.memory.assignedRoom == roomName);
        let maintList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MAINTENANCE && creep.memory.assignedRoom == roomName);
        let storageBuddyList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_STORAGEBUDDY && creep.memory.assignedRoom == roomName);

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
            
            if (hasStorage){
                let creepCount = {};
                for (let i in spawner.room.memory.sourceList){
                    creepCount[i] = { id: spawner.room.memory.sourceList[i].id,
                        count: _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_HARVESTER && creep.memory.assignedRoom == roomName && creep.memory.sourceID == spawner.room.memory.sourceList[i].id).length
                    }
                }
                if (harvesterList.length > 0){
                    for (let i in creepCount){
                        for (let creep of harvesterList){
                            if (creep.memory.sourceID == undefined && creepCount[i].count < spawner.room.memory.sourceList[i].openSpaces[0]){
                                creep.memory.sourceID = creepCount[i].id;
                                creepCount[i].count++;
                            }
                        }
                    }
                } 
                else {
                    for (let i in creepCount){
                        if (creepCount[i].count < spawner.room.memory.sourceList[i].openSpaces[0]){
                            if (creepTier >= bodytype.harvester.length) { creepTier = bodytype.harvester.length - 1}
                            body = bodytype.harvester[creepTier]
                            let memoryObject = { role: ROLE_HARVESTER, tier: creepTier + 1, assignedRoom: roomName, sourceID: creepCount[i].id };
                            if (spawnLogic.spawnCreep(spawnIndex, ROLE_HARVESTER, body, memoryObject)) { return }
                        }
                    }
                }
            }
            else if (harvesterList.length < Memory.roles.limit[ROLE_HARVESTER]){
                if (creepTier >= bodytype.harvester.length) { creepTier = bodytype.harvester.length - 1}
                body = bodytype.harvester[creepTier]
                let memoryObject = { role: ROLE_HARVESTER, tier: creepTier + 1, assignedRoom: roomName };
                if (spawnLogic.spawnCreep(spawnIndex, ROLE_HARVESTER, body, memoryObject)) { return }
            }
            if(maintList.length < Memory.roles.limit[ROLE_MAINTENANCE]){
                if (creepTier >= bodytype.maintenance.length) { creepTier = bodytype.maintenance.length - 1}
                body = bodytype.maintenance[creepTier]
                let memoryObject = { role: ROLE_MAINTENANCE, tier: creepTier + 1, assignedRoom: roomName };
                if (spawnLogic.spawnCreep(spawnIndex, ROLE_MAINTENANCE, body, memoryObject)) { return }
            }
            else if(builderList.length < Memory.roles.limit[ROLE_BUILDER]){
                if (creepTier >= bodytype.builder.length) { creepTier = bodytype.builder.length - 1}
                body = bodytype.builder[creepTier]
                let memoryObject = { role: ROLE_BUILDER, tier: creepTier + 1, assignedRoom: roomName };
                if (spawnLogic.spawnCreep(spawnIndex, ROLE_BUILDER, body, memoryObject)) { return }
            }
            else if(upgraderList.length < Memory.roles.limit[ROLE_UPGRADER]){
                if (creepTier >= bodytype.upgrader.length) { creepTier = bodytype.upgrader.length - 1}
                body = bodytype.upgrader[creepTier]
                let memoryObject = { role: ROLE_UPGRADER, tier: creepTier + 1, assignedRoom: roomName };
                if (spawnLogic.spawnCreep(spawnIndex, ROLE_UPGRADER, body, memoryObject)) { return }
            }
            if (storageBuddyList.length == 0 && hasStorage && Memory.rooms[roomName].links != undefined){
                body = bodytype.storagebuddy;
                let memoryObject = { role: ROLE_STORAGEBUDDY, tier: 0, assignedRoom: roomName };
                if (spawnLogic.spawnCreep(spawnIndex, ROLE_STORAGEBUDDY, body, memoryObject)) { return }
            }
            checkGofers(spawnIndex, creepTier);
        }
    },

    checkForMaintenance: function (roomName){
        let thisRoom = Game.rooms[roomName];
        if (thisRoom == undefined) { return }

        let roadCount = thisRoom.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_ROAD}}).length;
        if (roadCount > 0){
            let desiredMaintCreeps = Math.ceil(roadCount / 50);
            let maintList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MAINTENANCE && creep.memory.assignedRoom == roomName);
            if (maintList.length < desiredMaintCreeps){
                for (let i in Game.spawns){
                    if (!helper.isAvailable(i)) { continue }
                    let spawner = Game.spawns[i];
                    let creepTier = spawner.room.memory.spawnTier - 1;
                    if (creepTier >= bodytype.maintenance.length) { creepTier = bodytype.maintenance.length - 1}
                    let body = bodytype.maintenance[creepTier]
                    let memoryObject = { role: ROLE_MAINTENANCE, tier: creepTier + 1, assignedRoom: roomName };
                    if (spawnLogic.spawnCreep(i, ROLE_MAINTENANCE, body, memoryObject)) { return }
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
    let roomTerminal = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_TERMINAL}});

    if (thisRoom.controller.level >= 6){
        let myExtractor = thisRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_EXTRACTOR}});
        if (myExtractor.length > 0){
            let mineral = thisRoom.find(FIND_MINERALS)[0];
            let goferList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER && creep.memory.assignedRoom == thisRoom.name && creep.memory.task == TASK_STORE_MINERALS);
            if (goferList.length < 1){
                let depositContainer = mineral.pos.findInRange(FIND_STRUCTURES, 10, {filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER}});
                if (depositContainer.length > 0 && depositContainer[0].store.getUsedCapacity(mineral.mineralType) > 0){
                    let memoryObject = { role: ROLE_GOFER, 
                                        assignedRoom: thisRoom.name, 
                                        task: TASK_STORE_MINERALS, 
                                        containerID: depositContainer[0].id, 
                                        storageID: roomStorage[0].id,
                                        mineralType: mineral.mineralType };
                    if (spawnLogic.spawnGofer(spawnIndex, creepTier, memoryObject)) { return }
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
                    let memoryObject = { role: ROLE_GOFER, assignedRoom: thisRoom.name, task: TASK_TOWER_SUPPLY, towerID: tower.id, storageID: roomStorage[0].id };
                    if (spawnLogic.spawnGofer(spawnIndex, creepTier, memoryObject)) { return }
                }
            }
        }
    }
    if (roomTerminal.length > 0){
        let goferList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER && creep.memory.assignedRoom == thisRoom.name && creep.memory.task == TASK_TERMINAL_GOFER);
        if (goferList.length == 0){
            let memoryObject = { role: ROLE_GOFER, assignedRoom: thisRoom.name, task: TASK_TERMINAL_GOFER, terminalID: roomTerminal[0].id };
            if (spawnLogic.spawnGofer(spawnIndex, creepTier, memoryObject)) { return }
        }
    }
    if (thisRoom.memory.upgradeContainer){
        let container = Game.getObjectById(thisRoom.memory.upgradeContainer);
        if (container == null) { thisRoom.memory.upgradeContainer == undefined}
        else {
            let goferList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER && creep.memory.assignedRoom == thisRoom.name && creep.memory.task == TASK_FILL_UPGRADE_CONTAINER);
            if (goferList.length == 0 && roomStorage.length > 0 && roomStorage[0].store.getUsedCapacity(RESOURCE_ENERGY) >= 10000){
                let memoryObject = { role: ROLE_GOFER, assignedRoom: thisRoom.name, task: TASK_FILL_UPGRADE_CONTAINER, storageID: roomStorage[0].id, containerID: thisRoom.memory.upgradeContainer };
                if (spawnLogic.spawnGofer(spawnIndex, creepTier, memoryObject)) { return }
            }
        }
    }

}
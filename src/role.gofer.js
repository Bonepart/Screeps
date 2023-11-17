let common = require('logic.common');
let helper = require('helper');

let roleGofer = {

    /** @param {Creep} creep **/
    run: function(creep, energyList){
        if(creep.memory.collecting && creep.store.getFreeCapacity() === 0) {
            creep.memory.collecting = false;
        }
        if(!creep.memory.collecting && creep.store.getUsedCapacity() === 0) {
            creep.memory.collecting = true;
        }

        switch(creep.memory.task){
            case TASK_IMPORTER:
                containerImporter(creep);
                break;
            case TASK_FILL_UPGRADE_CONTAINER:
                fillUpgradeContainer(creep);
                break;
            case TASK_STORE_MINERALS:
                storeMinerals(creep);
                break;
            case TASK_TOWER_SUPPLY:
                towerSupply(creep);
                break;
            case TASK_TERMINAL_GOFER:
                terminalGofer(creep);
                break;
            default:
                console.log(`${creep.name} run Error: unhandled task ${creep.memory.task}`);
                return;
        }
    } 
}
module.exports = roleGofer;

/** @param {Creep} creep **/
function containerImporter(creep){
    if (creep.room.memory.importContainerID == undefined) { creep.memory.role = ZOMBIE; return; }
    if(creep.memory.collecting) {
        let importContainer = Game.getObjectById(creep.room.memory.importContainerID);
        if (importContainer.structureType != STRUCTURE_CONTAINER){ creep.memory.role = ZOMBIE; return; }
        if (importContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            let result = creep.withdraw(importContainer, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(importContainer, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
    else {
        let storage = creep.room.find(FIND_STRUCTURES, {filter: (structure) => { 
            return (structure.structureType == STRUCTURE_STORAGE ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }})
        if (storage.length > 0){
            if(creep.transfer(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            let targets = (creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            }));
            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_TOWER ) && 
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    
                }}));
            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER ) && 
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    structure.id != creep.room.memory.importContainerID
                }}));
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
}

function fillUpgradeContainer(creep){
    let upgradeContainer = Game.getObjectById(creep.memory.containerID);
    let roomStorage = Game.getObjectById(creep.memory.storageID);

    if (creep.memory.collecting){
        if (upgradeContainer.store.getFreeCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY)) { return }
        let result = creep.withdraw(roomStorage, RESOURCE_ENERGY);
        switch (result){
            case ERR_NOT_IN_RANGE:
                creep.moveTo(roomStorage, {visualizePathStyle: {stroke: '#ffaa00'}});
            case OK:
                break;
            default:
                console.log(`${creep.name} withdraw from Storage failed (${result})`);
                break;
        }
    }
    else {
        let result = creep.transfer(upgradeContainer, RESOURCE_ENERGY);
        switch (result){
            case ERR_NOT_IN_RANGE:
                creep.moveTo(upgradeContainer, {visualizePathStyle: {stroke: '#ffaa00'}});
            case OK:
            case ERR_FULL:
                break;
            default:
                console.log(`${creep.name} transfer to Upgrade Container failed (${result})`);
                break;
        }
    }
}

/** @param {Creep} creep **/
function storeMinerals(creep){
    if(creep.memory.collecting) {
        let mineralContainer = Game.getObjectById(creep.memory.containerID);
        if (mineralContainer == null) {
            console.log(`${TASK_STORE_MINERALS} ${creep.name} can not find container with minerals`);
            creep.memory.role = ZOMBIE;
            return;
        }
        if (creep.store.getUsedCapacity(creep.memory.mineralType) == 0 && creep.ticksToLive < 50) { creep.memory.role = ZOMBIE; return }
        if (mineralContainer.store.getUsedCapacity(creep.memory.mineralType) == 0 && creep.store.getUsedCapacity(creep.memory.mineralType) > 0){
            creep.memory.collecting = false;
            return;
        }
        if(creep.withdraw(mineralContainer, creep.memory.mineralType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(mineralContainer, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
    else {
        let myStorage = Game.getObjectById(creep.memory.storageID);
        if (myStorage == null) {
            console.log(`${TASK_STORE_MINERALS} ${creep.name} can not find storage`);
            creep.memory.role = ZOMBIE;
            return;
        }
        if(creep.transfer(myStorage, creep.memory.mineralType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(myStorage, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
}

/** @param {Creep} creep **/
function towerSupply(creep){
    if(creep.memory.collecting) {
        let myStorage = Game.getObjectById(creep.memory.storageID);
        if (myStorage == null) {
            console.log(`${TASK_TOWER_SUPPLY} ${creep.name} can not find storage`);
            creep.memory.role = ZOMBIE;
            return;
        }
        if (myStorage.store.getUsedCapacity(RESOURCE_ENERGY) >= 100000){
            if(creep.withdraw(myStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(myStorage, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
    else {
        let myTower = Game.getObjectById(creep.memory.towerID);
        if (myTower == null) {
            console.log(`${TASK_TOWER_SUPPLY} ${creep.name} can not find tower`);
            creep.memory.role = ZOMBIE;
            return;
        }
        if(creep.transfer(myTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(myTower, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
}

/** @param {Creep} creep **/
function terminalGofer(creep){
    let assignedRoom = Game.rooms[creep.memory.assignedRoom];
    let myTerminal = Game.getObjectById(creep.memory.terminalID);
    if (creep.memory.collecting){
        if (!creep.memory.resourcesInStorage) { if(Game.time % 100 == 0){ creep.memory.resourcesInStorage = searchForResources(creep) } }
        else { if (collectResources(creep)) { return } }

        let roomStorage = assignedRoom.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }});
        if (myTerminal.store.getUsedCapacity(RESOURCE_ENERGY) < 2000){
            if (roomStorage.length > 0 && roomStorage[0].store.getUsedCapacity(RESOURCE_ENERGY) > 0){
                let result = null;
                if (2000 - myTerminal.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity(RESOURCE_ENERGY)) { result = creep.withdraw(roomStorage[0], RESOURCE_ENERGY) }
                else { result = creep.withdraw(roomStorage[0], RESOURCE_ENERGY, 2000 - myTerminal.store.getUsedCapacity(RESOURCE_ENERGY)) }
                result = creep.withdraw(roomStorage[0], RESOURCE_ENERGY);
                switch (result){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(roomStorage[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                        return;
                    case OK:
                        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) + myTerminal.store.getUsedCapacity(RESOURCE_ENERGY) >= 2000) { creep.memory.collecting = false }
                        return;
                    default:
                        console.log(`${creep.name} withdraw Energy from Storage failed (${result})`);
                        break;
                }      
            }
        }
        if (myTerminal.store.getUsedCapacity(assignedRoom.memory.mineralType) < 2000){
            if (roomStorage.length > 0 && roomStorage[0].store.getUsedCapacity(assignedRoom.memory.mineralType) > 0){
                let result = null;
                if (2000 - myTerminal.store.getUsedCapacity(assignedRoom.memory.mineralType) >= creep.store.getCapacity(assignedRoom.memory.mineralType)) { result = creep.withdraw(roomStorage[0], assignedRoom.memory.mineralType) }
                else { result = creep.withdraw(roomStorage[0], assignedRoom.memory.mineralType, 2000 - myTerminal.store.getUsedCapacity(assignedRoom.memory.mineralType)) }
                result = creep.withdraw(roomStorage[0], assignedRoom.memory.mineralType);
                switch (result){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(roomStorage[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                        return;
                    case OK:
                        if (creep.store.getUsedCapacity(assignedRoom.memory.mineralType) + myTerminal.store.getUsedCapacity(assignedRoom.memory.mineralType) >= 2000) { creep.memory.collecting = false }
                        return;
                    default:
                        console.log(`${creep.name} withdraw ${assignedRoom.memory.mineralType} from Storage failed (${result})`);
                        break;
                }   
            }
        }
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) { creep.memory.collecting = false }
    }
    else {
        for (let resource in creep.store){
            let result = creep.transfer(myTerminal, resource);
            switch(result){
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(myTerminal, {visualizePathStyle: {stroke: '#ffffff'}});
                case OK:
                    return
                default:
                    console.log(`${creep.name} terminal transfer result: ${result}`);
            }
        }
    }
}

/** @param {Creep} creep **/
function searchForResources(creep){
    for (let i in Game.rooms){
        if (Game.rooms[i].memory.roomState >= ROOM_OWNED){
            let roomStorage = Game.rooms[i].find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }});
            if (roomStorage.length > 0){
                for (let resource in roomStorage[0].store){
                    if (resource == RESOURCE_OXYGEN || resource == RESOURCE_HYDROGEN || resource == RESOURCE_ENERGY) { continue }
                    creep.memory.resourcesInStorage = true;
                    creep.memory.moveTarget = roomStorage[0].id; 
                    return true;
                }
            }
        }
    }
    return false;
}

/** @param {Creep} creep **/
function collectResources(creep){
    if (creep.ticksToLive < 100 && creep.store.getUsedCapacity() > 0) { creep.memory.collecting = false; creep.memory.resourcesInStorage = false; return true }
    if (creep.memory.moveTarget){
        let targetStorage = Game.getObjectById(creep.memory.moveTarget);
        let result = creep.moveTo(targetStorage, { visualizePathStyle: {stroke: '#ffffff'}});
        switch(result){
            case OK:
                break;
            default:
                console.log(`${creep.name} move result: ${result}`);
        }
        if (creep.room.name == targetStorage.room.name && creep.pos.getRangeTo(targetStorage) < 2){ creep.memory.moveTarget = null }
        return true;
    }
    else {
        for (let i in Game.rooms){
            if (Game.rooms[i].memory.roomState >= ROOM_OWNED){
                let roomStorage = Game.rooms[i].find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }});
                if (roomStorage.length > 0){
                    for (let resource in roomStorage[0].store){
                        if (resource == RESOURCE_OXYGEN || resource == RESOURCE_HYDROGEN || resource == RESOURCE_ENERGY) { continue }
                        if (creep.room.name != roomStorage[0].room.name) { creep.memory.moveTarget = roomStorage[0].id; return }
                        let result = creep.withdraw(roomStorage[0], resource);
                        console.log(`${creep.name} resource = ${resource}, result = ${result}`);
                        switch(result){
                            case ERR_NOT_IN_RANGE:
                                console.log(creep.moveTo(roomStorage[0], {reusePath: 0, visualizePathStyle: {stroke: '#ffffff'}}));
                            case OK:
                                return true;
                            default:
                                console.log(`${creep.name} storage transfer result: ${result}`);
                        }
                    }
                }
            }
        }
        if (creep.store.getUsedCapacity() > 0) { creep.memory.collecting = false }
        creep.memory.resourcesInStorage = false;
        return false;
    }
}
let pathing = require('logic.pathing');
let common = require('logic.common');
let helper = require('helper');

let roleGofer = {

    /** @param {Creep} creep **/
    run: function(creep, energyList){
        if (creep.memory.assignedRoom) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }

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
            case TASK_TOWER_SUPPLY:
                towerSupply(creep);
                break;
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

/** @param {Creep} creep **/
function towerSupply(creep){
    if(creep.memory.collecting) {
        let myStorage = Game.getObjectById(creep.memory.storageID);
        if (myStorage == null) {
            console.log(`${TASK_TOWER_SUPPLY} ${creep.name} can not find storage`);
            creep.memory.role = ZOMBIE;
            return;
        }
        if(creep.withdraw(myStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(myStorage, {visualizePathStyle: {stroke: '#ffffff'}});
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
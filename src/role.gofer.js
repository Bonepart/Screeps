let helper = require('helper');
let pathing = require('pathing');

let roleGofer = {

  /** @param {Creep} creep **/
    run: function(creep){
        if(creep.memory.collecting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.collecting = false;
        }
        if(!creep.memory.collecting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.collecting = true;
        }
        
        if(creep.memory.collecting) {
            let searchTarget = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (resource) => { return resource.resourceType == RESOURCE_ENERGY}});
            if (searchTarget) {
                if(creep.pickup(searchTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }
            searchTarget = pathing.findClosestRuin(creep.pos);
            if (searchTarget){
                if(creep.withdraw(searchTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }

            if (creep.room.memory.importContainerID != undefined){
                let importContainer = Game.getObjectById(creep.room.memory.importContainerID);
                if (importContainer == undefined) { creep.room.memory.importContainerID = undefined }
                else {
                    if (importContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
                        let result = creep.withdraw(importContainer, RESOURCE_ENERGY);
                        if(result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(importContainer, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        }
        else {
            let storage = creep.room.find(FIND_STRUCTURES, {filter: (structure) => { 
                return (structure.structureType == STRUCTURE_STORAGE ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }})
            if (storage > 0){
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
}
module.exports = roleGofer;

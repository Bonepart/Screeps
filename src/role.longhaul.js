let pathing = require('pathing');
let helper = require('helper');

let roleLonghaul = {
    
    /** @param {Creep} creep **/
    run: function (creep) {

        if(creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.harvesting = true;
	    }

        if (creep.memory.harvesting){
            let destRoom = Game.rooms[creep.memory.assignedRoom];
        
            if (destRoom == undefined){
                let newRoom = new RoomPosition(2, 32, creep.memory.assignedRoom);
                creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                if (creep.room.name != creep.memory.assignedRoom){
                    let sources = destRoom.find(FIND_SOURCES_ACTIVE);
                    if (sources){
                        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }         
                } else {
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
                    searchTarget = pathing.findClosestSource(creep.pos)
                    if(creep.harvest(searchTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
        }
        else {
            let originRoom = Game.rooms[creep.memory.originRoom];
            if (originRoom.memory.importContainerID != undefined){
                let importContainer = Game.getObjectById(originRoom.memory.importContainerID);
                if (importContainer == undefined) { originRoom.memory.importContainerID = undefined }
                else {
                    let result = creep.transfer(importContainer, RESOURCE_ENERGY);
                    if(result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(importContainer, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else if (result == OK) { return }
                }
            }
            else {
            let targets = originRoom.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            });
            targets = targets.concat(originRoom.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_TOWER ) && 
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}}));

            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            }
        }
    }
}
module.exports = roleLonghaul;

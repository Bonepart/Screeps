let pathing = require('pathing');
let helper = require('helper');

let roleLonghaul = {
    
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.assignedRoom == null){
            if(creep.room.memory.exits[1] && creep.room.memory.exits[1].id == null){
                creep.memory.assignedRoom = creep.room.memory.exits[1].name;
                creep.room.memory.exits[1].id = creep.id;
            }
        }

        if(creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.harvesting = true;
	    }

        if (creep.memory.harvesting){
            let destRoom = Game.rooms[creep.memory.assignedRoom];
            if (destRoom == undefined){
                let newRoom = new RoomPosition(24, 45, creep.memory.assignedRoom);
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
            let importContainer = originRoom.find(FIND_FLAGS, { filter: (flag) => { return flag.name == "Import"}});
            if (importContainer.length > 0) {importContainer = importContainer[0].pos.lookFor(LOOK_STRUCTURES, { 
                filter: (struct) => { return struct.structureType == STRUCTURE_CONTAINER}})};
            if (importContainer.length > 0) {
                if(creep.transfer(importContainer[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(importContainer[0], {visualizePathStyle: {stroke: '#ffffff'}});
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
                targets = targets.concat(originRoom.find(FIND_STRUCTURES, {
                    filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER ) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}}));
                let parkingFlag = originRoom.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Parking"}});
                let buildables = originRoom.find(FIND_CONSTRUCTION_SITES);
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else if(buildables.length > 0) {
                    if(creep.build(buildables[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(buildables[0], {visualizePathStyle: {stroke: '#0000ff'}});
                    }
                } else if (parkingFlag.length > 0) {creep.moveTo(parkingFlag[0], {visualizePathStyle: {stroke: '#ffffff'}});}
            }
        }
    }
}
module.exports = roleLonghaul;

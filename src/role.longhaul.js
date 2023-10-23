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
                    if (source){
                        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }         
                } else {
                    let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (source){
                        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                }
            }
        }
        else {
            let originRoom = Game.rooms[creep.memory.originRoom];
            var targets = originRoom.find(FIND_STRUCTURES, {
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
            var parkingFlag = originRoom.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Parking"}});
            var buildables = originRoom.find(FIND_CONSTRUCTION_SITES);
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
module.exports = roleLonghaul;
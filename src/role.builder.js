let common = require('logic.common');
let helper = require('helper');

let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep, buildList) {
	    if(creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
            if (buildList.length > 0) {
                if(creep.build(buildList[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo({pos: buildList[0].pos, range: 3}, {visualizePathStyle: {stroke: '#0000aa'}});
                }
            }
            else {
                //When there are NO construction sites to be built
                let searchRoom = creep.memory.assignedRoom;
                if (searchRoom == undefined) { searchRoom = creep.room.name }

                let targets = Game.rooms[searchRoom].find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                targets = targets.concat(Game.rooms[searchRoom].find(FIND_STRUCTURES, {
                    filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE ) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}}
                ));
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else {
                    if (creep.room.name != creep.memory.assignedRoom) {
                        common.moveToAssignedRoom(creep);
                        return;
                    }
                }
            }
	    }
	    else {
            // When building = false, need to collect energy
            let energyStore = Game.rooms[creep.memory.assignedRoom].find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE ) && 
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
            );

            if (energyStore.length > 0){
                if (buildList.length == 0) { return }
                let result = creep.withdraw(energyStore[0], RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyStore[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    return;
                } else if (result == OK) { return }        
            }
            let searchRoom = Game.rooms[creep.memory.assignedRoom];
	        let source = searchRoom.find(FIND_SOURCES_ACTIVE);
            if (source.length > 0){
                if(creep.harvest(source[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
	    }
	}
};

module.exports = roleBuilder;

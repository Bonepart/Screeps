let processRenewal = require('process.renewal');
let pathing = require('pathing');
let common = require('common.logic');
let helper = require('helper');


let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //if(processRenewal.renew(creep)){ return };
	    if(creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
            let targets = [];
            for (let i in Game.rooms){
                targets = targets.concat(Game.rooms[i].find(FIND_CONSTRUCTION_SITES, { filter: (site) => { 
                    return (site.structureType == STRUCTURE_WALL || 
                            site.structureType == STRUCTURE_RAMPART ||
                            site.structureType == STRUCTURE_TOWER) &&
                            site.my}}
                ));
            }
            for (let i in Game.rooms){
                targets = targets.concat(Game.rooms[i].find(FIND_CONSTRUCTION_SITES, {filter: (site) => { 
                    return (site.structureType != STRUCTURE_WALL && 
                            site.structureType != STRUCTURE_RAMPART &&
                            site.structureType != STRUCTURE_TOWER) &&
                            site.my}}));
            }
            if(targets.length > 0) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#0000aa'}});
                }
            }else{
                let targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
	    }
	    else {
            //Not building, go back to assigned room
            if (creep.memory.assignedRoom) {
                if (creep.room.name != creep.memory.assignedRoom) {
                    common.moveToAssignedRoom(creep);
                    return;
                }
            }
            let energyStore = [];
            for (let i in Game.rooms){
                energyStore = energyStore.concat(Game.rooms[i].find(FIND_STRUCTURES, {
                    filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE ) && 
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
                ));
            }
            if (energyStore.length > 0){
                let result = creep.withdraw(energyStore[0], RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyStore[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    return;
                } else if (result == OK) { return }        
            }
	        let source = pathing.findClosestSource(creep.pos);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;

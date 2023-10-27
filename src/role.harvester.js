let processRenewal = require('process.renewal');
let helper = require('helper');
let pathing = require('pathing');

let roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.harvesting = true;
	    }

	    if(creep.memory.harvesting) {
            if(processRenewal.renew(creep)){ return };

            let searchTarget = pathing.findClosestSource(creep.pos)
            if(creep.harvest(searchTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }
            });
            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE ) && 
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}}));
            targets = targets.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER ) && 
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}}));
            let parkingFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Parking"}});
            let buildables = creep.room.find(FIND_CONSTRUCTION_SITES);
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
};

module.exports = roleHarvester;
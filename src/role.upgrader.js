let processRenewal = require('process.renewal');
let helper = require('helper');
let pathing = require('pathing');

let roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(processRenewal.renew(creep)){ return };
        if(creep.memory.upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            let container = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, { 
                filter: (struct) => {return (struct.structureType == STRUCTURE_CONTAINER || 
                                            struct.structureType == STRUCTURE_STORAGE) &&
                                            struct.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
            );
            if (container){
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                let source = pathing.findClosestSource(creep.pos);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleUpgrader;
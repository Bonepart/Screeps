var processRenewal = require('process.renewal');
var helper = require('helper');

var roleMaintenance = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(processRenewal.renew(creep)){ return };
        if(creep.memory.repairing && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.repairing && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.repairing = true;
	        creep.say('🚧 repair');
	    }

        if(creep.memory.repairing) {
            var targets = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.hits < structure.hitsMax }});
            var buildables = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (buildables.length > 0) {
                if (creep.build(buildables[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildables[0], {visualizePathStyle: {stroke: '#0000aa'}});
                }
            } else {
                targets = creep.room.find(FIND_STRUCTURES, {
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
        } else {
	        let source = helper.findClosestSource(creep.pos);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
    }
}
module.exports = roleMaintenance;
var processRenewal = require('process.renewal');
var helper = require('helper');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(processRenewal.renew(creep)){ return };
	    if(creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
            let defensiveSites = creep.room.find(FIND_CONSTRUCTION_SITES, { filter: (site) => { 
                return site.structureType == STRUCTURE_WALL || site.structureType == STRUCTURE_RAMPART}});
	        var targets = defensiveSites.concat(creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => { 
                return site.structureType != STRUCTURE_WALL && site.structureType != STRUCTURE_RAMPART}}));
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#0000aa'}});
                }
            }else{
                var targets = creep.room.find(FIND_STRUCTURES, {
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
	        let source = helper.findClosestSource(creep.pos);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;
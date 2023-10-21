var processRenewal = require('process.renewal');
var helper = require('helper');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if(processRenewal.renew(creep)){ return };
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 50
                    }
            });
            var parkingFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Parking"}});
            var defaultSpawn = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {return structure.structureType == STRUCTURE_SPAWN}
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (parkingFlag.length > 0) {creep.moveTo(parkingFlag[0], {visualizePathStyle: {stroke: '#ffffff'}});}
        }
	}
};

module.exports = roleHarvester;
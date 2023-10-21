var processRenewal = require('process.renewal');
var helper = require('helper');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if(processRenewal.renew(creep)){ return };
            let source = helper.findClosestSource(creep.pos);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }
            });
            var parkingFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Parking"}});
            var buildables = creep.room.find(FIND_CONSTRUCTION_SITES);
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
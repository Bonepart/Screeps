let processRenewal = require('process.renewal');
let pathing = require('logic.pathing');
let common = require('logic.common');
let helper = require('helper');

let roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, hasLooseEnergy) {
        if (creep.memory.assignedRoom) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }
        
	    if(creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.harvesting = true;
	    }

	    if(creep.memory.harvesting) {
            if(processRenewal.renew(creep)){ return };

            if (hasLooseEnergy && common.getLooseEnergy(creep)) { return }
            let searchTarget = pathing.findClosestSource(creep.pos)
            if(creep.harvest(searchTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            let targetSpawn = pathing.findClosestEnergyConsumer(creep.pos);
            if (targetSpawn){
                if(creep.transfer(targetSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSpawn, {visualizePathStyle: {stroke: '#ffffff'}});
                }
				return;
            }
			let buildables = creep.room.find(FIND_CONSTRUCTION_SITES);
			if(buildables.length > 0) {
                if(creep.build(buildables[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildables[0], {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }
        }
	}
};
module.exports = roleHarvester;
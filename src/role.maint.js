let processRenewal = require('process.renewal');
let common = require('common.logic');
let helper = require('helper');
let pathing = require('pathing');

let roleMaintenance = {

    /** @param {Creep} creep **/
    run: function(creep, pendingRepairs, offset) {
        if (creep.memory.assignedRoom) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }

        if(creep.memory.repairing && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.repairing = false;
            creep.memory.repairID = null
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.repairing && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.repairing = true;
	        creep.say('🚧 repair');
	    }

        if(creep.memory.repairing) {
            if (creep.memory.repairID == null){
                if(pendingRepairs.length > offset) { creep.memory.repairID = pendingRepairs[offset].id }
                else if (pendingRepairs.length > 0) { creep.memory.repairID = pendingRepairs[0].id }
            } 
            if (creep.memory.repairID != null) {
                let repairTarget = Game.getObjectById(creep.memory.repairID);
                if (repairTarget == null) { 
                    creep.memory.repairID = null;
                    console.log(`${creep.name} => Error, repairID = null`);
                    return;
                }
                if (repairTarget.hits == repairTarget.hitsMax) { creep.memory.repairID = null }
                else {
                    if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(repairTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                if (!Memory.roles.repairPersistance) { creep.memory.repairID = null }
            }
        } else {
            let energyStore = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE ) && 
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
            );
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
}
module.exports = roleMaintenance;
let processRenewal = require('process.renewal');
let common = require('logic.common');
let helper = require('helper');
let pathing = require('logic.pathing');

let roleMaintenance = {

    /** @param {Creep} creep **/
    run: function(creep, pendingRepairs) {
        if(processRenewal.renew(creep)){ return };

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

            if (creep.memory.repairID == null) { 
                if (creep.room.name != creep.memory.assignedRoom){ common.moveToAssignedRoom(creep); return }
                else { setRepairID(creep, pendingRepairs) }
            }
            if (creep.memory.repairID != null) {
                let repairTarget = Game.getObjectById(creep.memory.repairID);
                if (repairTarget == null) { 
                    creep.memory.repairID = null;
                    console.log(`${creep.name} => Error, repairID = null`);
                    return;
                }
                if (repairTarget.hits == repairTarget.hitsMax) { 
                    setRepairID(creep, pendingRepairs);
                    repairTarget = Game.getObjectById(creep.memory.repairID);
                    if (repairTarget.pos.roomName != creep.memory.assignedRoom) { creep.memory.repairID = null; return }
                }
                if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo({pos: repairTarget.pos, range: 3}, {reusePath: 10, visualizePathStyle: {stroke: '#ffffff'}});
                }
                if (!Memory.roles.repairPersistance) { creep.memory.repairID = null }
            }
        } else {
            if (checkDismantleList(creep)) { return }
            let energyStore = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE ) && 
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
            );
            if (energyStore.length > 0){
                let result = creep.withdraw(energyStore[0], RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyStore[0], {reusePath: 10, visualizePathStyle: {stroke: '#ffffff'}});
                    return;
                } else if (result == OK) { return }        
            }
	        let source = pathing.findClosestSource(creep.pos);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {reusePath: 10, visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
    }
}
module.exports = roleMaintenance;

/** @param {Creep} creep **/
function setRepairID(creep, pendingRepairs){
    let nextRepair = pendingRepairs.next();
    if (!nextRepair.done) { 
        creep.memory.repairID = nextRepair.value.id;
        //console.log(`${creep.memory.assignedRoom}-${creep.name.padEnd(ROLE_MAINTENANCE.length + 3)} repairing ${nextRepair.value.id}`);
    }
}

/** @param {Creep} creep **/
function checkDismantleList(creep){
    if (Memory.dismantleList != undefined && Memory.dismantleList.length > 0) {
        let dismantleTarget = Game.getObjectById(Memory.dismantleList[0]);
        if (dismantleTarget == null) { Memory.dismantleList.splice(0, 1); return false }
        if (dismantleTarget.pos.roomName != creep.room.name) { return false }
        let result = creep.dismantle(dismantleTarget);
        switch(result){
            case ERR_NOT_IN_RANGE:
                creep.moveTo(dismantleTarget, {visualizePathStyle: {stroke: '#ffffff'}});
            case OK:
                return true;
            default:
                console.log(`${creep.name} dismantle result: ${result}`);
        }
    }
    return false;
}
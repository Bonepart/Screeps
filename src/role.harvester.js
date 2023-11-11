let processRenewal = require('process.renewal');
let pathing = require('logic.pathing');
let common = require('logic.common');
let helper = require('helper');

let roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, energyList, hasLooseEnergy) {
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
            if (depositInBucket(creep, energyList)) { return }
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

/** @param {Creep} creep **/
function setDepositID(creep, energyList){
    let nextBucket = energyList.next();
    if (!nextBucket.done) { 
        creep.memory.depositID = nextBucket.value.id;
        //console.log(`${creep.memory.assignedRoom}-${creep.name.padEnd(ROLE_HARVESTER.length + 3)} depositing in ${nextBucket.value.id}`);
    }
}

/** @param {Creep} creep **/
function depositInBucket(creep, energyList){
    if (creep.memory.depositID == undefined || creep.memory.depositID == null){ setDepositID(creep, energyList) } 
    let depositTarget = Game.getObjectById(creep.memory.depositID);
    if (depositTarget == null) { 
        creep.memory.depositID = null;
        console.log(`${creep.name} => Error, depositID = null`);
        return false;
    }
    else {
        if (depositTarget.store.getFreeCapacity(RESOURCE_ENERGY) == 0) { 
            creep.memory.depositID = null;
            setDepositID(creep, energyList);
            if (creep.memory.depositID == null) { return false }
            depositTarget = Game.getObjectById(creep.memory.depositID);
        }
        let result = creep.transfer(depositTarget, RESOURCE_ENERGY);
        switch (result){
            case OK:
                return true;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(depositTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                return true;
            default:
                return false;
        }
    }
}
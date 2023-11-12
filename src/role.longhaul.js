let pathing = require('logic.pathing');
let common = require('logic.common');
let helper = require('helper');

let roleLonghaul = {
    
    /** @param {Creep} creep **/
    run: function (creep) {

        if(creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
	        creep.memory.harvesting = true;
	    }

        if (creep.memory.harvesting){
            if (creep.room.name != creep.memory.assignedRoom){
                common.moveToAssignedRoom(creep);
                return;
            } else {
                if (common.getLooseEnergy(creep)) { return }
                let source = pathing.findClosestSource(creep.pos);
                if (source){
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
        }
        else {
            let depositTarget = getDepositTarget(creep);
            if(depositTarget) {
                let result = creep.transfer(depositTarget, RESOURCE_ENERGY);
                switch(result){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(depositTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                    case OK:
                    case ERR_FULL:
                        break;
                    default:
                        console.log(`${creep.name} transfer result: ${result}`);
                }
            }
        }
    }
}
module.exports = roleLonghaul;

/** @param {Creep} creep **/
function getDepositTarget(creep){
    let depositTarget = Game.getObjectById(creep.memory.depositID);
    if (depositTarget == null) { 
        let containerList = [];
        for (let i in Memory.importContainers){
            containerList.push(Game.getObjectById(Memory.importContainers[i]));
        }
        let roomDistance = Infinity;
        for (let container of containerList){
            let distance = Game.map.getRoomLinearDistance(creep.memory.assignedRoom, container.room.name);
            if (distance < roomDistance) {
                depositTarget = container;
                roomDistance = distance;
            }
        }
        creep.memory.depositID = depositTarget.id;
    }
    return depositTarget;
}

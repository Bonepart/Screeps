let processRenewal = require('process.renewal');
let common = require('logic.common');
let helper = require('helper');
let pathing = require('logic.pathing');

let roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.assignedRoom) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }

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
            if (Memory.rooms[creep.room.name].upgradeContainer){
                let container = Game.getObjectById(Memory.rooms[creep.room.name].upgradeContainer);
                if (container != null && container.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
                    let result = creep.withdraw(container, RESOURCE_ENERGY);
                    switch (result){
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                        case OK:
                            return;
                        default:
                            console.log(`${creep.name} withdraw from Upgrade Container failed (${result})`);
                            break;
                    }
                }
            }
            let storage = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, { 
                filter: (struct) => {return struct.structureType == STRUCTURE_STORAGE &&
                                            struct.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
            );
            if (storage){
                if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
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
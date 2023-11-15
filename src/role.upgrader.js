let processRenewal = require('process.renewal');
let common = require('logic.common');
let helper = require('helper');
let pathing = require('logic.pathing');

let roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
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
            if(creep.upgradeController(Game.rooms[creep.memory.assignedRoom].controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.rooms[creep.memory.assignedRoom].controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            if (Memory.rooms[creep.memory.assignedRoom].upgradeContainer){
                let container = Game.getObjectById(Memory.rooms[creep.memory.assignedRoom].upgradeContainer);
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
            let storage = Game.rooms[creep.memory.assignedRoom].find(FIND_STRUCTURES, { 
                filter: (struct) => {return struct.structureType == STRUCTURE_STORAGE &&
                                            struct.store.getUsedCapacity(RESOURCE_ENERGY) > 0}}
            );
            if (storage.length > 0){
                if(creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                if (creep.room.name != creep.memory.assignedRoom) {
                    common.moveToAssignedRoom(creep);
                    return;
                }
                let source = pathing.findClosestSource(creep.pos);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleUpgrader;
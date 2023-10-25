let processRenewal = require('process.renewal');
let helper = require('helper');
let pathing = require('pathing');

let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //if(processRenewal.renew(creep)){ return };
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
	        let targets = defensiveSites.concat(creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => { 
                return site.structureType != STRUCTURE_WALL && site.structureType != STRUCTURE_RAMPART}}));
            if(targets.length > 0) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#0000aa'}});
                }
            }else{
                let targets = creep.room.find(FIND_STRUCTURES, {
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
            if (creep.room.memory.importContainerID != undefined){
                let importContainer = Game.getObjectById(creep.room.memory.importContainerID);
                if (importContainer == undefined) { creep.room.memory.importContainerID = undefined }
                else {
                    if (importContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
                        let result = creep.withdraw(importContainer, RESOURCE_ENERGY);
                        if(result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(importContainer, {visualizePathStyle: {stroke: '#ffffff'}});
                        } else if (result == OK) { return }
                    }
                }
            }
	        let source = pathing.findClosestSource(creep.pos);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;
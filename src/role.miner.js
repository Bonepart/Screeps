let helper = require('helper');

let roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.mineral == undefined) { init(creep) }
        let container = Game.getObjectById(creep.memory.containerID);
        if (container.store.getFreeCapacity(creep.memory.mineral.type) == 0) { return }

        if(creep.memory.mining && creep.store.getFreeCapacity(creep.memory.mineral.type) === 0) {
            creep.memory.mining = false;
	    }
	    if(!creep.memory.mining && creep.store.getUsedCapacity(creep.memory.mineral.type) === 0) {
	        creep.memory.mining = true;
	    }

        if (creep.memory.mining){
            let mineral = Game.getObjectById(creep.memory.mineral.id);
            let result = creep.harvest(mineral);
            switch (result){
                case OK:
                case ERR_TIRED:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(mineral, {visualizePathStyle: {stroke: '#ffaa00'}});
                    break;
                default:
                    console.log(`${creep.name} harvest result: ${result}`);
            }
        }
        else {
            
            let result = creep.transfer(container, creep.memory.mineral.type);
            switch (result){
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
                    break;
                default:
                    console.log(`${creep.name} transfer result: ${result}`);
            }
        }
    }
};
module.exports = roleMiner;

/** @param {Creep} creep **/
function init(creep){
    let mineral = creep.room.find(FIND_MINERALS);
    let depositContainer = mineral[0].pos.findInRange(FIND_STRUCTURES, 10, {filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER}})
    if (depositContainer.length == 0) { console.log(`${creep.name} init failed: No Container found for depositing`); return }
    creep.memory.mining = false;
    creep.memory.mineral = {};
    creep.memory.mineral.id = mineral[0].id;
    creep.memory.mineral.type = mineral[0].mineralType;
    creep.memory.containerID = depositContainer[0].id;
}
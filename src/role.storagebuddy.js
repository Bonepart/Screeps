let consoleCommand = require('console');
let common = require('logic.common');
let helper = require('helper');

let roleStorageBuddy = {

    /** @param {Creep} creep **/
    run: function(creep){
        if (creep.memory.assignedRoom) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }

        let myStorage = getStorage(creep);
        if (myStorage == null) {
            console.log(`${creep.name} has no storage to be buddies with`);
            creep.memory.role = ZOMBIE;
            return;
        }
        let myLink = getLink(creep, myStorage);
        if (myLink == null) { console.log(`${creep.name} found no Link`); return }

        if ((helper.checkDroppedResources(creep.memory.assignedRoom) || helper.checkRuinsX(creep.memory.assignedRoom)) && creep.store.getFreeCapacity() > 0){
            if (common.getLooseResources(creep)) { return }
        }

        if (creep.store.getUsedCapacity() > 0) {
            for (let resource in creep.store){
                let result = creep.transfer(myStorage, resource);
                switch(result){
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(myStorage, {visualizePathStyle: {stroke: '#ffffff'}});
                        break;
                    default:
                        console.log(`${creep.name} storage transfer result: ${result}`);
                }
            }
        }
        else {
            if(creep.withdraw(myLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(myLink, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
}
module.exports = roleStorageBuddy;

function getStorage(creep){
    let storage = Game.getObjectById(creep.memory.storageID);
    if (storage == null) { 
        storage = Game.rooms[creep.memory.assignedRoom].find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE}})[0];
        if(!storage){ return null }
        creep.memory.storageID = storage.id;
    }
    return storage;
}

function getLink(creep, structureStorage){
    let myLink = Game.getObjectById(creep.memory.linkID);
    if (myLink == null){
        myLink = structureStorage.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_LINK}});
        if (myLink == null) { return null }
        creep.memory.linkID = myLink.id;
    }
    return myLink;
}
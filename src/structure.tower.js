
let structureTower = {
    
    /** @param {StructureTower} thisTower **/
    run: function(thisTower){
        if (thisTower.store.getUsedCapacity(RESOURCE_ENERGY) == 0){ return }

        let numHostiles = thisTower.room.find(FIND_HOSTILE_CREEPS).length;
        if (numHostiles > 0) { if (attackHostile(thisTower)) { return } }

        let woundedList = thisTower.room.find(FIND_MY_CREEPS, { filter: (creep) => {return creep.hits < creep.hitsMax}});
        if (woundedList.length > 0) { if (healWounded(thisTower, woundedList)) { return } }

        if (thisTower.store.getUsedCapacity(RESOURCE_ENERGY) > 800) { repairStructures(thisTower) }
    }
}
module.exports = structureTower;

/** @param {StructureTower} thisTower **/
function attackHostile(thisTower){
    let target = thisTower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    let result = thisTower.attack(target);
    switch (result){
        case OK:
            console.log(`Tower ${thisTower.id} attacked ${target.name} (${target.hits}/${target.hitsMax})`);
            return true;
        case ERR_NOT_ENOUGH_ENERGY:
            console.log(`Tower ${thisTower.id} does not have enough energy to attack!`);
            break;
        case ERR_INVALID_TARGET:
            console.log(`Tower ${thisTower.id} was passed an Invalid Target: ${target.id}`);
            break;
        default:
            console.log(`Tower ${thisTower.id}: Error ${result}`);
    }
    return false;
}

/** @param {StructureTower} thisTower **/
function healWounded(thisTower, woundedList){
    console.log('Tower trying to heal');
    let result = thisTower.heal(woundedList[0]);
    switch (result){
        case OK:
            console.log(`Tower ${thisTower.id} healed ${woundedList[0].name} (${woundedList[0].hits}/${woundedList[0].hitsMax})`);
            return true;
        case ERR_NOT_ENOUGH_ENERGY:
            console.log(`Tower ${thisTower.id} does not have enough energy to heal`);
            break;
        case ERR_INVALID_TARGET:
            console.log(`Tower ${thisTower.id} was passed an Invalid Target: ${woundedList[0].id}`);
            break;
        default:
            console.log(`Tower ${thisTower.id}: Error ${result}`);
    }
    return false;
}

/** @param {StructureTower} thisTower **/
function repairStructures (thisTower) {
    let pendingRepairs = _.sortBy(thisTower.pos.findInRange(FIND_STRUCTURES, 15, { 
        filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_ROAD}}), (struct) => struct.hits);

    if (pendingRepairs.length == 0) { return false }
    let result = thisTower.repair(pendingRepairs[0]);
    switch (result){
        case OK:
            //console.log(`Tower ${thisTower.id} repaired ${pendingRepairs[0].id} (${pendingRepairs[0].hits}/${pendingRepairs[0].hitsMax})`);
            return true;
        case ERR_NOT_ENOUGH_ENERGY:
            console.log(`Tower ${thisTower.id} does not have enough energy to do repairs`);
            break;
        case ERR_INVALID_TARGET:
            console.log(`Tower ${thisTower.id} was passed an Invalid Target: ${pendingRepairs[0].id}`);
            break;
        default:
            console.log(`Tower ${thisTower.id}: Error ${result}`);
    }
    return false;
}    


var structureTower = {
    
    /** @param {StructureTower} thisTower **/
    run: function(thisTower){
        if (thisTower.store.getUsedCapacity(RESOURCE_ENERGY) == 0){ return }

        let numHostiles = thisTower.room.find(FIND_HOSTILE_CREEPS).length;
        if(numHostiles > 0){
            attackHostile(thisTower);
            return;
        }
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
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            console.log(`Tower ${thisTower.id} does not have enough energy to attack!`);
            break;
        case ERR_INVALID_TARGET:
            console.log(`Tower ${thisTower.id} was passed an Invalid Target: ${target.id}`);
            break;
        default:
            console.log(`Tower ${thisTower.id}: Error ${result}`);
    }
}
let processRenewal = {

    /** @param {Creep} creep **/
    renew: function(creep){
        
        if (creep.memory.tier >= Memory.rooms[creep.room.name].spawnTier && creep.ticksToLive < 200 && !creep.memory.renewing){
            creep.memory.renewing = true;
            //console.log(`Creep ${creep.name} (T${creep.memory.tier}) returning to spawn to renew (${creep.ticksToLive})`);
        } else if (creep.memory.renewing && creep.ticksToLive > 1300){
            creep.memory.renewing = false;
            //console.log(`Creep ${creep.name} renewed! (${creep.ticksToLive})`);
        }
        if (creep.memory.renewing){
            let spawner = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN && structure.isActive() && structure.spawning == null);
                }
            });
            if (spawner){
                let result = spawner.renewCreep(creep);
                switch(result){
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(spawner, {visualizePathStyle: {stroke: '#000000'}});
                        break;
                    case ERR_NOT_ENOUGH_ENERGY:
                        creep.memory.renewing = false;
                        break;
                    default:
                        console.log(`renewCreep Failed: ${creep.name}/${spawner.name}  ${result}`);
                }
            } else { creep.memory.renewing = false }
        }
        return creep.memory.renewing;
    }
}
module.exports = processRenewal;

var processRenewal = {

    /** @param {Creep} creep **/
    renew: function(creep){
        
        if (creep.memory.tier > 1 && creep.ticksToLive < 100 && !creep.memory.renewing){
            creep.memory.renewing = true;
            console.log(`Creep ${creep.name} returning to spawn to renew (${creep.ticksToLive})`);
        } else if (creep.memory.renewing && creep.ticksToLive > 1200){
            creep.memory.renewing = false;
            console.log(`Creep ${creep.name} renewed! (${creep.ticksToLive})`);
        }
        if (creep.memory.renewing){
            let spawner = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN && structure.isActive() && structure.spawning == null);
                }
            });
            if (spawner.length > 0){
                let result = spawner[0].renewCreep(creep);
                switch(result){
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(spawner[0], {visualizePathStyle: {stroke: '#000000'}});
                        break;
                    case ERR_NOT_ENOUGH_ENERGY:
                        creep.memory.renewing = false;
                        break;
                    default:
                        console.log(`renewCreep Failed: ${creep.name}  ${result}`);
                }
            }
        }
        return creep.memory.renewing;
    }
}
module.exports = processRenewal;
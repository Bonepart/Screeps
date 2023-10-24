
let roleZombie = {

    /** @param {Creep} creep */
    run: function(creep){
        let spawns = creep.room.find(FIND_MY_SPAWNS);
        if (spawns.length > 0){
            if (spawns[0].recycleCreep(creep) == ERR_NOT_IN_RANGE){
                creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
}
module.exports = roleZombie;
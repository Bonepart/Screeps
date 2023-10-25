
let roleZombie = {

    /** @param {Creep} creep */
    run: function(creep){
        let spawner = null;
        for (let i in Game.spawns){
            spawner = Game.spawns[i];
        }
        if (spawner.recycleCreep(creep) == ERR_NOT_IN_RANGE){
            creep.moveTo(spawner, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
}
module.exports = roleZombie;
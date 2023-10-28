
let roleZombie = {

    /** @param {Creep} creep */
    run: function(creep){
        let spawner = Game.spawns['Spawn1'];
        if (spawner.recycleCreep(creep) == ERR_NOT_IN_RANGE){
            creep.moveTo(spawner, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
}
module.exports = roleZombie;
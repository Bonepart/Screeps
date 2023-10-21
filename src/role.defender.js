var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep){
        var dFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defenders"}});
        var targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (hostile) => {
            return hostile.owner.username != "Source Keeper";
        }});
        //console.log(`dFlag   = ${dFlag}`);
        //console.log(`targets = ${targets}`);
        if (targets.length > 0){
            creep.memory.hostile = targets[0].owner;
            if(creep.attack(targets[0] == ERR_NOT_IN_RANGE)){
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if (dFlag.length > 0) {creep.moveTo(dFlag[0], {visualizePathStyle: {stroke: '#ffffff'}})};
    }
}
module.exports = roleDefender;
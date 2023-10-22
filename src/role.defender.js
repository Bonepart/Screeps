var processRenewal = require('process.renewal');

var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep){
        if(processRenewal.renew(creep)){ return };
        var dFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defenders"}});
        var targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (hostile) => {
            return hostile.owner.username != "Source Keeper";
        }});
        console.log(`${creep.name} sees ${targets.length} hostiles`);
        if (targets.length > 0){
            if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if (dFlag.length > 0) {creep.moveTo(dFlag[0], {visualizePathStyle: {stroke: '#ffffff'}})};
    }
}
module.exports = roleDefender;
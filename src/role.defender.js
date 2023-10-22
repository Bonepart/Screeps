var processRenewal = require('process.renewal');
var helper = require('helper');
var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep){
        if(processRenewal.renew(creep)){ return };
        let dFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defenders"}});
        let searchFromPos = creep.pos;
        if (dFlag.length > 0) { searchFromPos = dFlag[0].pos }
        let rampart = searchFromPos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (struct) => {return struct.structureType == STRUCTURE_RAMPART}});
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (target){
            let result = creep.attack(target);
            switch(result){
                case OK:
                    console.log(`${creep.name} attacked ${target.name}! (${target.hits}/${target.hitsMax})`);
                    break;
                case ERR_NOT_IN_RANGE:
                    break;
                default:
                    console.log(`${creep.name} tried to attck ${target.name}, got error ${result}`);
            }
        } 
        if (rampart) {creep.moveTo(rampart, {visualizePathStyle: {stroke: '#ffffff'}})};
    }
}
module.exports = roleDefender;
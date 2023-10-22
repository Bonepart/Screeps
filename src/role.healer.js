var processRenewal = require('process.renewal');
var helper = require('helper');
var pathing = require('pathing');

var roleHealer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if(processRenewal.renew(creep)){ return };

        let creepInNeed = creep.pos.findClosestByPath(LOOK_CREEPS, { 
            filter: (creep) => {return creep.hits < creep.hitsMax}});
        if (creepInNeed){
            if (creep.heal(creepInNeed) == ERR_NOT_IN_RANGE){
                creep.moveTo(creepInNeed, {visualizePathStyle: {stroke: '#000000'}});
            }
        }
    }
}
module.exports = roleHealer;
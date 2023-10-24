let processRenewal = require('process.renewal');
let helper = require('helper');
let pathing = require('pathing');

let roleHealer = {

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
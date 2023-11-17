let helper = require('helper');

let roleHealer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        let creepInNeed = creep.pos.findClosestByPath(LOOK_CREEPS, { filter: (findCreep) => {return findCreep.hits < findCreep.hitsMax && creep.room.name == findCreep.room.name}});
        if (creepInNeed){
            creep.rangedHeal(creepInNeed);
            let result = creep.heal(creepInNeed);
            switch(result) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(creepInNeed, {visualizePathStyle: {stroke: '#000000'}});
                case OK:
                    return;
                default:
                    console.log(`${creep.name} tried to heal ${creepInNeed.name} but failed (${result})`);
            }
        }
        else {
            injuredList = _.filter(Game.creeps, (filterCreep) => filterCreep.hits < filterCreep.hitsMax);
            if (injuredList.length > 0){
                creep.rangedHeal(injuredList[0]);
                let result = creep.heal(injuredList[0]);
                switch(result) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(injuredList[0], {visualizePathStyle: {stroke: '#000000'}});
                    case OK:
                        return;
                    default:
                        console.log(`${creep.name} tried to heal ${injuredList[0].name} but failed (${result})`);
                }
            }
        }
        creep.memory.role = ZOMBIE;
    }
}
module.exports = roleHealer;
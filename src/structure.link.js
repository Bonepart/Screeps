let helper = require('helper');

let structureLink = {

/** @param {StructureLink} fromLink **/
    run: function (fromLink){
        for (let i in fromLink.room.memory.links) {
            if (fromLink.id == fromLink.room.memory.links[i].from) {
                let toLink = Game.getObjectById(fromLink.room.memory.links[i].to);
                if (fromLink.store.getUsedCapacity(RESOURCE_ENERGY) < 100) { return }
                if (fromLink.cooldown == 0 && fromLink.store.getUsedCapacity(RESOURCE_ENERGY) <= toLink.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    let result = fromLink.transferEnergy(toLink);
                    //console.log(`Link to Link Transfer: ${result}`);
                }
                return;
            }
        }
    }
}
module.exports = structureLink;
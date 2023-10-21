var helper = require('helper');

//Defensive Functions
var processDefense = {
    checkForKeeperLair: function(roomName){
        let room = Game.rooms[roomName];
        if (!Memory.keeperLair){
            let keeperLair = room.find(FIND_HOSTILE_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_KEEPER_LAIR}});
            if (keeperLair.length > 0){
                Memory.keeperLair = {sourceID: '', threatActive: false}
                let sources = room.find(FIND_SOURCES);
                let closestRange = Infinity;
                for( let i in sources) {
                    let range = sources[i].pos.getRangeTo(keeperLair[0].pos);
                    if (range < closestRange){
                        Memory.keeperLair.sourceID = sources[i].id;
                        closestRange = range;
                    }
                }
            }
        }

        let hostiles = room.find(FIND_HOSTILE_CREEPS);
        let keeperCreeperFound = false;
        if (hostiles.length > 0){
            for (let i in hostiles){
                switch(hostiles[i].owner.username){
                    case "Source Keeper":
                        keeperCreeperFound = true;
                        break;
                    default:
                        console.log(`Hostile Found!!  Owned by ${hostiles[i].owner.username}`);
                }
                
            }
        }
        Memory.keeperLair.threatActive = keeperCreeperFound;
    }
}
module.exports = processDefense;
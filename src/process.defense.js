let helper = require('helper');

//Defensive Functions
let processDefense = {
    scanForHostiles: function(roomName) {
        let hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0){
            if (Memory.roles.limit[ARMY_DEFENDER] < hostiles.length) {
                Memory.roles.limit[ARMY_DEFENDER] = hostiles.length;
                console.log(`Set Defender Limit to ${Memory.roles.limit[ARMY_DEFENDER]} to counter hostile creeps`);
            }
        }
    },

    checkForKeeperLair: function(roomName){
        if (Memory.keeperLair == -1) { return };
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
            } else {Memory.keeperLair = -1}
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
let bodytype = require('constants.bodytype');


let spawningLogic = {

    spawnViking: function (vikingCount) {
        newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
        body = bodytype.viking[2];
        for (let i in Game.spawns){
            if (vikingCount >= Memory.roles.limit[ARMY_VIKING]) { return }
            if (!helper.isAvailable(i)) { continue }
            let result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            while (result === -3){
                Memory.roles.index[ARMY_VIKING]++;
                newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
                result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            }
            if (result == OK) {
                Game.spawns[i].spawnCreep(body, newName, { memory: {role: ARMY_VIKING, originRoom: Game.spawns[i].room.name}});
                Memory.roles.index[ARMY_VIKING]++;
                vikingCount++;
                console.log(`${i}: Spawning ${newName}`);
            }
        }
    }

}
module.exports = spawningLogic;
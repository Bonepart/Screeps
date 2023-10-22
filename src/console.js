var consoleCommands = {
    displayTickLimit: function() {
        console.log(`tickLimit = ${Game.cpu.tickLimit}`);
    },

    botCount: function() {
        let roleList = [];
        for (let i in Game.creeps){
            if(!roleList[Game.creeps[i].memory.role]){ roleList[Game.creeps[i].memory.role] = {role: Game.creeps[i].memory.role, count: 1}}
            else { roleList[Game.creeps[i].memory.role].count++}
        }
        for (let role in roleList){
            console.log(`Role: ${roleList[role].role}`);
            console.log(`-- ${roleList[role].count}`);
        }
    },

    listCreeps: function() {
        for (let i in Game.creeps){
            console.log(`${Game.creeps[i].name}`);
            console.log(`--Body Size: ${Game.creeps[i].body.length}`);
        }
    },

    toggleRP: function() {
        if (Memory.repairPersistance) { Memory.repairPersistance = false }
        else { Memory.repairPersistance = true }
    },

    zombie: function(creepName) {
        Game.creeps[creepName].memory.role = "zombie";
    }
}
module.exports = consoleCommands;
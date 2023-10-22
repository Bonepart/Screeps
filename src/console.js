var construction = require('construction');
var helper = require('helper');

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

    healthCheck: function() {
        for (let creep in Game.creeps){
            console.log(`${creep}:\t\t${Game.creeps[creep].hits}/${Game.creeps[creep].hitsMax}`);
        }
    },

    changeMax: function(role, newMax) {
        switch(role){
            case 'harvester':
                Memory.maxHarvesters = newMax;
                return `maxHarvesters = ${Memory.maxHarvesters}`;
            case 'builder':
                Memory.maxBuilders = newMax;
                return `maxBuilders = ${Memory.maxBuilders}`;
            case 'upgrader':
                Memory.maxUpgraders = newMax;
                return `maxUpgraders = ${Memory.maxUpgraders}`;
            case 'maintenance':
            case 'maint':
                Memory.maxMaint = newMax;
                return `maxMaint = ${Memory.maxMaint}`;
            case 'defender':
                Memory.maxDefenders = newMax;
                return `maxDefenders = ${Memory.maxDefenders}`;
            case 'ranged':
                Memory.maxRanged = newMax;
                return `maxRanged = ${Memory.maxRanged}`;
            case 'healer':
                Memory.maxHealers = newMax;
                return `maxHealers = ${Memory.maxHealers}`;
        }
    },

    buildRoad: function(flagStart, flagEnd){
        return construction.buildRoad(Game.flags[flagStart].pos, Game.flags[flagEnd].pos);
    },

    zombie: function(creepName) {
        Game.creeps[creepName].memory.role = "zombie";
    }    
}
module.exports = consoleCommands;
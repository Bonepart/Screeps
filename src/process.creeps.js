module.exports = {
    checkForSpawn: function(StructureSpawn){
        if (StructureSpawn.energy >= 250){
            var checkHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var checkUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var checkBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        //    console.log('H: ', checkHarvesters.length, ', U: ', checkUpgraders.length, ', B: ', checkBuilders.length);
            if (checkHarvesters.length == 0){
                let newName = StructureSpawn.createCreep([WORK, CARRY, MOVE, MOVE], undefined, {role: 'harvester'});
                console.log('Spawning new Harvester: ', newName);
            }else if(checkUpgraders.length == 0){
                let newName = StructureSpawn.createCreep([WORK, CARRY, MOVE, MOVE], undefined, {role: 'upgrader'});
                console.log('Spawning new Upgrader: ', newName);
            }else if(checkBuilders.length == 0){
                let newName = StructureSpawn.createCreep([WORK, CARRY, MOVE, MOVE], undefined, {role: 'builder'});
                console.log('Spawning new Builder: ', newName);
            }
        }
    },
    clearMemory: function(){
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
};
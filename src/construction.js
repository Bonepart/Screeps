var construction = {
    buildSourceRoads: function (spawnIndex) {
        var numConstructionSites = Game.spawns[spawnIndex].room.find(FIND_CONSTRUCTION_SITES).length;
        for (let i in Memory.sourceList){
            switch(Memory.sourceList[i].roadStatus){
                case 0:
                    if (numConstructionSites == 0){
                        let source = Game.getObjectById(Memory.sourceList[i].id);
                        let roadPath = calcPath(spawnIndex, {pos: source.pos});
                        for (let i = 0; i < roadPath.ops; i++){
                            let result = Game.spawns[spawnIndex].room.createConstructionSite(roadPath.path[i], STRUCTURE_ROAD);
                            console.log(`Creating Road Site at ${roadPath.path[i]}`);
                            console.log(`Response: ${result}`);
                        }
                        Memory.sourceList[i].roadStatus = 1;
                    }
                    return;
                case 1:
                    if (numConstructionSites > 0){ return }
                    Memory.sourceList[i].roadStatus = 2;
                    break;
            }
        }
    }
}
module.exports = construction;

function calcPath(spawnIndex, goal){
    return PathFinder.search(Game.spawns[spawnIndex].pos, goal);
}
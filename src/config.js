var config = {
    memory: function(){
        if(!Memory.maxHarvesters){
            Memory.maxHarvesters = 2;
        }
        if(!Memory.maxBuilders){
            Memory.maxBuilders = 0;
        }
        if(!Memory.maxUpgraders){
            Memory.maxUpgraders = 1;
        }
        if(!Memory.maxDefenders){
            Memory.maxDefenders = 1;
        }

        if(!Memory.harvesterIndex){
            Memory.harvesterIndex = 1;
        }
        if(!Memory.builderIndex){
            Memory.builderIndex = 1;
        }
        if(!Memory.upgraderIndex){
            Memory.upgraderIndex = 1;
        }
        if(!Memory.defenderIndex){
            Memory.defenderIndex = 1;
        }
    },
    sourceData: function(){
        let sData = {}
        var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
        for (let source in sources){
            let newData = {};
            newData.id = sources[source].id;
            newData.openSpaces = openSpaces(sources[source].room, sources[source].pos);
            //newData.harvesterList = [];

            sData[sources[source].id] = newData;
        }
        return sData;
    }
};
module.exports = config;

function openSpaces(room, position){
    let count = 0;
    let terrain = Game.map.getRoomTerrain(room.name);
    if (terrain.get(position.x, position.y-1) == 0){ count++ };
    if (terrain.get(position.x+1, position.y-1) == 0){ count++ };
    if (terrain.get(position.x+1, position.y) == 0){ count++ };
    if (terrain.get(position.x+1, position.y+1) == 0){ count++ };
    if (terrain.get(position.x, position.y+1) == 0){ count++ };
    if (terrain.get(position.x-1, position.y+1) == 0){ count++ };
    if (terrain.get(position.x-1, position.y) == 0){ count++ };
    if (terrain.get(position.x-1, position.y-1) == 0){ count++ };
    return count;
}
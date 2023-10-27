let explorer = require('process.exploration');

let processRooms = {

    sourceData: function(roomName){
        let thisRoom = Game.rooms[roomName];
        if (thisRoom.memory.sourceList === undefined){
            console.log(`Building sourceList for ${roomName}`);
            let sData = [];
            let sources = thisRoom.find(FIND_SOURCES);
            for (let source in sources){
                let newData = {};
                newData.id = sources[source].id;
                newData.openSpaces = openSpaces(sources[source].room, sources[source].pos);
                newData.roadStatus = 0;
                sData.push(newData);
            }
            thisRoom.memory.sourceList = sData;
        }
    },

    checkRoomState: function(roomName){
        let thisRoom = Game.rooms[roomName];
        if (thisRoom.controller === undefined){thisRoom.memory.roomState = ROOM_NO_CONTROLLER}
        else if (thisRoom.controller.owner == undefined) { 
            if (thisRoom.controller.reservation != undefined){
                if (thisRoom.controller.reservation.username == ME) {
                    if (thisRoom.memory.roomState = ROOM_NEUTRAL) {explorer.checkExits(roomName, true)}
                    thisRoom.memory.roomState = ROOM_RESERVED;
                }
                else {thisRoom.memory.roomState = ROOM_HOSTILE_RESERVED}
            }
            else {thisRoom.memory.roomState = ROOM_NEUTRAL}
        }
        else if (thisRoom.controller.my) { 
            if (thisRoom.controller.safeMode > 0) { thisRoom.memory.roomState = ROOM_OWNED_SAFE}
            else {thisRoom.memory.roomState = ROOM_OWNED}
        }
        else if (thisRoom.controller.owner.username != ME) { 
            if (thisRoom.controller.safeMode > 0) { thisRoom.memory.roomState = ROOM_HOSTILE_SAFE}
            else {thisRoom.memory.roomState = ROOM_HOSTILE}
        }
    }

}
module.exports = processRooms;

function openSpaces(room, position){
    let count = 0;
    let data = [];
    let terrain = Game.map.getRoomTerrain(room.name);
    if (terrain.get(position.x, position.y-1) == 0){ 
        count++;
        data.push({x: position.x, y: position.y});
    };
    if (terrain.get(position.x+1, position.y-1) == 0){ 
        count++;
        data.push({x: position.x+1, y: position.y-1});
    };
    if (terrain.get(position.x+1, position.y) == 0){ 
        count++;
        data.push({x: position.x+1, y: position.y});
    };
    if (terrain.get(position.x+1, position.y+1) == 0){ 
        count++;
        data.push({x: position.x+1, y: position.y+1});
    };
    if (terrain.get(position.x, position.y+1) == 0){ 
        count++;
        data.push({x: position.x, y: position.y+1});
    };
    if (terrain.get(position.x-1, position.y+1) == 0){ 
        count++;
        data.push({x: position.x-1, y: position.y+1});
    };
    if (terrain.get(position.x-1, position.y) == 0){ 
        count++;
        data.push({x: position.x-1, y: position.y});
    };
    if (terrain.get(position.x-1, position.y-1) == 0){ 
        count++;
        data.push({x: position.x-1, y: position.y-1});
    };
    data.unshift(count);
    return data;
}

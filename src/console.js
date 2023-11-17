let construction = require('construction');
let constants = require('constants');
let helper = require('helper');

let consoleCommands = {
    displayTickLimit: function() {
        return `tickLimit = ${Game.cpu.tickLimit}`;
    },

    assignRoomToCreep: function(creepName, roomName){
        let creep = Game.creeps[creepName];
        if (creep === undefined) { return `${creepName} is not a valid Creep` };
        creep.memory.assignedRoom = roomName;    
        return `${creepName} is now assigned to ${creep.memory.assignedRoom}`;
    },

	configureLinks: function(fromID, toID, roomName){
		let thisRoom = Game.rooms[roomName];
		if (thisRoom == undefined) { return `Error: ${roomName} is an invalid room` }
		if (thisRoom.memory.links == undefined) { thisRoom.memory.links = [] }
		let newLink = { from: fromID, to: toID};
		thisRoom.memory.links.push(newLink);
		return 'Link added';
	},

    countCreeps: function() {
        let roleList = {};
        for (let i in Game.creeps){
            if(roleList[Game.creeps[i].memory.role] == undefined){ roleList[Game.creeps[i].memory.role] = {role: Game.creeps[i].memory.role, count: 1}}
            else { roleList[Game.creeps[i].memory.role].count++}
        }
        for (let role in roleList){
            console.log(`${roleList[role].count.toString().padStart(2)} ${roleList[role].role}`);
        }
    },

    listCreeps: function() {
        Memory.flags.listCreeps = true;
        return 'Complete';
    },

    checkID: function(id) {
        let checkObject = Game.getObjectById(id);
        helper.stringify(checkObject);
        return 'Complete';
    },

    checkMarket: function() {
        
        for (let room in Game.rooms){
            if (Game.rooms[room].terminal){
                let resources = [];
                for (let type in Game.rooms[room].terminal.store){
                    if (type == RESOURCE_ENERGY) { continue }
                    if (!resources.includes(type)) { resources.push(type) }
                }
                for (let type of resources){
                    //let history = Game.market.getHistory(type);
                    //helper.stringify(history);
                    let buyOrders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: type});
                    let bestPrice = -Infinity;
                    let bestOrderID = null;
                    let orderAmount = 0; Game.rooms[room].terminal.store.getUsedCapacity(type);
                    let orderRoomName = null;
                    for (let order of buyOrders){
                        if (order.price > bestPrice && order.price >= MINIMUM_PRICE[type]) {
                            bestPrice = order.price;
                            bestOrderID = order.id;
                            orderRoomName = order.roomName;
                            orderAmount = order.remainingAmount;
                        }
                    }
                    if (bestOrderID != null){
                        if (orderAmount > Game.rooms[room].terminal.store.getUsedCapacity(type)) { orderAmount = Game.rooms[room].terminal.store.getUsedCapacity(type) }
                        let transactionCost = Game.market.calcTransactionCost(orderAmount, room, orderRoomName);
                        if (transactionCost < Game.rooms[room].terminal.store.getUsedCapacity(RESOURCE_ENERGY)) {
                            console.log(`${room}: ${type}: Selling ${orderAmount} for ${bestPrice} per unit. Transaction Cost: ${transactionCost}. Profit: ${bestPrice * orderAmount}`);
                            if (Game.rooms[room].terminal.cooldown == 0){
                                let result = Game.market.deal(bestOrderID, orderAmount, room);
                                switch (result) {
                                    case OK:
                                        console.log('Sale processed and accepted');
                                        break;
                                    default:
                                        console.log(`Sale failed (${result})`);
                                }
                            } else { console.log("Sale failed. Terminal on cooldown") }
                        }
                    }
                }
            }
        }

        
        return 'Complete';
    },

    toggleRP: function() {
        if (Memory.roles.repairPersistance) { Memory.roles.repairPersistance = false }
        else { Memory.roles.repairPersistance = true }
		return `Repair Persistance = ${Memory.roles.repairPersistance}`;
    },

    toggleMissionary: function() {
        if (!Memory.flags.useMissionaries) { Memory.flags.useMissionaries = true }
        else { Memory.flags.useMissionaries = false }
		return `Spawn Missionaries = ${Memory.flags.useMissionaries}`;
    },

    healthCheck: function() {
        for (let creep in Game.creeps){
            console.log(`${creep}:\t\t${Game.creeps[creep].hits}/${Game.creeps[creep].hitsMax}`);
        }
    },

    changeMax: function(role, newMax) {
        Memory.roles.limit[role] = newMax;
        return `${role} limit = ${Memory.roles.limit[role]}`;
    },

    buildRoad: function(flagStart='Flag1', flagEnd='Flag2', deleteFlags=true){
        let returnValue = construction.buildRoad(Game.flags[flagStart].pos, Game.flags[flagEnd].pos);
        if (deleteFlags){
            Game.flags[flagStart].remove();
            Game.flags[flagEnd].remove();
        }
        return returnValue;
    },

    buildTowerRoad: function(roomName){
        let thisRoom = Game.rooms[roomName];
        let startSpawn = Game.spawns[thisRoom.memory.spawns[0].name];
        let roomTowers = thisRoom.find(FIND_MY_STRUCTURES, {filter: (struct) => { return struct.structureType == STRUCTURE_TOWER}});
        let returnString = [];
        for (let tower in roomTowers){
            returnString.push(construction.buildRoad(startSpawn.pos, { pos: roomTowers[tower].pos, range: 1}));
        }
        return returnString;
    },

    resetIndex: function() {
        for (let i in Memory.roles.index) { Memory.roles.index[i] = 1 }
        return 'Complete';
    },

    setImportContainer: function(action, containerID=null) {
        switch(action){
            case 'add':
                let container = Game.getObjectById(containerID);
                if (container == null) { return `Error: ${containerID} is not a valid Object`}
                if (container.structureType != STRUCTURE_CONTAINER && container.structureType != STRUCTURE_LINK) { return `Error: ${containerID} is not a valid Import Target`};
                if (Memory.importContainers == undefined) { Memory.importContainers = [] }
                if (!Memory.importContainers.includes(containerID)) { Memory.importContainers.push(containerID) }
                return `Added ${containerID} to Import Container List`;
            case 'del':
                if (Memory.importContainers === undefined){ return `Error: Nothing in Import Container List` }
                for (let i in Memory.importContainers){
                    if (containerID == Memory.importContainers[i]){
                        Memory.importContainers.splice(i, 1);
                        return `Removed ${containerID} from Import Container List`;
                    }
                }
                return `${containerID} not found`;
            case 'list':
                console.log(`Import Containers: ${Memory.importContainers.length}`);
                for (let i in Memory.importContainers){
                    console.log(`${i}: ${Memory.importContainers[i]}`);
                }
                return 'Complete';
            default:
                return `Error: Invalid action (${action})`;
        }
    },

    upgradeContainer: function(action, containerID=null) {
        switch(action){
            case 'add':
                let container = Game.getObjectById(containerID);
                if (container == null) { return `Error: ${containerID} is not a valid Object`}
                if (container.structureType != STRUCTURE_CONTAINER && container.structureType != STRUCTURE_LINK) { return `Error: ${containerID} is not a valid Container for Upgrading`};
                Memory.rooms[container.room.name].upgradeContainer = containerID;
                return `Added ${containerID} as Upgrade Container for ${container.room.name}`;
            case 'del':
                for (let roomName in Memory.rooms){
                    if (Memory.rooms[i].upgradeContainer != undefined && Memory.rooms[i].upgradeContainer == containerID){
                        Memory.rooms[i].upgradeContainer == undefined;
                        return `Removed ${containerID}`;
                    }
                }
                return `${containerID} not found`;
            default:
                return `Error: Invalid action (${action})`;
        }
    },

    setCrusade: function(x=undefined, y=undefined, roomName=undefined){
        if (Memory.flags.crusade == undefined){ Memory.flags.crusade = {} }
        if (roomName == undefined) { 
            if (Memory.flags.crusade.roomName) {
                Memory.flags.crusade = {};
                return 'Complete - cleared crusade';
            }
            else { return 'Complete - no crusade set' }
        }
        try { new RoomPosition(x, y, roomName) } catch (error) { return error }

        Memory.flags.crusade = {x: x, y: y, roomName: roomName};
        return 'Complete - set crusade';
    },

    killList: function(action, id=undefined){
        switch(action){
            case 'add':
                if (Memory.killList === undefined){ Memory.killList = [] }
                if (Game.getObjectById(id) === null) { return `Error: Invalid ID (${id})`}
                Memory.killList.push(id);
                return `Added ${id} to killList`;
            case 'del':
                if (Memory.killList === undefined){ return `Error: Nothing in killList` }
                if (Game.getObjectById(id) === null) { return `Error: Invalid ID (${id})`}
                for (let i in Memory.killList){
                    if (id == Memory.killList[i]){
                        Memory.killList.splice(i, 1);
                        return `Removed ${id} from killList`;
                    }
                }
                return `${id} not found`;
            case 'list':
                if (Memory.killList === undefined){ Memory.killList = [] }
                console.log(`killList Length: ${Memory.killList.length}`);
                for (let i in Memory.killList){
                    console.log(`${i}: ${Memory.killList[i]}`);
                }
                return 'Complete';
            case 'clear':
                if (Memory.killList !== undefined) {Memory.killList = undefined }
                return `killList cleared`;
            default:
                return `Error: Invalid action (${action})`;
        }
    },

    dismantle: function(action, id=undefined){
        switch(action){
            case 'add':
                if (Memory.dismantleList === undefined){ Memory.dismantleList = [] }
                if (Game.getObjectById(id) === null) { return `Error: Invalid ID (${id})`}
                Memory.dismantleList.push(id);
                return `Added ${id} to dismantleList`;
            case 'del':
                if (Memory.dismantleList === undefined){ return `Error: Nothing in dismantleList` }
                if (Game.getObjectById(id) === null) { return `Error: Invalid ID (${id})`}
                for (let i in Memory.dismantleList){
                    if (id == Memory.dismantleList[i]){
                        Memory.dismantleList.splice(i, 1);
                        return `Removed ${id} from dismantleList`;
                    }
                }
                return `${id} not found`;
            case 'list':
                if (Memory.dismantleList === undefined){ Memory.dismantleList = [] }
                console.log(`dismantleList Length: ${Memory.dismantleList.length}`);
                for (let i in Memory.dismantleList){
                    console.log(`${i}: ${Memory.dismantleList[i]}`);
                }
                return 'Complete';
            case 'clear':
                if (Memory.dismantleList !== undefined) {Memory.dismantleList = undefined }
                return `dismantleList cleared`;
            default:
                return `Error: Invalid action (${action})`;
        }
    },

    wipeRooms: function(){
        for (let i in Memory.rooms){
            let thisRoom = Game.rooms[i];
            if (thisRoom == undefined){
                console.log(`Wiping ${i} from memory`);
                Memory.rooms[i] = undefined;
            } else { console.log(`Room ${i} is visible`)}
        }
        return 'Comeplete';
    },

    suicide: function(creepName) {
        creep = Game.creeps[creepName];
        if (creep == undefined) {return `${creepName} is not a valid name`}
        creep.suicide();
        return `${creepName} goes to her dark embrace!`;
    },

    massSuicide: function(role) {
        roleList = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        for (let i in roleList){
            roleList[i].suicide();
            console.log(`${roleList[i].name} goes to her dark embrace!`);
        }
        return `Complete`;
    },

    zombie: function(creepName) {
        creep = Game.creeps[creepName];
        if (creep == undefined) {return `${creepName} is not a valid name`}
        creep.memory.role = ZOMBIE;
        return `${creepName} is now a zombie`;
    },

    massZombie: function(role) {
        roleList = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        for (let i in roleList){
            roleList[i].memory.role = ZOMBIE;
            console.log(`${roleList[i].name} is now a zombie`);
        }
        return `Complete`;
    }    
}
module.exports = consoleCommands;

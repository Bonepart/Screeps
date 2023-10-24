let processRenewal = require('process.renewal');
let helper = require('helper');
let roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep){
        if(processRenewal.renew(creep)){ return };

        let structuresAtPos = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
        if (isValidPosition(structuresAtPos)){ creep.memory.onRampart = true}
        else { creep.memory.onRampart = false}

        let dFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defenders"}});
        if (!creep.memory.onRampart) {
            let searchFromPos = creep.pos;
            if (dFlag.length > 0) { searchFromPos = dFlag[0].pos }
            let ramparts = searchFromPos.findInRange(FIND_MY_STRUCTURES, 6, { filter: (struct) => {return struct.structureType == STRUCTURE_RAMPART}})
            let targetRampart = null;
            for (let i in ramparts){
                if (creep.room.lookForAt(LOOK_CREEPS, ramparts[i].pos).length == 0){
                    targetRampart = ramparts[i];
                    break;
                }
            }
            creep.moveTo(targetRampart, {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target){
                let result = creep.attack(target);
                switch(result){
                    case OK:
                        console.log(`${creep.name} attacked ${target.name}! (${target.hits}/${target.hitsMax})`);
                        break;
                    case ERR_NOT_IN_RANGE:
                        break;
                    default:
                        console.log(`${creep.name} tried to attck ${target.name}, got error ${result}`);
                }
            } 
        }
    }
}
module.exports = roleDefender;

function isValidPosition(structureList) {
    let foundRampart, foundRoad = false;
    for (let i in structureList){
        if (structureList[i].structureType == STRUCTURE_RAMPART){ foundRampart = true }
        else if (structureList[i].structureType == STRUCTURE_ROAD){ foundRoad = true }
    }
    return (foundRampart && !foundRoad)
}
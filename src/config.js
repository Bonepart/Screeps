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
        if(!Memory.harvesterIndex){
            Memory.harvesterIndex = 1;
        }
        if(!Memory.builderIndex){
            Memory.builderIndex = 1;
        }
        if(!Memory.upgraderIndex){
            Memory.upgraderIndex = 1;
        }
    }
};
module.exports = config;
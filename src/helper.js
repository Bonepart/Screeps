var helper = {

    stringifyToLog: function (object) {
        let str = JSON.stringify(object, null, 4);
        console.log(object);
    }
}
module.exports = helper;
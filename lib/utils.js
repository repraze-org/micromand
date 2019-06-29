function arrayify(obj){
    if(!Array.isArray(obj)){
        if(obj === undefined){
            return [];
        }
        return [obj];
    }
    return obj;
}

module.exports = {
    arrayify
};

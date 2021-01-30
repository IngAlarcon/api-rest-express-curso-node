function log(req, res, next){

    console.log('Su logueo fue un exito!!........');
    next();

}

module.exports = log; 
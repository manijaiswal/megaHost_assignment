const mongoose     = require('mongoose');
const configs      = require('../utility/configs');
const log4jsLogger = require('../loggers/log4js_module');

mongoose.set('useCreateIndex',true);

var logger  = log4jsLogger.getLogger('Database');

// mongodb://manish:Nitp123@ds145208.mlab.com:45208/megahost
// 'mongodb://localhost:27017/'+configs.DB_NAME
mongoose.connect('mongodb://manish:Nitp123@ds145208.mlab.com:45208/megahost',{useNewUrlParser: true },(err)=>{
    if(err){
        logger.error({"r":"mongodb","msg":"mongodb_connection_error","body":err});
        console.log(err);
        return;
    }
    console.info("Database successfully Connected");
    logger.info({"r":"mongodb","msg":"Database_successfully_connected","body":"success"});
})
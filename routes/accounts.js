var express   = require('express');
var mongoose  = require('mongoose');
var jwt       = require('jsonwebtoken');

var log4jsLogger = require('../loggers/log4js_module');
var helper       = require('../utility/helpers');
var errorCodes   = require('../utility/errors');
var constants    = require('../utility/constants');
var configs      = require('../utility/configs');
var AuthModule   = require('../utility/auth/auth_token');
var otp_generator = require('../utility/code_generator');
var {sendOtpMail} = require("../mail-gun/sendMail");  

require('../models/accounts');
require('../models/emailCodes');





var Account      = mongoose.model('Account');
var EmailOtp     = mongoose.model('EmailOtp');


var router       = express.Router();
var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var logger       = log4jsLogger.getLogger('Account');


/*==========================routes for create account ====================================== */

/*=================routes for create doctor account ====================*/

router.post('/cr_acc',(req,res)=>{

    req.checkBody('email',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('user_name',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }


    var email     = req.body.email;
    var user_name = req.body.user_name; 
    var vrfy      = false;
    var password  = req.body.password;


    if(password.length<6){
        logger.error({"r":"cr_acc","method":"post","msg":"password length should be greater than 6"});
        return sendError(res,"password length should be greater than 6","password_length",constants.BAD_REQUEST);
    }

    var data = {};


    Account.find({email,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"cr_acc","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        if(profile_data.length>0){
            logger.error({"r":"cr_acc","method":"post","msg":"Account already exists"});
            return sendError(res,"Account already exists","account_already_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length==0){

            vrfy = false;
            var vrfy_at = new Date();

            var saveObj = {email,vrfy,vrfy_at,password,user_name};

            var account = new Account(saveObj);

            account.save(function(err,account_save){
                if(err){
                    logger.error({"r":"cr_acc","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                var aid  = account_save['_id'];
                generateEmailCode(aid,email,function(err,genereted_otp){
                    if(err){
                        logger.error({ "r": "cr_acc", "method": 'post', "msg": err });
                        return sendError(res, err, "email_not_sent", constants.SERVER_ERROR);
                    }
                    return sendSuccess(res,account_save);

                })
            })

        }
    })

})

router.post('/verify_email', (req, res) => {
    req.checkBody('aid', errorCodes.invalid_parameters[1]).isValidMongoId();
    req.checkBody('code', errorCodes.invalid_parameters[1]).notEmpty();

    if (req.validationErrors()) {
        logger.error({ "r": "verify_email", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }

    var aid = req.body.aid;
    var code = req.body.code;
    var status = EmailOtp.STATUS.NOT_USED;
    var data = {};

    EmailOtp.find({ aid, code, status }, function (err, otp_data) {
        if (err) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        if (otp_data.length == 0) {
            logger.error({ "r": "verify_email", "method": 'post', "msg": "Otp is invalid or used" });
            return sendError(res, "Otp is invalid or used", "otp_invalid", constants.BAD_REQUEST);
        }

        var email_otp_id = otp_data[0]._id;
        Account.find({ _id: aid }, function (err, account_data) {
            if (err) {
                logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                return sendError(res, err, "server_error", constants.SERVER_ERROR);
            }

            var acc_id = account_data[0]['_id']
            
            data['account'] = account_data[0]
            Account.updateOne({ _id: acc_id }, { vrfy: true}, function (err, update_account) {
                if (err) {
                    logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                    return sendError(res, err, "server_error", constants.SERVER_ERROR);
                }

                var token = AuthModule.getAT({ id: aid });
                data['token'] = token;
                var used_status = EmailOtp.STATUS.USED;

                EmailOtp.updateOne({ _id: email_otp_id }, { status: used_status }, function (err, update_email) {
                    if (err) {
                        logger.error({ "r": "verify_email", "method": 'post', "msg": err });
                        return sendError(res, err, "server_error", constants.SERVER_ERROR);
                    }

                    return sendSuccess(res, data);
                })
            })
        })
    })
});


router.post('/login',(req,res)=>{
    req.checkBody('email',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('password',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"login","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var email = req.body.email;
    var password  = req.body.password;

    Account.find({email,vrfy:true},function(err,profile_data){
        if(err){
            logger.error({"r":"login","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }  

        if(profile_data.length==0){
            logger.error({"r":"login","method":"post","msg":"Account doesnot exists"});
            return sendError(res,"Account doesnot exists","account_not_exists",constants.BAD_REQUEST); 
        }

        if(profile_data.length>0){
            var data = {};
            var profile = profile_data[0];
            var aid     = profile_data[0]['_id'];

            profile.comparePassword(password,function(err,success_data){
                if(err){
                    logger.error({"r":"login","method":'post',"msg":err});
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                if(success_data){
                    var token = AuthModule.getAT({id:aid});
                    data['token'] = token;
                    data['profile_data'] = profile;
    
                    return sendSuccess(res,data);
                }
                else{
                    logger.error({"r":"login","method":'post',"msg":"Password not match with this number"});
                    return sendError(res,"Password not match with this number","password_not_match",constants.BAD_REQUEST); 
                }
            })

        }
    })

});


router.post('/init_pro',(req,res)=>{
    req.checkBody('aid', errorCodes.invalid_parameters[1]).isValidMongoId();

    if(req.validationErrors()){
        logger.error({"r":"login","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var aid = req.body.aid;

    Account.findOne({_id:aid},function(err,profile){
        if(err){
            logger.error({"r":"login","method":'post',"msg":err});
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        } 

        return sendSuccess(res,profile);
    })
})





function generateEmailCode(account_id, email, cb) {
    var aid = account_id;
    var code = otp_generator(configs.OTP_LENGTH);
    var status = EmailOtp.STATUS.NOT_USED;

    var emailCode = new EmailOtp({ aid, code, status });

    var data = [];
    var data_obj = {};

    emailCode.save(function (err) {
        if (err) {
            logger.error({ "r": "send_email", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        data_obj['code'] = code;
        data_obj['tim'] = new Date().toLocaleDateString();

        data.push(data_obj);
        console.log(data);
        sendOtpMail(data, email, function (err, emailSentSuccess) {
            if (err) {
                logger.error({ "r": "send_email", "method": 'post', "msg": err });
                console.log("hdhhd", err);
                cb(err, null);
            }

            cb(null, emailSentSuccess);

        })
    })
}


module.exports = router;
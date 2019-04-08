var express   = require('express');

var helper       = require('../utility/helpers');
var errorCodes   = require('../utility/errors');
var constants    = require('../utility/constants');
var configs      = require('../utility/configs');

var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var router       = express.Router();


router.post('/insert', function(req, res, next) {
    req.checkBody('user',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('graudian',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('student_user',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('student',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('enroll',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
        logger.error({"r":"cr_acc","method":"post","msg":errorCodes.invalid_parameters[1],"p":req.body});
        return sendError(res,req.validationErrors(),'invalid_parameters',constants.BAD_REQUEST);
    }

    var user = req.body.user;
    var graudian = req.body.graudian;
    var student_user = req.body.student_user;
    var student      = req.body.student;
    var enroll       = req.body.enroll;


    var delete_user = "DELETE FROM users";
    var  delete_guar = "DELETE FROM guardians";
    var delete_enroll = "DELETE FROM enrollments";
    var delete_student = "DELETE FROM students"
    var fetch_admin = "SELECT * FROM users WHERE role_id=2";
    var super_admin = ['2','NULL','1','2013-11-15 20:33:03','2019-03-03 17:38:10','2019-03-03 17:38:10','0','0','0','0','','0','2019-03-03 17:38:10','0',''];
    var x = [];
    res.locals.connection.query(fetch_admin, function(err,super_ad) {
        if(err){
            console.log(err);
            return sendError(res,err,"server_error",constants.SERVER_ERROR);
        }

        

        if(super_ad.length!=0){
            x = super_ad;
            super_admin.push(super_ad[0]['email'])
            super_admin.push(super_ad[0]['password'])
            super_admin.push(super_ad[0]['temp_password'])
        }       
        res.locals.connection.query(delete_user, function(err,delete1) {
            if(err){
                console.log(err);
                return sendError(res,err,"server_error",constants.SERVER_ERROR);
            }

            res.locals.connection.query(delete_guar, function(err,delete2) {
                if(err){
                    console.log(err);
                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                }

                res.locals.connection.query(delete_enroll, function(err,delete2) {
                    if(err){
                        console.log(err);
                        return sendError(res,err,"server_error",constants.SERVER_ERROR);
                    }  

                    res.locals.connection.query(delete_student, function(err,delete2) {
                        if(err){
                            console.log(err);
                            return sendError(res,err,"server_error",constants.SERVER_ERROR);
                        } 
                        
                        var sql = "INSERT INTO users (role_id,password,temp_password,reset_key,status,last_logged_in,created_at,modified_at,created_by,modified_by,api,is_login,socket_id,is_live,last_online,otp,fcm_token,email) VALUES ?";

                        res.locals.connection.query(sql, [user], function(err,data) {
                            if(err){
                                console.log(err);
                                return sendError(res,err,"server_error",constants.SERVER_ERROR);
                            }
                            
                            var fetch = "SELECT * FROM users";
                            res.locals.connection.query(fetch,function(err,results){
                                if(err){
                                    console.log(err);
                                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                }
                    
                                if(results.length==graudian.length){
                                    var i = results.length-1;
                                    for(var j=0;j<results.length;j++){
                                        graudian[j].push(results[j]['id']);
                                        i = i-1;
                                    }
                    
                                    var query = "INSERT INTO guardians (photo,other_info,status,created_at,modified_at,created_by,modified_by,name,relation,phone,profession,present_address,permanent_address,religion,user_id) VALUES ?";
                    
                                    res.locals.connection.query(query,[graudian],function(err,graudian_saved){
                                        if(err){
                                            console.log(err);
                                            return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                        }
                    
                                        var guardians_data = "SELECT * FROM guardians";
                    
                                        res.locals.connection.query(guardians_data,function(err,graudian_data){
                                            if(err){
                                                console.log(err);
                                                return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                            }
                    
                                            var m = graudian_data.length-1;
                                            for(var j=0;j<graudian_data.length;j++){
                                                student[j].push(graudian_data[j]['id']);
                                               // m = m-1;
                                            }
                    
                    
                                            var student_user_query = "INSERT INTO users (role_id,password,temp_password,reset_key,status,last_logged_in,created_at,modified_at,created_by,modified_by,api,is_login,socket_id,is_live,last_online,otp,fcm_token,email) VALUES ?";
                                            res.locals.connection.query(student_user_query, [student_user], function(err,data) {
                                                if(err){
                                                    console.log(err);
                                                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                                }
                                                var student_user_fetch_query = 'SELECT * FROM users WHERE role_id=4';
                                                res.locals.connection.query(student_user_fetch_query,function(err,results2){
                                                    if(err){
                                                        console.log(err);
                                                        return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                                    }
                        
                                                    if(results2.length==student.length){
                                                        var im = results2.length-1;
                                                        for(var j=0;j<results2.length;j++){
                                                            student[j].push(results2[j]['id']);
                                                            im = im-1;
                                                        }
                                                        var student_create = "INSERT INTO students (created_at,modified_at,created_by,modified_by,registration_no,photo,other_info,is_library_member,is_hostel_member,is_transport_member,discount,status,present_address,permanent_address,`group`,name,phone,gender,blood_group,religion,dob,guardian_id,user_id) VALUES ?";
                        
                                                        res.locals.connection.query(student_create, [student], function(err,data) {
                                                            if(err){
                                                                console.log(err);
                                                                return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                                            }
                    
                                                            var student_fetch = "SELECT * FROM students";
                                                            res.locals.connection.query(student_fetch,function(err,students){
                                                                if(err){
                                                                    console.log(err);
                                                                    return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                                                }
                                                        
                                                                for(var j=0;j<students.length;j++){
                                                                    enroll[j].push(students[j]['id']);
                                                                }
                    
                                                                var enroll_create = "INSERT INTO enrollments (created_at,modified_at,created_by,modified_by,status,roll_no,academic_year_id,class_id,section_id,student_id) VALUES ?";
                    
                                                                res.locals.connection.query(enroll_create, [enroll], function(err,data) {
                                                                    if(err){
                                                                        console.log(err);
                                                                        return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                                                    }

                                                                    if(x.length!=0){
                                                                        var admin_create_query = "INSERT INTO users (role_id,reset_key,status,last_logged_in,created_at,modified_at,created_by,modified_by,api,is_login,socket_id,is_live,last_online,otp,fcm_token,email,password,temp_password) VALUES ?"
                                                                    
                                                                        res.locals.connection.query(admin_create_query, [[super_admin]], function(err,data) {
                                                                            if(err){
                                                                                console.log(err);
                                                                                return sendError(res,err,"server_error",constants.SERVER_ERROR);
                                                                            }
    
                                                                            return sendSuccess(res,super_admin);
                                                                        })  
                                                                    }else{
                                                                       return  sendSuccess(res,student)
                                                                    }
                                                                })    
                                                            })
                                                            
                                                        })    
                                                    }
                        
                                                })        
                                            })  
                                        })    
                                         
                                    })
                                }
                            })
                            //return res.send(JSON.stringify({"status": 200, "error": null, "response": data}));
                        });  
                    })  
                })   
            })    
        })    
    })    
});

module.exports = router;
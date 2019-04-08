var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql  = require("mysql");

var expressValidator= require('express-validator');

require('./db/connect');

var accounts    = require('./routes/accounts');
var csvRoutes   = require('./routes/csvRoutes');


var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressValidator({
    customValidators:{
      isValidEmail:function(value){
        if(!value) return false;
        var val = value.trim();
        var email_reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return email_reg_exp.test(val);
      },
      isValidMongoId:function(value){
        if(!value) return false;
        var regex = /^[0-9a-f]{24}$/;
        return regex.test(value);
      }
    }
}));


app.use(function(req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,content-encoding');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});



app.use('/accounts',accounts);
app.use(function(req,res,next){
  res.locals.connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'dcf15f570735b1205ba2ebf26c0c5ff63347836f466cefff',
    database:'meridian_academy'
  })

  res.locals.connection.connect(function(err){
    if(err){
      console.log(err)
      return
    }
    next();
  });
 
})

//dcf15f570735b1205ba2ebf26c0c5ff63347836f466cefff

app.use('/csv',csvRoutes);



module.exports = app;

require("dotenv").config();

var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require("socket.io")(server);
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var nsp = [];

const bcrypt = require("bcrypt-nodejs");
const login = require("facebook-chat-api");
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('fli.json')
const db = low(adapter)
const fapi = require("./api")
const auth = require("./auth")


db.defaults({ users: []})
  .write();
  
app.use(bodyParser.json());

app.get('/',function(req,res){
    res.status(401).json({test:'test'});
})

app.post('/login', function(req,res){
    const creds = req.body;
    const user = db.get('users')
                    .find({email: creds.email})
                    .value();
    if(user){
        bcrypt.compare(creds.password,user.password,function(err,same){
            if(err){
                console.log(err);
                res.status(500).json({
                    error: 'Internal error. Please try again'
                })
            } else {
                if(!same){
                    console.log('here ??')
                    res.status(401).json({
                        error: 'Incorrect username or password'
                    })
                } else {
                    if(fapi[user.email]){
                        var userID = fapi[user.email].getCurrentUserID();
                        const token = jwt.sign({email:user.email,userID:userID},process.env.SECRET,{
                        expiresIn:'1h'
                        });
                        res.status(200).json({
                          token:token
                        });
                    } else {
                        login({appState:JSON.parse(user.appstate)},(err,api)=>{
                            if(err){
                                db.get('users')
                                    .remove({email:user.email})
                                    .write();
                                 res.status(401).json({
                                     error: 'Please try again'
                                 })
                            } else {
                                fapi[user.email] = api;
                                var userID = fapi[user.email].getCurrentUserID();
                                const token = jwt.sign({email:user.email,userID:userID},process.env.SECRET,{
                                expiresIn:'1h'
                                });
                                res.status(200).json({
                                  token:token
                                });
                            }
                        })
                    }
                }
            }
        })
    } else {
        login(creds,(err,api)=>{
            if(err){
                res.status(401).json({
                    error:err.error
                });
            } else {
                var salt = bcrypt.genSaltSync(process.env.SALTROUNDS);
                bcrypt.hash(creds.password,salt,null,function(err,hashed){
                    if(err){
                        res.status(500).json({
                            error: 'Internal error. Please try again'
                        })
                    } else {
                        creds.password = hashed;
                         db.get('users')
                        .push({email:creds.email,password:creds.password,appstate:JSON.stringify(api.getAppState())})
                        .write();
                        
                        fapi[creds.email] = api;
                        var userID = fapi[creds.email].getCurrentUserID();
                        const token = jwt.sign({email:creds.email,userID:userID},process.env.SECRET,{
                        expiresIn:'1h'
                        });
                        res.status(200).json({
                          token:token
                        });                
                    }
                });
            }
        })
    }
    
});

app.get('/threads',auth,function(req,res){
    fapi[req.email].getThreadList(20,null,[],function(err,list){
    if(err){
      res.status(500).send(err);
    } else {
      res.status(200).send(list)
    }
    });
});

app.get('/threads/:id',auth,function(req,res){
  fapi[req.email].getThreadHistory(req.params.id,100,undefined,function(err,history){
    if(err){
      res.status(500).send(err);
    } else {
      res.status(200).send(history);
    }
  });
});

app.post('/send',auth,function(req,res){
  fapi[req.email].sendMessage(req.body.text,req.body.threadID);
  res.sendStatus(200)
});

app.get('/:id',auth,function(req, res) {
    var nspID = req.params.id;
    nsp[req.email] = io.of('/' + nspID);
    nsp[req.email].on('connection', function(socket){
        console.log('user ' + req.id + ' are connected');
        fapi[req.email].listen((err,message)=>{
            if(err){
                console.log(err);
            } else {
                socket.emit('newMsg',message)
            }
        })
    })
    res.sendStatus(200);
});

server.listen(process.env.PORT, (err) => {
  if(err){
    console.log(err);
  } else
    console.log('listening on *:'+ process.env.PORT);
});
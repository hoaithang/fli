'use strict';
const vorpal = require('vorpal')();
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");

var axios = require("./api");

clear();
console.log(
  chalk.red(
    figlet.textSync('Welcome to FLI', { horizontalLayout: 'full' })
  )
);
var threadsList;

vorpal
    .command('connect','server to connect')
    .action(function(args, callback){
        var self = this;
        
        var promise = this.prompt({
            type:'input',
            name: 'server',
            message:'Server: ',
        },function(answer){
            
        });
        
        promise.then(function(answer){
            axios.setURL(answer.server);
            axios.api.init().then(res=>{
            if(res.status==200){
                self.log('connect to server successfully')
            } else {
                self.log('failed to connect to server. Please try again');
            }
            }).catch(e=>{
                self.log('server has been suppend.')
            })
            callback();
        });
    });

vorpal
    .command('login','login')
    .action(function(args,callback){
        const self = this;
        var promise = this.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'email: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'password: '
            }
        ], function(answer){
            
        })
        promise.then(function(answer){
            axios.api.login(answer).then(res=>{
                if(res.status==200){
                    axios.setHeader(res.data.token);
                    self.log('login successfully');
                    axios.api.getAllThreads().then(res => {
                        if(res.status==200){
                            const threads = res.data;
                            threadsList =  threads.map((t,i)=>{
                                var obj= {};
                                obj[t.threadID] = t.name;
                                return obj;
                            })
                        }
                        callback();
                    })
                } else {
                    self.log('login failed')
                }
            }).catch(e => {
                self.log(e.response.data.error)
            })
            callback();
        });
    });
    
vorpal
    .command('list','get thread list')
    .action(function(args,callback){
       console.log(threadsList);
       callback();
    });

vorpal
    .delimiter('fli$')
    .show();

const vorpal = require('vorpal')();
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");
const Listr = require("listr");
const axios = require("./api");

var ui = new inquirer.ui.BottomBar();



var threads = [];
var thread;

clear();
console.log(
  chalk.red(
    figlet.textSync('F-CLI', { horizontalLayout: 'full' })
  )
);

vorpal
    .command('connect')
    .alias('/c')
    .action(function(args,cb){
        this.prompt({
            type: 'input',
            name: 'server',
            message: 'Server: ',
            default: function(){
                return 'http://localhost:8080'
            }
        }).then(a => {
            const tasks = new Listr([{
                title: 'setup server',
                task: () => {
                    axios.setURL(a.server)
                }
            }]);
            tasks.run().then(()=>{
                cb();
            })
       }).catch(e=>{
           console.log(e);
           cb();
       })
    });

vorpal
    .command('login')
    .alias('/l')
    .action(function(args,cb){
        this.prompt([{
            type: 'input',
            name: 'email',
            message: 'Email: '
        },{
            type: 'password',
            name: 'password',
            message: 'Password: '
        }]).then(a => {
            const tasks = new Listr([{
                title: 'connecting to server',
                task:  () => {
                    return axios.api.login(a).then(res => {
                        if(res.status==200){
                            axios.setHeader(res.data.token);
                        }
                    }).catch(err =>{
                        // this.log(err);
                        throw new Error(err);
                    });
                }
            },{
                title: 'getting threads list',
                task: async () => {
                    await axios.api.getAllThreads().then(res =>{
                       if(res.status==200){
                           threads = res.data.map((t,i)=>{
                               var obj = {};
                               obj[t.name] = t.threadID;
                               return obj;
                           });
                       } 
                    }).catch(err => {
                        throw new Error(err);
                    });
                }
            }]);
            tasks.run().then(()=>{cb();}).catch(e =>{
                console.log(e);
                // throw new Error(e);
                cb();
            });
        });
    });
    
vorpal
    .command('list')
    .alias('/t')
    .action(function(args,cb){
       
    });
    
    

vorpal
    .delimiter('fli$ ')
    .show();
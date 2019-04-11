const vorpal = require('vorpal')();

var axios = require("./api");
var creds = {
    email:"",
    password:""
}
var threadsList
var histories
var userID


function getURL(v,cb) {
    self = v;
    self.prompt({
        type: 'input',
        name: 'url',
        message: 'Please enter your host server: ',
    }, function(result){
        if(result.url){
            axios.setURL(result.url);
        } else {
            self.log('Please enter your host server')
        }
        cb();
    })
}

vorpal
  .command('connect', 'connect to server')
  .action(function(args, callback) {
    const self = this;
    getURL(self,callback);
  });
  
vorpal
    .command('login')
    .action(function(args, callback) {
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
            message: 'Password: '
        }
        ], function (answers) {
            creds.email = answers.email;
            creds.password = answers.password;
        });
        promise.then(function(answers) {
          axios.api.login(creds).then(res => {
              if(res.status==200){
                  const token = res.data.token;
                  axios.setHeader(token);
                  self.log('login successfully')
              } else {
                  self.log('login failed')
              }
          }).catch(e =>{
              self.log(e)
            //   Promise.reject(e);
          })
        
          callback();
        });
    })
    
vorpal
    .command('test', 'test connection')
    .action(function(args, callback) {
        axios.api.getAllThreads().then(res => {
            if(res.status==200){
                this.log(res.data)
            }
        }).catch(e =>{
            this.log(e);
        })
        callback();
    })
    
vorpal
    .command('mode')
    .action(function(args, callback) {
        
          callback();
    })
vorpal
          .mode('repl')
          .delimiter('you are in repl>')
          .action(function(command, cb) {
            var self = this;
            self.log(command)
            cb();
          });
vorpal
  .delimiter('cli-fapi$')
  .show();
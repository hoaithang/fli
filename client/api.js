var axios = require("axios");

const api = {
  init: function(){
    return axios.get('/');
  },
  login: function(user){
    return axios.post('/login',user);
  },
  getAllThreads: function(){
    return axios.get('/threads')
  },
  getHistories: function(id){
    return axios.get(`/threads/${id}`)
  },
  send: function(message){
    return axios.post('/send',message)
  },
  connect: function(userID){
    return axios.get(`/${userID}`);
  },
}

function setURL(url) {
  if(url) {
    axios.defaults.baseURL = url;
  }
}

function setHeader(token) {
  if(token) {
    axios.defaults.headers.common['authorization'] = token;
  } else {
    delete axios.defaults.headers.common['authorization'];
  }
}

exports.api = api;
exports.setURL = setURL;
exports.setHeader = setHeader;
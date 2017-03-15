import React from 'react';
import axios from 'axios';
import LoginSignupView from './LoginSignupView.js';
import ViewNavBar from './ViewNavbar.js';
import Chatroom from './Chatroom.js';
import ChatSelection from './ChatSelection.js';


class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      userId : null,
      name : null,
      roomId : null,
      roomSearch : null,
      login_signup_view : true,
      chat_view : false,
      mounted : false
    }
    this.componentWillMount = this.componentWillMount.bind(this);
    this.handleUserSignupLogin = this.handleUserSignupLogin.bind(this);
    this.handleUserLogout = this.handleUserLogout.bind(this);
    this.handleChatSelection = this.handleChatSelection.bind(this);
    this.handleChatExit = this.handleChatExit.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
  }

  componentWillMount(){
   axios.get('/checkSession')
   .then(res => {
     if (res.data.id) {
      if (res.data.roomId) {
        this.setState({
          userId : res.data.id,
          name : res.data.firstname,
          roomId : res.data.roomId,
          mounted : true,
          login_signup_view : false,
          chat_view : true
        })
      } else { 
        this.setState({
          userId : res.data.id,
          name : res.data.firstname,
          mounted : true,
          login_signup_view : false
        })
      }
     } else {
       this.setState({
         mounted : true
       })
     }
   })
   .catch(err => {
     console.log(err);
   })
  }

 handleUserSignupLogin(res){
   this.setState({
     userId : res.id,
     name : res.firstname,
     login_signup_view  : false
   })
 }

 handleUserLogout(){
   var self = this;
   axios.post('/logout', {id :this.state.userId})
   .then(res => {
     self.setState({
       userId : null,
       roomId : null,
       name : null,
       chat_view : false,
       login_signup_view : true
     })
   })
   .catch(err => {
     console.log(err);
   })
 }

 handleChatSelection(inputRoomId, searchOptions, result){
   this.setState({
     roomId : inputRoomId,
     roomSearch : {'option' : searchOptions, 'res' : result},
     chat_view : true
   })
 }

 handleChatExit(){
   var self = this;
   if (this.state.roomId) {
    axios.post('/exitChat', {id : this.state.userId})
    .then(res => {
      self.setState({
        chat_view : false,
        roomId : null
      })
    })
    .catch(err => {
      console.log(err);
    })
   }
 }

 handleRoomChange(newRoom) {
   this.setState({
     roomId : newRoom,
   })
 }


  render() {
    return (
      <div>
        <ViewNavBar logout = {this.handleUserLogout} 
                    home = {this.handleChatExit} 
                    userId = {this.state.userId}/>
       {
         this.state.mounted ? 
         (this.state.login_signup_view ? 
         (<LoginSignupView userSignupLogin = {this.handleUserSignupLogin}/>) :
         (this.state.chat_view ? <Chatroom roomChange = {this.handleRoomChange} 
                                           userId = {this.state.userId} 
                                           roomId = {this.state.roomId} 
                                           name = {this.state.name} 
                                           searchResults = {this.state.roomSearch}/> 
         : < ChatSelection selectRoom = {this.handleChatSelection}/>))  
         :(<div></div>)
       }
      </div>
    )
  }
}

export default App

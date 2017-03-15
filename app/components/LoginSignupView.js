import React, { Component } from 'react';
import SignUp from './SignUp.js';
import Login from './Login.js';

class LoginSignupView extends Component {
  constructor(props){
    super(props)
    this.state = {
      login_view : true
    }
    this.handleChangeView = this.handleChangeView.bind(this);
  }

  handleChangeView(){
    this.setState({
      login_view : !this.state.login_view
    })
  }

  render(){
    return (
    <div>
    { this.state.login_view ? 
      <Login handleView={this.handleChangeView} userSignupLogin={this.props.userSignupLogin}/> 
      : <SignUp handleView={this.handleChangeView} userSignupLogin={this.props.userSignupLogin}/>
    }
    </div>
    )
  }
}

export default LoginSignupView;
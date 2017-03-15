import React, { Component } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';
import { ControlLabel } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

class Login extends Component {
  constructor(props){
    super(props)
    this.state = {
      loginEmail : '',
      loginPassword: '',
      invalidLogin: false,
    }
    this.handleUserLogin = this.handleUserLogin.bind(this);
    this.handleLoginEmail = this.handleLoginEmail.bind(this);
    this.handleLoginPassword = this.handleLoginPassword.bind(this);
  }

  handleLoginEmail(e){
    this.setState({
      loginEmail : e.target.value
    })
  }

  handleLoginPassword(e){
    this.setState({
      loginPassword: e.target.value
    })
  }

  handleUserLogin(event){

    event.preventDefault();

    var userInfo = {
      email : this.state.loginEmail,
      password : this.state.loginPassword
    }
    var self = this;

    axios.post('/login', userInfo)
    .then(result => {
      if (result.data.invalid) {
      this.setState({
        invalidLogin : true
      })
      } else {
        self.props.userSignupLogin(result.data);
      }
    })
    .catch(err => {
      console.log('Error Loging in', err);
    })
  }

  render(){
    const loginWellStyle={maxWidth: 500, margin: '0 auto 10px'};

    const alertInstance = (
      <Alert className="loginSignupAlert" bsStyle="warning">
        Password/Email combination does not match.
      </Alert>
    )
    return (
      <Col className="well" style={loginWellStyle}>
        <Form horizontal className="loginForm" onSubmit={this.handleUserLogin}>
          <FormGroup controlId="formHorizontalEmail">
              <Col componentClass={ControlLabel}>
              Email
              </Col>
              <Col >
              <FormControl type="email" placeholder="Email" value={this.state.loginEmail} onChange={this.handleLoginEmail} required={true}/>
              </Col>
            </FormGroup>

            <FormGroup controlId="formHorizontalPassword">
              <Col componentClass={ControlLabel} >
              Password
              </Col>
              <Col >
              <FormControl type="password" placeholder="Password" value={this.state.loginPassword} onChange={this.handleLoginPassword} required={true}/>
              </Col>
            </FormGroup>

            <FormGroup>
              <Button type="submit" bsStyle="primary">Login</Button>
              <Button onClick={()=> this.props.handleView()} type="submit">Signup</Button>
            </FormGroup>
            </Form>
            {
              this.state.invalidLogin ? (alertInstance) : <div></div>
            }
        </Col>
    )
  }
}

export default Login;

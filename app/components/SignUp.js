import React, { Component } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';
import { ControlLabel } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

class SignUp extends Component {
  constructor(props){
    super(props)
    this.state = {
      signupEmail : '',
      signupFirstName : '',
      signupLastName : '',
      signupPassword : '',
      invalidSignup : false
    }
    this.handleUserSignup = this.handleUserSignup.bind(this);
    this.handleSignupEmail = this.handleSignupEmail.bind(this);
    this.handleSignupPassword = this.handleSignupPassword.bind(this);
    this.handleSignupFirtName = this.handleSignupFirtName.bind(this);
    this.handleSignupLastName = this.handleSignupLastName.bind(this);
  }

  handleSignupEmail(e){
    this.setState({
      signupEmail : e.target.value
    })
  }

  handleSignupPassword(e){
    this.setState({
      signupPassword : e.target.value
    })
  }

  handleSignupFirtName(e){
    this.setState({
      signupFirstName : e.target.value
    })
  }

  handleSignupLastName(e){
    this.setState({
      signupLastName : e.target.value
    })
  }

  handleUserSignup(event){
    var self = this;
    event.preventDefault();

    var userInfo = {
      email : this.state.signupEmail,
      firstname : this.state.signupFirstName,
      lastname : this.state.signupLastName,
      password : this.state.signupPassword
    }

    axios.post('/signup', userInfo)
    .then(result => {
      console.log('result :', result)
      if (result.data.createdAt) {
        self.props.userSignupLogin(result.data);
      } else {
        this.setState({
          invalidSignup : true
        })
      } 
    })
    .catch(err => {
      console.log('Caught error in signup', err);
    })
  }

  render(){
    var signUpWellStyle={maxWidth: 500,margin: '0 auto 10px'};
    var alertInstance = (
      <Alert className="loginSignupAlert" bsStyle="warning">
        Email already registered, try logging in
      </Alert>
    )
    return (
      <Col className="well" style={signUpWellStyle}>
        <Form className="signUpForm" horizontal onSubmit={this.handleUserSignup}>
            <FormGroup controlId="formHorizontalEmail">
              <Col componentClass={ControlLabel} >
              Email
              </Col>
              <Col>
              <FormControl type="email" placeholder="Email" value={this.state.signupEmail} onChange={this.handleSignupEmail} required={true}/>
              </Col>
            </FormGroup>

            <FormGroup controlId="formHorizontalName">
              <Col componentClass={ControlLabel}>
              First Name
              </Col>
              <Col>
              <FormControl type="name" placeholder="First Name" value={this.state.signupFirstName} onChange={this.handleSignupFirtName} required={true}/>
              </Col>
            </FormGroup>

            <FormGroup controlId="formHorizontalEmail">
              <Col componentClass={ControlLabel}>
              Last Name
              </Col>
              <Col>
              <FormControl type="name" placeholder="Lastname" value={this.state.signupLastName} onChange={this.handleSignupLastName} required={true}/>
              </Col>
            </FormGroup>

            <FormGroup controlId="formHorizontalPassword">
              <Col componentClass={ControlLabel}>
              Password
              </Col>
              <Col>
              <FormControl type="password" placeholder="Password" value={this.state.signupPassword} onChange={this.handleSignupPassword} required={true}/>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col>
              <Button type="submit" bsStyle="primary">Sign Up</Button>
              <Button onClick={()=>this.props.handleView()}>Login</Button>
              </Col>
            </FormGroup>
          </Form>
          {
            this.state.invalidSignup ? alertInstance : <div></div>
          }
        </Col>
    )
  }
}

export default SignUp;

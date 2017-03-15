import React, { Component } from 'react'
import axios from 'axios';
import InterestsItem from './UserClickInterestsView'
import { Popover } from 'react-bootstrap';
import { OverlayTrigger } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

class UserItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interests: [],
      userSocket: this.props.socketId
    }
  //bind all functions here
  this.componentDidMount = this.componentDidMount.bind(this);
  this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps(nextProps){
    if (this.props.socketId !== nextProps.socketId) {
      this.setState({
        userSocket : nextProps.socketId
      })
    }
  }

  componentDidMount() {
    axios.get('/getUserInterest', { params : {id : this.props.user.id}})
    .then(res => {
      this.setState({
        interests: res.data
      })
    })
    .catch(err => {
      console.log('error in getting users interest: ', err);
    })
  }
    
  render() {
    var alertInstance = (
      <Alert className="loginSignupAlert" bsStyle="warning">
        Damn bro... let this user say something before you start clicking...Shieettttt
      </Alert>
    );
    var addPopover = (
      <Popover id="popover-trigger-click-root-close" title="User Interests">
        {this.state.interests.map((interest, index) => {
          return <ul key={index}><InterestsItem int={interest.Interest}/></ul>
        })}
        <div>
          {
            this.state.userSocket ? (<Button onClick={(e) => {this.props.privateChat(this.state.userSocket, this.props.user.firstname)}}>Invite to Private Chat</Button>)
            : alertInstance
          }
        </div>
        
      </Popover>
    );
    return (
    <div>
    <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={addPopover}>
          <b>{this.props.user.firstname}</b>
    </OverlayTrigger>
    </div>
    )
  }
}


export default UserItem
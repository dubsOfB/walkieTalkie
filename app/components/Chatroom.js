import React, { Component } from 'react';
import ChatLine from './ChatLineItem';
import UserItem from './UserItem';
import ChatJoinModal from './ChatJoinModal.js'
import io from 'socket.io-client';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Grid } from 'react-bootstrap';
import { Panel } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';

class Chatroom extends Component {
  constructor(props){
    super(props);
    this.state = {
      messages: [],
      showRequest: false,
      rejected: false,
      pcData: {},
      newMessage: '',
      roommates: [],
      userSockets: {}
    }
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handlePrivateChat = this.handlePrivateChat.bind(this);
    this.acceptPrivateChat = this.acceptPrivateChat.bind(this);
    this.declinePrivateChat = this.declinePrivateChat.bind(this);
    this.acceptRejection = this.acceptRejection.bind(this);
    this.joinPrivate = this.joinPrivate.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.getRoommates = this.getRoommates.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

  componentDidMount() {
    //creating a socket connection
    this.socket = io('/');

    //join a room upon connection
    this.socket.emit('join room', this.props.roomId);

    this.socket.emit('announce join', {room: this.props.roomId, user: this.props.name})

    this.socket.on('update user list', () => {
      this.getRoommates();
    })

    //listener for any incoming messages and re-setting the state
    this.socket.on('message', message => {
        var activeSockets = this.state.userSockets;
        if (!activeSockets.hasOwnProperty(message.user)) {
          activeSockets[message.user] = message.socketId;
        }
      
      this.setState({
        messages: [...this.state.messages, message].slice(0, 50),
        userSockets : activeSockets
      });
    });

    //listener for the receiver of a private chat request
    this.socket.on('requestModal', pcData => {
      this.setState({
        pcData,
        showRequest: true
      });
    });

    //listener for sender to join private room that the receiver has created upon acceptance
    this.socket.on('join private', pcData => {
      this.state.pcData = pcData;
      this.joinPrivate();
    });

    //listener for sender to see their offer has been declined
    this.socket.on('declined', pcData => {
      this.setState({
        pcData,
        rejected: true
      })
    })

    //get roommates when initially joining chatroom
    this.getRoommates()
  };

  componentWillUnmount() {
    this.socket.emit('leaveRoom', {
      room: this.props.roomId,
      user: this.props.name
    });
  }

  //join new room when the new props (roomId) have been passed down
  componentWillReceiveProps(nextProps) {
    if(nextProps.roomId !== this.props.roomId) {
      this.socket.emit('join room', nextProps.roomId);
      this.getRoommates(nextProps.roomId);
    }
  }

  //scrolls to bottom when new message is received or sent
  scrollToBottom() {
    var scrollHeight = this.chatList.scrollHeight;
    var height = this.chatList.clientHeight;
    var maxScrollTop = scrollHeight - height;
    this.chatList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollToBottom();
  }

  //get updated roommate list when new user joins
  getRoommates(newRoom) {
    var currentRoom = newRoom || this.props.roomId
    axios.get('/getActiveUsers', { params : {
      roomId: currentRoom,
      userId: this.props.userId
    }})
    .then(res => {
      this.setState({
        roommates: res.data
      })
    })
    .catch(err => {
      console.log('error in getting roommates: ', err);
    })
  }

  //handle new message input

  handleNewMessage(event) {
    this.setState({
      newMessage: event.target.value
    })
  };

  //handle all message submissions
  handleMessageSubmit(event) {
    event.preventDefault();
    var body = this.state.newMessage;
    if (body) {
      var message = {
        body,
        from: this.props.name,
        room: this.props.roomId,
        user: this.props.userId,
        socketId: this.socket.json.id
      };
      this.setState({
        messages: [...this.state.messages, message].slice(0, 50),
        newMessage: ''
      });
      //sending message to the server
      this.socket.emit('message', message);
    }
  }

  //handle a private chat request click (initiated by user)
  handlePrivateChat(recipSID, recipName) {
    this.socket.emit('privateRequest', {
      privateRoom: recipSID + this.socket.json.id,
      receiver: recipSID,
      receiverName: recipName,
      sender: this.socket.json.id,
      senderName: this.props.name
    });
  };

  //accept a received private chat request
  acceptPrivateChat() {
    //leave current room before joining new room
    this.socket.emit('leaveRoom', {
      room: this.props.roomId,
      user: this.props.name
    });;
    var priv = this.state.pcData;
    //logging out user from active users to join private room
    axios.post('/privateRoom', {id : priv.privateRoom})
      .then(res => {
        //emit to server that the request has been accepted
        this.socket.emit('acceptedRequest', priv);
        //update state to remove messages and hide modal
        this.setState({
          messages: [],
          showRequest: false
        })
        //initiate a room change in parent for recipient
        this.props.roomChange(priv.privateRoom);
      })
      .catch(err => {
        console.log('error in creating private chat: ', err);
      })
  };

  //decline a received private chat request
  declinePrivateChat() {
    this.socket.emit('declineRequest', this.state.pcData);
    this.setState({
      pcData: {},
      showRequest: false
    });
  };


  //sender joins the private chat after receiver accepted and created a room
  joinPrivate() {
    //leave current room before joining new private room
    this.socket.emit('leaveRoom', {
      room: this.props.roomId,
      user: this.props.name
    });
    var priv = this.state.pcData
    //request to logout as active user to join a private chat
    axios.post('/privateRoom', {id : priv.privateRoom})
      .then(res => {
        //resetting all messages for private chat
        this.setState({
          messages: []
        })
        //initiate a room change in parent for sender
        this.props.roomChange(priv.privateRoom);
      })
      .catch(err => {
        console.log('error in joining private chat: ', err);
      })
  };

  //close rejection modal
  acceptRejection() {
    this.setState({
      pcData: {},
      rejected: false
    });
  };

  render(){
    var messages = this.state.messages
    var roomTitle = '';
    if (typeof this.props.roomId === 'number') {
      roomTitle = "Room " + this.props.roomId;
    } else {
      roomTitle = "Private Chat";
    }
    var UserListStyle={maxWidth: 100, margin: '0 auto 10px'}
      return (
      <div>
        <Modal show={this.state.showRequest} dialogClassName="custom-modal">
          <Modal.Header>
            <Modal.Title id="contained-modal-title-lg">Private Chat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>{this.state.pcData.senderName} would like to start a private chat.</h3>
            <Button onClick={this.acceptPrivateChat}>Accept</Button>
            <Button onClick={this.declinePrivateChat}>Decline</Button>
          </Modal.Body>
        </Modal>

        <Modal show={this.state.rejected} dialogClassName="custom-modal">
          <Modal.Header>
            <Modal.Title id="contained-modal-title-lg">Private Chat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>{this.state.pcData.receiverName} has rejected your chat request.</h3>
            <Button onClick={this.acceptRejection}>OK</Button>
          </Modal.Body>
        </Modal>
        
        <Grid>
          <Row>
            <Col xs={12} md={12}>
            <Panel className="outerPanel" header={roomTitle}>
              <div id="fixedPanel">
                <Row>
                  <Col style={UserListStyle} xs={2} md={2}>
                    <div>
                      {
                        this.state.roommates.map(user => {
                          var tempSocketId = this.state.userSockets[user.id]
                          return <UserItem 
                                  key={user.id} 
                                  user={user} 
                                  privateChat={this.handlePrivateChat}
                                  socketId={tempSocketId}/>
                        })
                      }
                    </div>
                  </Col>
                  
                  <Col xsOffset={1} mdOffset={1} xs={9} md={9}>
                    <div id="chatbox" ref={div => {this.chatList = div}}>
                    {messages.map((message, index) =>
                      <Row key={index}>
                        <Col xs={12} md={12}>
                          <ChatLine
                            message={message}
                            privateChat={this.handlePrivateChat}/>
                        </Col>
                      </Row>
                    )}
                    </div>
                  </Col>

                  <Col xsOffset={3} mdOffset={2} xs={9} md={9}>
                    <Form onSubmit={this.handleMessageSubmit}>
                      <FormGroup>
                        <FormControl type="text" placeholder="Enter a Message" value={this.state.newMessage} onChange={this.handleNewMessage}/>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </div>
            </Panel>
            </Col>
          </Row>
        </Grid>
        
        <div>
        
        {
          this.props.searchResults ? 
          (
            <ChatJoinModal searchResults={this.props.searchResults}/>
          ) :
          <div></div>
        }
        </div>

      </div>
    )
    }
}

export default Chatroom;
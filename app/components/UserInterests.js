import React, { Component } from 'react';
import axios from 'axios';
import AvailableInterests from './AvailableInterests.js';
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';

class UserInterests extends Component {
  constructor(props){
    super(props)
    this.state = {
      mounted : false,
      allInterests : [],
      selectedInterest : {}
    }
    this.componentWillMount = this.componentWillMount.bind(this);
    this.handleInterestSelection = this.handleInterestSelection.bind(this);
    this.handleSaveInterest = this.handleSaveInterest.bind(this);
  }

  componentWillMount(){
    axios.get('/getAvailableInterests')
    .then(result => {
      axios.get('/getUserInterest', { params : {id : this.props.user}})
      .then(res => {
        res.data.forEach(int => {
          this.state.selectedInterest[int.id] = true;
        })
        this.setState({
          mounted : true,
          allInterests : result.data
        })
      })
      .catch(err => {
        console.log(err)
      })
    })
    .catch(error => {
      console.log(error);
    })
  }

  handleInterestSelection(interestId){
    if (!this.state.selectedInterest.hasOwnProperty(interestId)) {
      this.state.selectedInterest[interestId] = true;
    } else {
      this.state.selectedInterest[interestId] = false;
    }
  }

  handleSaveInterest(){
    axios.post('/saveInterest', this.state.selectedInterest)
    .then(result => {
      this.props.toggleModal();
    })
    .catch(error => {
      console.log(error);
    })
  }

  render (){
    return (
      this.state.mounted ? (     
        <Modal show={this.props.show} onHide={this.props.toggleModal} dialogClassName="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">Your Interests</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          { 
            this.state.allInterests.map(interest => {
              return <AvailableInterests
                      key = {interest.id}
                      checked = {this.state.selectedInterest[interest.id]} 
                      interest = {interest} 
                      toggleInterest = {this.handleInterestSelection}/>
            }) 
          }
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.handleSaveInterest}>Save</Button>
          </Modal.Footer>
        </Modal>
      ) : (<div></div>)
    )
  }
}

export default UserInterests;


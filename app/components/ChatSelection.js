import React, { Component } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import Loading from 'react-loading';
import { Modal } from 'react-bootstrap';
import { Col } from 'react-bootstrap';

class ChatSelection extends Component {
  constructor(props){
    super(props)
    this.state = {
      loading : false,
      show : false,
      message : ''
    }
    this.handleGlobalSearch = this.handleGlobalSearch.bind(this);
    this.handleLocalSearch = this.handleLocalSearch.bind(this);
    this.handleUserLocation = this.handleUserLocation.bind(this);
    this.handleInterestSearch = this.handleInterestSearch.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

handleUserLocation(e, selection){
  e.preventDefault();

  this.setState({
    loading : true
  })

  var options = {
    enableHighAccuracy : true,
    timeout : 5000,
    maximumAge : 0
  };

  var success = (pos) => {
    
    var crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    
    if (selection === 'local') {
      this.handleLocalSearch(crd.latitude, crd.longitude);
    } else {
      this.handleGlobalSearch(crd.latitude, crd.longitude);
    }
  }

  var error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

handleGlobalSearch(lat, long){
  axios.get('/findGlobalRoom', {
    params : {
      latitude : lat,
      longitude : long
    }
  })
  .then(res => {
    this.props.selectRoom(res.data.roomId, 1, {'host' : res.data.host});
  })
  .catch(error => {
    console.log(error);
  })
}

handleLocalSearch(lat, long){
  axios.get('/findLocalRoom', {
    params : {
      latitude : lat,
      longitude : long
    }
  })
  .then(res => {
    this.props.selectRoom(res.data.roomId, 2, {'host' : res.data.host, 'distance' : res.data.distance});
  })
  .catch(error => {
    console.log(error);
  })
}

handleInterestSearch(){
  this.setState({
    show : false,
    loading : true
  })
  axios.get('/findCommonUser')
  .then(result => {
    if (!result.data) {
      this.setState({
        loading : false,
        show : true,
        message : 'Users with common interests are not available, try local chat'
      })
    } else if (result.data.hasNoInterests) {
      this.setState({
        loading : false,
        show: true,
        message : 'You do not have any interests saved!'
      })
    } else {
      this.props.selectRoom(result.data.roomId, 3, {'interest':result.data.interests});
    }
  })
  .catch(error => {
    console.log(error);
  })
}

handleClose(){
  this.setState({
    show : false,
    message : ''
  })
}

  render() {
    const loadingCol = {maxWidth: 500, margin: '0 auto 10px'};
    const chatSelectionWell = {maxWidth : 500, margin: '0 auto 10px'};
    return (
    <div>
      <Modal show={this.state.show} onHide={this.handleClose} dialogClassName="custom-modal">
        <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">{this.state.message}</Modal.Title>
        </Modal.Header>
      </Modal>
      <div>
    {this.state.loading ?
      <Col style={loadingCol}>
      <Loading type="bars" color="#001f3f" width={500} heigth={500} delay={0}/> </Col> : 
      (
        <div className="well" style={chatSelectionWell}>
        <Button className = "selectionButton" bsStyle="primary" bsSize="large" block onClick={(e)=>this.handleUserLocation(e, 'global')}>Join Random Room</Button>
        <Button className = "selectionButton" bsStyle="primary" bsSize="large" block onClick={(e)=>this.handleUserLocation(e, 'local')}>Join Nearest User</Button>
        <Button className = "selectionButton" bsStyle="primary" bsSize="large" block onClick={this.handleInterestSearch}>Join Similar User</Button>
        </div>)
    }
      </div>
    </div>
    )
  }
}

export default ChatSelection;

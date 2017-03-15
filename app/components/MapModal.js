import React, { Component } from 'react';
import Container from './GoogleMaps/Container.js';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

class MapModal extends Component {
  constructor(props){
    super(props)
    this.state = {
      locations : [],
      mounted : false
    }
    this.componentWillMount = this.componentWillMount.bind(this);
  }

  componentWillMount(){
    axios.get('/mapLocations')
    .then(result => {
      this.setState({
        locations : result.data,
        mounted : true
      })
    })
    .catch(error => {
      console.log(error);
    })
  }

  render(){
    return ( this.state.mounted ? (    
        <Modal show={this.props.show} 
        onHide={this.props.toggleModal} 
        dialogClassName="custom-map-modal">
          <Modal.Body>
            <Container locations={this.state.locations}/>
          </Modal.Body>
    </Modal>) : <div></div>
    )
  }
}

export default MapModal;

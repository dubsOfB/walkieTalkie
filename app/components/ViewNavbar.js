import React, { Component } from 'react';
import { Navbar } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';
import { NavItem } from 'react-bootstrap';
import UserInterests from './UserInterests'
import MapModal from './MapModal.js';

class ViewNavBar extends Component {
  constructor(props){
    super(props)
    this.state = {
      show : false,
      showMap : false
    }
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleMapModal = this.toggleMapModal.bind(this);
  }

  toggleModal(){
    this.setState({
      show : !this.state.show
    })
  }

  toggleMapModal(){
    this.setState({
      showMap : !this.state.showMap
    })
  }

  render(){
  return (
  <Navbar inverse collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand onClick={this.props.home}>walkieTalkie</Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
      {this.props.userId ?
        <div>    
          <Navbar.Collapse>
            <Nav>
              <NavItem onClick={this.toggleModal}>Interest</NavItem>
              <NavItem onClick={this.toggleMapModal}>Map</NavItem>
            </Nav>
            <Nav pullRight>
              <NavItem onClick={this.props.logout}>Logout</NavItem>
            </Nav>
          </Navbar.Collapse>
          <div>
        {
          this.state.show ? 
          (<UserInterests show={this.state.show} 
                          user={this.props.userId} 
                          toggleModal={this.toggleModal} />)
          : (<div></div>)
        } </div>
        <div>
        {
          this.state.showMap ? 
            <MapModal show={this.state.showMap} toggleModal={this.toggleMapModal} /> : (<div></div>)
        }
        </div>
        </div>
        :
        <NavItem></NavItem>
        }
  </Navbar>
  )
  }
}

export default ViewNavBar;
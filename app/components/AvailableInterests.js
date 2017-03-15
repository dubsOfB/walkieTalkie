import React, { Component } from 'react';
import { Checkbox } from 'react-bootstrap';

class AvailableInterests extends Component {
  constructor(props){
    super(props)
    this.state = {
      selected : (this.props.checked ? true : false)
    }
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleCheck(){
    this.props.toggleInterest(this.props.interest.id);
    this.setState({
      selected : !this.state.selected
    })
  }
  
  render(){
    return (
      <Checkbox 
      checked={this.state.selected}
      onChange={this.handleCheck}
      inline>
      {
        this.props.interest.Interest
      }
      </Checkbox>
    )
  }
}

export default AvailableInterests;
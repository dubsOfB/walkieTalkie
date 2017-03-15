import React, { Component }  from 'react';
var __html = require ('../public/map.html');

var template = {__html: __html};
class MapView extends Component {
  constructor(props){
    super(props)
  }
  render(){
    console.log('in here')
    return (
      <div dangerouslySetInnerHTML={template}/>
    )
  }
}

export default MapView;
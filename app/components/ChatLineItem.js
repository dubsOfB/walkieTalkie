
import React from 'react'

var ChatLineItem = ({message}) => (
        <div >
        <p className ="talktext"><strong> {message.from}: </strong>{message.body}</p>
        </div>
);

export default ChatLineItem

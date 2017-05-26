import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

// Prevent drag and drop events everywhere.
// We'll enable them only where we want them
window.addEventListener("dragover",function(e){
  e = e || event;
  e.preventDefault();
},false)

window.addEventListener("drop",function(e){
  e = e || event;
  e.preventDefault();
},false)

ReactDOM.render(
  <App />,
  document.getElementById('root')
)

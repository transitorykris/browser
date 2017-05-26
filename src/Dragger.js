import React, { Component } from 'react'
import logo from './images/new_orange_monkey.svg'

// This is the top of the application window where the user can click to drag it around

const style = {
  Dragger: {
    WebkitAppRegion: "drag",
    height: "35px",
    background: "gold",
    position: "fixed",
    width: "100%",
    zIndex: "2",
  },
  Version: {
    display: "flex",
    float: "right",
    paddingTop: "8px",
    paddingRight: "10px",
    textAlign: "right",
  },
  Logo: {
    marginLeft: "5px",
    marginTop: "-5px",
  },
}

export default class Dragger extends Component {
  render() {
    return (
      <div style={style.Dragger}>
        <div style={style.Version}>
          <div>{this.props.username}</div>
          <div style={style.Logo}><img src={logo} height={30} alt="Jn.gl monkey logo" /></div>
        </div>
      </div>
    )
  }
}
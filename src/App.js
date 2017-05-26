import React, { Component } from 'react'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Snackbar from 'material-ui/Snackbar'
import Dragger from './Dragger'
import Files from './Files'
import Spinner from './Spinner'
import './index.css'

const electron = window.require('electron')
const execFile = electron.remote.require('child_process').execFile

const jnglCtl = electron.remote.app.getAppPath()+'/jnglctl/jnglctl'

injectTapEventPlugin()

const styles = {
  Header: {
    marginBottom: "24px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    WebkitAppRegion: "drag", // User can click and drag the window around
    cursor: "default",
    paddingTop: "35px",
  },
  Workspace: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "25px",
  }
}

export default class App extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      loading: true,
      user: {},
      found: false,
      openError: false,
      errorMessage: "",
    }
  }

  handleErrorRequestClose = () => {
    this.setState({
      openError: false,
    })
  }

  componentWillMount() {
    // Try to load details of this upspin user
    this.getUser()
  }

  getUser() {
    execFile(jnglCtl, ['user'], (error, stdout, stderr) => {
      if (error) {
        // It's okay if this fails! The user is probably not set up
        this.setState({loading: false})
        return
      }
      const out = JSON.parse(stdout)
      const userInitial = out.name.charAt(0).toUpperCase()
      this.setState({user: out, found: true, loading: false, userInitial: userInitial})
    })
  }

  // Callback for when setup has completed
  setupDone() {
    this.getUser()
  }

  render() {
    // When we first start up we'll want to check some things on behalf of the user
    // Show a spinner until that's done
    if (this.state.loading) {
      return (
        <MuiThemeProvider>
          <div>
            <Dragger />
            <Spinner />
            <Snackbar
              open={this.state.openError}
              message={this.state.errorMessage}
              autoHideDuration={4000}
              onRequestClose={this.handleErrorRequestClose}
            />
          </div>
        </MuiThemeProvider>
      )
    }

    // Otherwise we're good to go
    return (
      <MuiThemeProvider>
        <div>
          <Dragger username={this.state.user.name} />
          <div style={styles.Header} >
          </div>
          <div style={styles.Workspace}>
            <Files user={this.state.user} />
          </div>
          <Snackbar
            open={this.state.openError}
            message={this.state.errorMessage}
            autoHideDuration={4000}
            onRequestClose={this.handleErrorRequestClose}
          />
        </div>
      </MuiThemeProvider>
    )
  }
}

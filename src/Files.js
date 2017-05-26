import React, { Component } from 'react'
import CircularProgress from 'material-ui/CircularProgress'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import {List, ListItem} from 'material-ui/List'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
//import DeleteIcon from 'material-ui/svg-icons/action/delete-forever'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import FileIcon from 'material-ui/svg-icons/editor/insert-drive-file'
import FolderIcon from 'material-ui/svg-icons/file/folder-open'
import HomeIcon from 'material-ui/svg-icons/action/home'
import LinkIcon from 'material-ui/svg-icons/content/link'
import NewFolderIcon from 'material-ui/svg-icons/file/create-new-folder'
import OpenIcon from 'material-ui/svg-icons/action/open-in-new'
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh'
import SorryIcon from 'material-ui/svg-icons/social/sentiment-dissatisfied'

const electron = window.require('electron')
const execFile = electron.remote.require('child_process').execFile
const shell = electron.remote.shell
const app = electron.remote.app
const path = electron.remote.require('path')
const url = electron.remote.require('url')

const jnglCtl = app.getAppPath()+'/jnglctl/jnglctl'

const UpspinFile = 32
const UpspinLink = 62
const UpspinDir = 100

const style={
  File: {
    fontFamily: "Quicksand",
  },
  FileAction: {
    fontFamily: "Quicksand",
  },
  Link: {
    fontFamily: "Quicksand",
  },
  Directory: {
    fontFamily: "Quicksand",
  },
  FilesContainer: {
    fontFamily: "Quicksand",
    width: "100%",
  },
  FilesPaper: {
    fontFamily: "Quicksand",
    height: "calc(100vh - 135px)",
    overflowY: "auto",
  },
  FilesList: {
  },
  FilesButtonBar: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "lightgrey",
    width: "100%",
    zIndex: "3",
    height: "43px",
  },
  FilesButton: {
    cursor: "pointer",
    alignItems: "center",
    display: "flex",
  },
  UploadYourFirst: {
    marginTop: "100px",
    marginLeft: "50px",
    marginRight: "100px",
  },
  TopBarContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "-15px",
    marginBottom: "-10px",
    paddingRight: "10px",
  },
  GoBox: {
    marginLeft: "10px",
    marginBottom: "20px",
  },
  GoHintText: {
    textAlign: "right",
  },
  WaitSpinner: {
  },
  GoInput: {
    width: "650px",
  },
}

function fileSortCompare(fileA, fileB) {
  // Directories before links before files
  if (fileA.AttrChar > fileB.AttrChar) {
    return -1
  }
  if (fileA.AttrChar < fileB.AttrChar) {
    return 1
  }
  // Alphanumeric for things of the same type
  if (fileA.Name.toLowerCase() < fileB.Name.toLowerCase()) {
    return -1
  }
  if (fileA.Name.toLowerCase() > fileB.Name.toLowerCase()) {
    return 1
  }
  // Same file
  return 0
}

export default class Files extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cwd: this.makePath("/"),
      files: [],
      zDepth: 0,
      newFolderModal: false,
      openError: false,
      errorMessage: "",
      goToDir: "",
      waitSpinner: false,
    }
  }

  componentWillMount() {
    this.getFiles(this.makePath("/"))
  }

  // Returns a properly formatted path for this user
  makePath(path) {
    return this.props.user.name+path
  }

  // Updates the list of files for the current working directory in our state
  getFiles(path) {
    this.setState({waitSpinner: true})
    execFile(jnglCtl, ['ls', '-l', path], (error, stdout, stderr) => {
      if (error) {
        this.setState({waitSpinner: false, openError: true, errorMessage: "Failed to list the current directory"})
        console.log("error:", error)
        console.log("stderr:", stderr)
        return
      }
      const files = JSON.parse(stdout)
      if (files !== null) {
        files.sort(fileSortCompare)
      }
      this.setState({waitSpinner: false, files: files, cwd: path})
    })
  }

  // Navigates the user to their home directory
  goHome() {
    this.navigateFolder(this.makePath("/"))
  }

  // Navigates the files view to a new directory
  navigateFolder(path) {
    this.getFiles(path)
  }

  // Navigates the user to the parent directory
  navigatePrevious() {
    const previous = this.state.cwd.split("/").slice(0, -2).join("/")+"/"
    this.navigateFolder(previous)
  }

  onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.dropEffect = "copy";
    return false
  }

  onDragLeave(e) {
    e.preventDefault()
    return false
  }

  // Upload the file at path into the given destination directory
  uploadFile(user, path, dest) {
    execFile(jnglCtl, ['cp', path, dest], (error, stdout, stderr) => {
      if (error) {
        this.setState({openError: true, errorMessage: "Failed to upload file "+path})
        console.log("error:", error)
        console.log("stdout:", stdout)
      }
      this.getFiles(this.state.cwd)
    })
  }

  onDrop(e) {
    e.preventDefault()
    const filename = e.dataTransfer.files[0].name
    const path = e.dataTransfer.files[0].path
    this.uploadFile(this.props.user.name, path, this.state.cwd+filename)
    return false
  }

  newFolder() {
    this.setState({newFolderModal: true})
  }

  handleCancel() {
    this.setState({newFolderModal: false})
  }

  createFolder(name) {
    const folder = path.join(this.state.cwd, name)
    execFile(jnglCtl, ['mkdir', folder], (error, stdout, stderr) => {
      if (error) {
        this.setState({openError: true, errorMessage: "Unable to create directory "+folder})
        console.log("error:", error)
        console.log("stderr:", stderr)
        return
      }
      this.getFiles(this.state.cwd)
    })
  }

  handleCreate() {
    this.createFolder(this.refs.newFolderName.input.value)
    this.setState({newFolderModal: false})
  }

  handleErrorRequestClose = () => {
    this.setState({
      openError: false,
    })
  }

  goToDirChange(event, goToDir) {
    this.setState({goToDir: goToDir})
  }

  goToDirKeyPress(event) {
    if (event.charCode === 13) { // enter key
      event.preventDefault()
      this.goToDir()
    }
  }

  goToDir() {
    let location = this.state.goToDir.replace(/^upspin:\/\//g, '')
    // Last character should have a trailing slash
    if (location.slice(-1) !== '/') {
      location += '/'
    }
    console.log("location", location)
    this.setState({cwd: location})
    this.getFiles(location)
    this.setState({goToDir: ""})
  }

  render() {
    const that = this
    let files = <div></div>
    if (this.state.files === null) {
      files = <div style={style.UploadYourFirst}>Upload your first file by dragging and dropping one here</div>
    } else {
      files = this.state.files.map(function(file) {
        switch(file.AttrChar) {
          case UpspinDir:
            return (
              <div key={file.Name}>
                <ListItem style={style.Directory} primaryText={file.Name} secondaryText={file.Time} leftIcon={<FolderIcon />} onClick={that.navigateFolder.bind(that, file.Name)} />
                <Divider />
              </div>
            )
          case UpspinLink:
            return (
              <div key={file.Name}>
                <Link key={file.Name} file={file.Name} />
                <Divider />
              </div>
            )
          case UpspinFile:
            return (
              <div key={file.Name}>
                <File file={file} />
                <Divider />
              </div>
            )
          default:
            return <ListItem primaryText={'Unknown file: '+file.Name} secondaryText={'type: '+file.AttrChar} />
        }
      })
    }

    // Display the back button only if this directory is not the root directory
    let showBackButton = (this.state.cwd !== this.props.user.name+"/") ? "" : "hidden"

    // New Folder actions
    const newFolderActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCancel.bind(this)} />,
      <FlatButton label="Create" secondary={true} onTouchTap={this.handleCreate.bind(this)} />,
    ]

    // Our list of files in the current working directory
    return (
      <div style={style.FilesContainer}>
        <div style={style.TopBarContainer}>
          <div style={style.GoBox}>
            <TextField
              style={style.GoInput}
              hintStyle={style.GoHintText}
              hintText="yourbuddy@email.com/dir/file"
              onChange={this.goToDirChange.bind(this)}
              onKeyPress={this.goToDirKeyPress.bind(this)}
              autoFocus={true}
              value={this.state.goToDir}
            />
            <FlatButton primary={true} onClick={this.goToDir.bind(this)}>Go</FlatButton>
          </div>
          <WaitSpinner enabled={this.state.waitSpinner} />
        </div>
        <div style={style.FilesButtonBar}>
          <div className={showBackButton} style={style.FilesButton} onClick={that.navigatePrevious.bind(this)}><BackIcon style={{paddingRight: "10px"}} />Back</div>
          <div style={style.FilesButton} onClick={this.goHome.bind(this, this.state.cwd)}><HomeIcon style={{paddingRight: "10px"}} />Home</div>
          <div style={style.FilesButton} onClick={this.getFiles.bind(this, this.state.cwd)}><RefreshIcon style={{paddingRight: "10px"}} />Refresh</div>
          <div style={style.FilesButton} onClick={this.newFolder.bind(this, this.state.cwd)}><NewFolderIcon style={{paddingRight: "10px"}} />New Folder</div>
        </div>
        <div style={style.FilesPaper}
          onDragOver={this.onDragOver.bind(this)}
          onDragLeave={this.onDragLeave.bind(this)}
          onDrop={this.onDrop.bind(this)}
        >
          <List style={style.FilesList}>
            {files}
          </List>
        </div>
        <Dialog title="New Folder" actions={newFolderActions} modal={true} open={this.state.newFolderModal}>
          <TextField ref="newFolderName" autoFocus={true} />
        </Dialog>
        <Snackbar
          open={this.state.openError}
          message={this.state.errorMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleErrorRequestClose}
        />
      </div>
    )
  }
}

// sizeToText converts an integer value to a file size in B, KB, MB, or GB
function sizeToText(value) {
    let fileSize = value
    if (fileSize > 1024 * 1024 * 1024) {
      fileSize = Math.round(fileSize/(1024 * 1024)) + 'GB'
    } else if (fileSize > 1024 * 1024) {
      fileSize = Math.round(fileSize/(1024 * 1024)) + 'MB'
    } else if (fileSize > 1024) {
      fileSize = Math.round(fileSize/1024) + 'KB'
    } else {
      fileSize += 'B'
    }
    return fileSize
}

// File manages an individual file in the file list
class File extends Component {
  constructor(props) {
    super(props)
    this.state = {downloadSpinner: false, openSpinner: false, open: false}
  }

  handleToggle = () => {
    this.setState({open: !this.state.open})
  }

  handleNestedListToggle = (item) => {
    this.setState({open: item.state.open})
  }

  handleOpen = () => {
    this.setState({openSpinner: true})
    const parsed = url.parse(this.props.file.Name)
    const path = parsed.pathname
    const filename = parsed.pathname.split("/").pop()

    // We'll use downloads for now but should probably be a temp dir
    const fileLocation = app.getPath('home')+'/Downloads/'+filename

    execFile(jnglCtl, ['get', '-out='+fileLocation, path], (error, stdout, stderr) => {
        if (error) {
          this.setState({openSpinner: false, openError: true, errorMessage: "Failed to open file "+fileLocation})
          console.log(error)
          console.log(stderr)
          return
        }
        this.setState({openSpinner: false})
        shell.openItem(fileLocation)
    })
  }

  handleDownload = () => {
    this.setState({downloadSpinner: true})
    const parsed = url.parse(this.props.file.Name)
    const path = parsed.pathname
    const filename = parsed.pathname.split("/").pop()
    const fileLocation = app.getPath('home')+'/Downloads/'+filename
    execFile(jnglCtl, ['get', '-out='+fileLocation, path], (error, stdout, stderr) => {
        if (error) {
          this.setState({downloadSpinner: false, openError: true, errorMessage: "Failed to download file "+fileLocation})
          console.log(error)
          console.log("stderr:", stderr)
          return
        }
        this.setState({downloadSpinner: false})
        app.dock.downloadFinished(fileLocation)
        shell.showItemInFolder(fileLocation)
    })
  }

  handleDelete = () => {
    console.log("Deleting files not implemented")
  }

  onDragStart = (event) => {
    event.dataTransfer.setData("fileLocation", this.props.file.Name);
  }

  render () {
    let nestedItems = []
    if (this.state.open) {
      nestedItems = [
        <ListItem key={'open'}
          style={style.FileAction}
          leftIcon={<OpenIcon />}
          primaryText="Open"
          onClick={this.handleOpen}
        />,
        <ListItem key={'download'}
          style={style.FileAction}
          leftIcon={<DownloadIcon />}
          primaryText="Download"
          onClick={this.handleDownload}
        />,
        // <ListItem key={'delete'} leftIcon={<DeleteIcon />} primaryText="Delete" onClick={this.handleDelete} />,
      ]
    }
    const secondaryText = this.props.file.Time+' '+sizeToText(this.props.file.SizeOf)
    if (this.state.openSpinner || this.state.downloadSpinner) {
      return (
        <div>
          <ListItem key={this.props.file.Name} style={style.File}
            primaryText={this.props.file.Name} secondaryText={secondaryText}
            leftIcon={<FileIcon />}
            rightIcon={<CircularProgress />}
            initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={nestedItems}
            onClick={this.handleToggle}
            draggable={true} onDragStart={this.onDragStart}
          />
        </div>
      )
    } else {
      return (
        <div>
          <ListItem key={this.props.file.Name} style={style.File}
            primaryText={this.props.file.Name} secondaryText={secondaryText}
            leftIcon={<FileIcon />}
            initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={nestedItems}
            onClick={this.handleToggle}
            draggable={true} onDragStart={this.onDragStart}
          />
        </div>
      )
    }
  }
}

// Link manages an individual link in the file list
// It's unclear how to distinguise a link to a file from a link to a directory
class Link extends Component {
  constructor(props) {
    super(props)
    this.state = {open: false}
  }

  handleToggle = () => {
    this.setState({open: !this.state.open})
  }

  handleNestedListToggle = (item) => {
    this.setState({open: item.state.open})
  }

  render () {
    let nestedItems = []
    if (this.state.open) {
      nestedItems = [
        <ListItem key={'open'} leftIcon={<SorryIcon />} primaryText="Sorry, link following is coming soon" />,
      ]
    }
    return (
      <div>
        <ListItem key={this.props.file} style={style.Link} primaryText={this.props.file} leftIcon={<LinkIcon />} initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={nestedItems} onClick={this.handleToggle} />
      </div>
    )
  }
}

class WaitSpinner extends Component {
  render() {
    if (this.props.enabled) {
      return <CircularProgress />
    } else {
      return <div></div>
    }
  }
}
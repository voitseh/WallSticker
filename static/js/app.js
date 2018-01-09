import RaisedButtonPush from './components/RaisedButton';
import RaisedButtonApply from './components/ApplyButton';
import RaisedButtonDownload from './components/DownloadButton';
import PaperComponent from './components/Paper';
import FloatingButtonPlus from './components/FloatingActionButton';
import ToggleExampleSimple from './components/ModeToggle';
import LinearProgressExampleDeterminate from './components/LinearProgress';
import ManuallyForm from './components/ManuallyModeForm';
import AutoForm from './components/AutoModeForm';
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
/*
const _AutoForm = () => (
    <MuiThemeProvider>
      <AutoForm />
    </MuiThemeProvider>
);*/
// add Paper component when new frame creates
window.FramePaper = function FramePaper() {
  addFrame(20);
  for (var i = 0; i <= $('#imgsHolder').children().length; i++) {
    if ($('#imgsHolder').children()[i] != undefined) {
      if (i != 0) {
        ReactDOM.render(<MuiThemeProvider><PaperComponent /></MuiThemeProvider>, $('#imgsHolder').children()[i].firstChild);
      }
      if ($('#imgsHolder').children()[i].lastChild.firstElementChild != undefined) {
        ReactDOM.render(<MuiThemeProvider><PaperComponent /></MuiThemeProvider>, $('#imgsHolder').children()[i].lastChild.firstChild);
      }
    }

  }
} 
ReactDOM.render(<MuiThemeProvider><PaperComponent /></MuiThemeProvider>, document.getElementById('paper'));
ReactDOM.render(<MuiThemeProvider><RaisedButtonPush /></MuiThemeProvider>, document.getElementById('buttonPush'));
ReactDOM.render(<MuiThemeProvider><FloatingButtonPlus /></MuiThemeProvider>, document.getElementById('buttonPlus'));
ReactDOM.render(<MuiThemeProvider><RaisedButtonDownload /></MuiThemeProvider>, document.getElementById('buttonDownload'));
ReactDOM.render(<MuiThemeProvider><RaisedButtonApply /></MuiThemeProvider>, document.getElementById('buttonApply'));
ReactDOM.render(<MuiThemeProvider><ToggleExampleSimple /></MuiThemeProvider>, document.getElementById('toggle'));
ReactDOM.render(<MuiThemeProvider><ManuallyForm /></MuiThemeProvider>, document.getElementById('manuallyModeReact'));
ReactDOM.render(<MuiThemeProvider><AutoForm /></MuiThemeProvider>, document.getElementById('autoModeReact'));
ReactDOM.render(<MuiThemeProvider><LinearProgressExampleDeterminate /></MuiThemeProvider>, document.getElementById('linearProgress'));


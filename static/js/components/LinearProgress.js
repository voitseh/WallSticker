import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';

// thid method is called from main.js 
window.setPercent = function setPercent(percent) {
  LinearProgressExampleDeterminate.progress(percent);
}

export default class LinearProgressExampleDeterminate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      completed: 0,
    };
    LinearProgressExampleDeterminate.progress = LinearProgressExampleDeterminate.progress.bind(this);
  }

  static progress(completed) {
    this.setState({ completed });
  }

  render() {
    return (
      <LinearProgress mode="determinate" value={this.state.completed} />
    );
  }
}

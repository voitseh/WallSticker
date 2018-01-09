import React, { Component } from 'react';
import Slider from 'material-ui/Slider';
/**
 * The slider bar can have a set minimum and maximum, and the value can be
 * obtained through the value parameter fired on an onChange event.
 */
const styles = {
  block: {
    height: 50,
  },
  label: {
    height: 0,
  },
  slider: {
    width: 300,
  },
};

$("#layer2").mousemove(function (e) {
  // update zoom slider when sticker anchors are dragged
  if (draggingResizer > -1) {
    SliderZoomControlled.componentWillUpdate();
  }
  // update horizontal and vertical sliders when sticker is dragged
  if (draggingImage) {
    SliderHorizontalControlled.componentWillUpdate();
    SliderVerticalControlled.componentWillUpdate();
  }
});

window.setDefaultManuallyMode = function setDefaultManuallyMode() {
  SliderZoomControlled.setDefaultState();
  SliderHorizontalControlled.setDefaultState();
  SliderVerticalControlled.setDefaultState();
  SliderOpacityControlled.setDefaultState();
  opacity = 1;
}

class SliderZoomControlled extends Component {

  constructor(props) {
    super(props);
    this.state = {
      zoomSlider: 100,
    };
    this.handleZoomSlider = this.handleZoomSlider.bind(this);
    SliderZoomControlled.componentWillUpdate = SliderZoomControlled.componentWillUpdate.bind(this);
    SliderZoomControlled.setDefaultState = SliderZoomControlled.setDefaultState.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  static setDefaultState() {
    this.setState({ zoomSlider: 100, });
  }

  static componentWillUpdate() {
    this.setState({ zoomSlider: Math.round(newScale) });
  }

  handleZoomSlider(event, value) {
    this.setState({ zoomSlider: value });
    scale = value / 100;
    imageWidth = sticker.width * scale;
    imageHeight = sticker.height * scale;
    imageRight = imageWidth + imageX;
    imageBottom = imageHeight + imageY;
    if (pushedFrameId != 0) {
      draw(true, false);
    }
  }

  render() {
    return (
      <div style={styles.block}>
        <p style={styles.label}>
          <span>{'Zoom ('}</span>
          <span>{this.state.zoomSlider}</span>
          <span>{'%)'}</span>
        </p>
        <Slider style={styles.slider}
          min={20}
          max={500}
          step={1}
          value={this.state.zoomSlider}
          onChange={this.handleZoomSlider}
        />
      </div>
    );
  }
}

class SliderHorizontalControlled extends Component {

  constructor(props) {
    super(props);
    this.state = {
      horizontalSlider: 0,
    };
    this.handleHorizontalSlider = this.handleHorizontalSlider.bind(this);
    SliderHorizontalControlled.componentWillUpdate = SliderHorizontalControlled.componentWillUpdate.bind(this);
    SliderHorizontalControlled.setDefaultState = SliderHorizontalControlled.setDefaultState.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  static setDefaultState() {
    this.setState({ horizontalSlider: 0, });
  }

  static componentWillUpdate() {
    this.setState({ horizontalSlider: imageX });
  }

  handleHorizontalSlider(event, value) {
    this.setState({ horizontalSlider: value });
    imageX = value;
    imageRight = imageWidth + imageX;
    if (pushedFrameId != 0) {
      draw(true, false);
    }
  }

  render() {
    return (
      <div style={styles.block}>
        <p style={styles.label}>
          <span>{'X position ('}</span>
          <span>{this.state.horizontalSlider}</span>
          <span>{')'}</span>
        </p>
        <Slider style={styles.slider}
          id={'temp'}
          min={-100}
          max={400}
          step={1}
          value={this.state.horizontalSlider}
          onChange={this.handleHorizontalSlider}
        />
      </div>
    );
  }
}

class SliderVerticalControlled extends Component {

  constructor(props) {
    super(props);
    this.state = {
      verticalSlider: 0,
    };
    this.handleVerticalSlider = this.handleVerticalSlider.bind(this);
    SliderVerticalControlled.componentWillUpdate = SliderVerticalControlled.componentWillUpdate.bind(this);
    SliderVerticalControlled.setDefaultState = SliderVerticalControlled.setDefaultState.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  static setDefaultState() {
    this.setState({ verticalSlider: 0, });
  }

  static componentWillUpdate() {
    this.setState({ verticalSlider: imageY });
  }

  handleVerticalSlider(event, value) {
    this.setState({ verticalSlider: value });
    imageY = value;
    imageBottom = imageHeight + imageY;
    if (pushedFrameId != 0) {
      draw(true, false);
    }
  }

  render() {
    return (
      <div style={styles.block}>
        <p style={styles.label}>
          <span>{'Y position ('}</span>
          <span>{this.state.verticalSlider}</span>
          <span>{')'}</span>
        </p>
        <Slider style={styles.slider}
          min={-100}
          max={300}
          step={1}
          value={this.state.verticalSlider}
          onChange={this.handleVerticalSlider}
        />
      </div>
    );
  }
}

class SliderOpacityControlled extends Component {

  constructor(props) {
    super(props);
    this.state = {
      opacitySlider: 1,
    };
    this.handleOpacitySlider = this.handleOpacitySlider.bind(this);
    SliderOpacityControlled.setDefaultState = SliderOpacityControlled.setDefaultState.bind(this);
  }

  static setDefaultState() {
    this.setState({ opacitySlider: 1, });
  }

  handleOpacitySlider(event, value) {
    this.setState({ opacitySlider: value });
    opacity = value;
    if (pushedFrameId != 0) {
      draw(true, false);
    }

  }

  render() {
    return (
      <div style={styles.block}>
        <p style={styles.label}>
          <span>{'Opacity ('}</span>
          <span>{this.state.opacitySlider}</span>
          <span>{')'}</span>
        </p>
        <Slider style={styles.slider}
          value={this.state.opacitySlider}
          onChange={this.handleOpacitySlider}
        />
      </div>
    );
  }
}

export default class ManuallyForm extends React.Component {

  render() {
    return (
      <div>
        <SliderZoomControlled />
        <SliderHorizontalControlled />
        <SliderVerticalControlled />
        <SliderOpacityControlled />
      </div>
    );
  }
}

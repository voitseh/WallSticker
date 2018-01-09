import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from "material-ui/TextField";
import Slider from 'material-ui/Slider';

const styles = {
  block: {
    maxWidth: 250,
  },
  checkbox: {
    marginTop: 16,
    width: 100,
  },
  tileX: {
    marginTop: 30,
    marginLeft: 80,
    width: 50,
  },
  tileY: {
    marginTop: -100,
    marginRight: 80,
    width: 50,
  },
  opacity: {
    width: 300,
  },
};
// this function is called from main.js
window.setDefaultAutoMode = function setDefaultAutoMode() {
  CheckboxStickerCenter.setDefaultState();
  TextFieldX.setDefaultState();
  TextFieldY.setDefaultState();
  SliderOpacity.setDefaultState();
}

class CheckboxStickerCenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
    this.updateCheck = this.updateCheck.bind(this);
    CheckboxStickerCenter.setDefaultState = CheckboxStickerCenter.setDefaultState.bind(this);
  }
  static setDefaultState() {

    this.setState({ checked: false, });
  }

  updateCheck() { //$("#autoMode").submit();
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      };
    });
  }
  render() {
    return (
      <div style={styles.block}>
        <Checkbox ref="myField"
          label="Center"
          checked={this.state.checked}
          onCheck={this.updateCheck.bind(this)}
          style={styles.checkbox}
          name="sticker_center"
        />
      </div>
    );
  }
}

class TextFieldX extends React.Component {
  constructor(props) {
    super(props);
    TextFieldX.setDefaultState = TextFieldX.setDefaultState.bind(this);
    TextFieldX.getValueX = TextFieldX.getValueX.bind(this);
  }

  static setDefaultState() {
    this.refs.tile_x.getInputNode().value = '1';
  }

  static getValueX() {
    $('#autoMode').submit();
    sijax_data('curFrameItems', imagesDict)
    TextFieldY.setDefaultState();
    return this.refs.tile_x.getValue();
  };

  render() {
    return (
      <div style={styles.tileX}>
        <p>
          <span>{'Tile X'}</span>
        </p>

        <TextField
          ref='tile_x'
          defaultValue="1"
          type="number"
          name="repeat_x"
          onChange={TextFieldX.getValueX}
        />
      </div>
    );
  }
}

class TextFieldY extends React.Component {
  constructor(props) {
    super(props);
    TextFieldY.setDefaultState = TextFieldY.setDefaultState.bind(this);
    TextFieldY.getValueY = TextFieldY.getValueY.bind(this);
  }

  static setDefaultState() {
    this.refs.tile_y.getInputNode().value = '1';
  }

  static getValueY() {
    $('#autoMode').submit();
    sijax_data('curFrameItems', imagesDict)
    TextFieldX.setDefaultState();
    return this.refs.tile_y.getValue();
  };

  render() {
    return (
      <div style={styles.tileY}>
        <p>
          <span>{'Tile Y'}</span>
        </p>
        <TextField
          ref='tile_y'
          defaultValue="1"
          type="number"
          name="repeat_y"
          onChange={TextFieldY.getValueY}
        />
      </div>
    );
  }
}

class SliderOpacity extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      opacitySlider: 1,
    };
    this.handleOpacitySlider = this.handleOpacitySlider.bind(this);
    SliderOpacity.setDefaultState = SliderOpacity.setDefaultState.bind(this);
  }
  static setDefaultState() {

    this.setState({ opacitySlider: 1, });
  }

  handleOpacitySlider(event, value) {
    // submit form when slider dragging
    $('#autoMode').submit();
    this.setState({ opacitySlider: value });
    sijax_data('curFrameItems', imagesDict)
  }

  render() {
    return (
      <div style={styles.opacity}>
        <p>
          <span>{'Opacity ('}</span>
          <span>{this.state.opacitySlider}</span>
          <span>{')'}</span>
        </p>
        <Slider
          step={0.10} value={0.5}
          value={this.state.opacitySlider}
          onChange={this.handleOpacitySlider}
          name="opacity"
        />
      </div>
    );
  }
}

export default class AutoForm extends React.Component {

  render() {
    return (
      <div>
        <CheckboxStickerCenter />
        <TextFieldX />
        <TextFieldY />
        <SliderOpacity />
      </div>
    );
  }
}


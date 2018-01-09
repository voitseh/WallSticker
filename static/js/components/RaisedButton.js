import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  margin: 12,
};

const RaisedButtonPush = () => (
  <div>
    <RaisedButton label="Push" primary={true} style={style} onClick={() => pushToGallery()} />
  </div>
);

export default RaisedButtonPush;
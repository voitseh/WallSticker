import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  margin: 20,
};

const RaisedButtonApply = () => (
  <div>
    <RaisedButton label="Apply" primary={true} style={style} onClick={() => onApply()} />
  </div>
);

export default RaisedButtonApply;

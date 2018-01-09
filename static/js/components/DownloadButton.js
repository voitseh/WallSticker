import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  marginTop: 20,
};

const RaisedButtonDownload = () => (
  <div>
    <RaisedButton label="Download" primary={true} style={style} onClick={() => onDownload()} />
  </div>
);

export default RaisedButtonDownload;

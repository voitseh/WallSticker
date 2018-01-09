import React from 'react';
import Paper from 'material-ui/Paper';

const style = { 
  height: 120,
  width: 120,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
};

const PaperComponent = () => (  
  <div>
    <Paper style={style} zDepth={3} />
  </div>
);

export default PaperComponent;


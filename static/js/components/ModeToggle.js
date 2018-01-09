import React from 'react';
import Toggle from 'material-ui/Toggle';

const styles = {
  block: {
    maxWidth: 250,
  },
  toggle: {
    marginBottom: 16,
  },
};

const ToggleExampleSimple = () => (
  <div style={styles.block}>
    <Toggle id='toggle'
      style={styles.toggle}
    />
  </div>
);

export default ToggleExampleSimple;
import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

const style = {
  marginRight: 20,
};
/**
 * Default size and `mini` FABs, in primary (default), `secondary` and `disabled` colors.
 */
const FloatingButtonPlus = () => (

  <div>
    <FloatingActionButton style={style} onClick={() => FramePaper()}>
      <ContentAdd />
    </FloatingActionButton>
  </div>

);

export default FloatingButtonPlus;

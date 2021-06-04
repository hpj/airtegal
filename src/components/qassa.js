
import React, { createRef } from 'react';

import PropTypes from 'prop-types';

import ShareIcon from 'mdi-react/ShareVariantIcon';

import getTheme from '../colors.js';

import { createStyle, createAnimation } from 'flcss';

import i18n, { locale } from '../i18n.js';

const colors = getTheme();

/**
* @param { { key: string, block: import('./roomOverlay').Block, allowed: boolean } } param0
*/
const Block = ({ block, allowed }) =>
{
  return <div className={ styles.container }>
    { block.requires }
  </div>;
};

Block.propTypes = {
  required: PropTypes.string,
  block: PropTypes.object.isRequired
};

const styles = createStyle({
  container: {

  }
});

export default Block;
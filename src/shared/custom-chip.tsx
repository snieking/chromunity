import React from 'react';
import { Chip } from '@material-ui/core';
import { isBright, stringToHexColor } from './util/util';
import { COLOR_CHROMIA_DARK, COLOR_OFF_WHITE } from '../theme';

interface Props {
  tag: string;
}

const CustomChip: React.FunctionComponent<Props> = (props) => {
  const backgroundColor = stringToHexColor(props.tag);

  return (
    <Chip
      size="small"
      label={`#${props.tag}`}
      style={{
        marginLeft: '1px',
        marginRight: '1px',
        marginBottom: '3px',
        backgroundColor,
        cursor: 'pointer',
        color: isBright(backgroundColor) ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE,
      }}
    />
  );
};

export default CustomChip;

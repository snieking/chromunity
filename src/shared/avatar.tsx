import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles({
  avatar: {
    borderRadius: '50%',
  },
  xSmall: {
    width: '30px',
    height: '30px',
  },
  small: {
    width: '40px',
    height: '40px',
  },
  medium: {
    width: '60px',
    height: '60px',
  },
  large: {
    width: '70px',
    height: '70px',
  },
});

export enum AVATAR_SIZE {
  X_SMALL,
  SMALL,
  MEDIUM,
  LARGE,
}

interface Props {
  src: string;
  name?: string;
  size: AVATAR_SIZE;
  onClick?: () => void;
}

const Avatar: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles(props);

  const avatar = () => (
    <img
      src={props.src}
      className={`
                ${classes.avatar}
                ${props.size === AVATAR_SIZE.X_SMALL ? classes.xSmall : ''}
                ${props.size === AVATAR_SIZE.SMALL ? classes.small : ''}
                ${props.size === AVATAR_SIZE.MEDIUM ? classes.medium : ''}
                ${props.size === AVATAR_SIZE.LARGE ? classes.large : ''}
            `}
      alt="Profile Avatar"
      onClick={() => props.onClick != null && props.onClick()}
    />
  );

  return props.name != null ? <a href={`/u/${props.name}`}>{avatar()}</a> : avatar();
};

export default Avatar;

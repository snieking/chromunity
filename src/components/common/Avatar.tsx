import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";

export enum AVATAR_SIZE {
    SMALL,
    MEDIUM,
    LARGE
}

interface Props {
    src: string;
    size: AVATAR_SIZE;
    onClick?: Function;
}

const Avatar: React.FunctionComponent<Props> = (props) => {
    const classes = useStyles(props);
    return (
        <img
            src={props.src}
            className={`
                ${classes.avatar}
                ${props.size === AVATAR_SIZE.SMALL ? classes.small : ''}
                ${props.size === AVATAR_SIZE.MEDIUM ? classes.medium : ''}
                ${props.size === AVATAR_SIZE.LARGE ? classes.large : ''}
            `}
            alt="Profile Avatar"
            onClick={() => props.onClick()}
        />
    );
};

const useStyles = makeStyles({
    avatar: {
        borderRadius: "50%"
    },
    small: {
        width: "40px",
        height: "40px"
    },
    medium: {
        width: "60px",
        height: "60px"
    },
    large: {
        width: "70px",
        height: "70px"
    }
});

export default Avatar;
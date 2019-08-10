import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import {COLOR_CHROMIA_DARK, COLOR_STEEL_BLUE} from "../../theme";

export enum AVATAR_SIZE {
    SMALL,
    MEDIUM,
    LARGE
}

interface Props {
    src: string;
    size: AVATAR_SIZE;
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
        />
    );
};

const useStyles = makeStyles({
    avatar: {
        borderRadius: "50%",
        border: "1px solid",
        borderColor: COLOR_STEEL_BLUE,
        backgroundColor: COLOR_CHROMIA_DARK
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
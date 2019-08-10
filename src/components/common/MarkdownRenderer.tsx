import React from 'react';
import * as ReactMarkdown from "react-markdown";
import {makeStyles} from "@material-ui/core";
import {COLOR_OFF_WHITE} from "../../theme";

interface Props {
    text: string
}

const MarkdownRenderer: React.FunctionComponent<Props> = (props) => {
    const classes = useStyles(props);
    return (
        <ReactMarkdown className={classes.text} source={props.text} disallowedTypes={["heading"]}/>
    )
};

const useStyles = makeStyles({
    text: {
        color: COLOR_OFF_WHITE
    }
});

export default MarkdownRenderer;
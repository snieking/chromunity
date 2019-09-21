import React from "react";
import * as ReactMarkdown from "react-markdown";
import { makeStyles } from "@material-ui/core";
import { COLOR_CHROMIA_DARK, COLOR_OFF_WHITE } from "../../theme";

interface Props {
  text: string;
}

const MarkdownRenderer: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  return (
    <ReactMarkdown
      className={classes.text}
      source={props.text}
      disallowedTypes={["heading", "image", "imageReference"]}
    />
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    color: theme.palette.type === "light" ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE,
    overflowWrap: "break-word",
    wordWrap: "break-word",
    webkitHyphens: "auto",
    msHyphens: "auto",
    mozHyphens: "auto",
    hyphens: "auto"
  },
}));

export default MarkdownRenderer;

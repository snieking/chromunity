import React from "react";
import * as ReactMarkdown from "react-markdown";
import { makeStyles } from "@material-ui/core";
import { COLOR_CHROMIA_DARK, COLOR_OFF_WHITE } from "../../theme";

const useStyles = makeStyles(theme => ({
  text: {
    color: theme.palette.type === "light" ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE,
    overflowWrap: "break-word",
    wordWrap: "break-word",
    '& a': {
      wordBreak: "break-all"
    },
    '& img': {
      maxWidth: "95%",
      maxHeight: "95%",
      [theme.breakpoints.down("sm")]: {
        maxWidth: "80%",
        maxHeight: "80%"
      }
    }
  },
}));

interface Props {
  text: string;
}

const MarkdownRenderer: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  return (
    <ReactMarkdown
      className={classes.text}
      source={props.text}
      disallowedTypes={["heading"]}
      linkTarget="_blank"
    />
  );
};

export default MarkdownRenderer;

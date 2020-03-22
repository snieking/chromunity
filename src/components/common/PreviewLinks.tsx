import React from "react";
import { ReactTinyLink } from "react-tiny-link";
import makeStyles from "@material-ui/core/styles/makeStyles";

interface Props {
  text: string;
  size: "small" | "large";
}

const useStyles = makeStyles(theme => ({
  tinyLink: {
    marginBottom: "10px"
  }
}));

const REGEX = /https?:\/\/(?![^" ]*(?:jpg|jpeg|png|gif))[^" ]+/gi;

const PreviewLinks: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  function getLastLink(): string {
    const urls = props.text.match(REGEX);
    return urls && urls.length > 0 ? urls[urls.length - 1] : null;
  }

  function renderTinyLink(url: string) {
    if (url) {
      return (<div className={classes.tinyLink}>
        <ReactTinyLink cardSize={props.size} showGraphic={true} maxLine={2} minLine={1} url={url} />
      </div>);
    } else {
      return <div />;
    }
  }

  return renderTinyLink(getLastLink());
};

export default PreviewLinks;

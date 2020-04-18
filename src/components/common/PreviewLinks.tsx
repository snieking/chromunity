import React from "react";
import { ReactTinyLink } from "react-tiny-link";
import * as ResponsiveEmbed from "react-responsive-embed";
import makeStyles from "@material-ui/core/styles/makeStyles";

interface Props {
  text: string;
}

const useStyles = makeStyles(theme => ({
  tinyLink: {
    marginBottom: "5px"
  },
  iframeWrapper: {
    width: "60%"
  }
}));

const URL_REGEX = /\(?https?:\/\/(?![^" ]*(?:jpg|jpeg|png|gif))[^" \s)]+/gi;
const YOUTUBE_ID_REGEX = /^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

const PRIORITY_REGEXPS: RegExp[] = [ YOUTUBE_ID_REGEX ];
const SKIP_REGEXPS: RegExp[] = [
  /twitter.com.*/
];

const PreviewLinks: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  function getPreviewLink(): string {
    const urls = props.text.match(URL_REGEX);

    if (urls == null)
      return null;

    
    for (const regexp of PRIORITY_REGEXPS) {
      for (const url of urls) {
        if (url.match(regexp)) {
          return url;
        }
      }
    }

    for (let i = urls.length - 1; i >= 0; i--) {
      const url = urls[i];

      if (!url.startsWith("(")) {
        // Check so that the URL shouldn't be skipped
        let skip = false;
        for (const regexp of SKIP_REGEXPS) {
          if (url.match(regexp)) {
            skip = true;
            break;
          }
        }

        if (!skip)
          return url;
      }
    }

    return null;
  }

  function isValidYouTubeUrl(url: string) {
    if (url !== undefined || url !== "") {
      const match = url.match(YOUTUBE_ID_REGEX);
      return match && match[2].length >= 11;
    }

    return false;
  }

  function parseYouTubeVideoId(url: string) {
    const match = url.match(YOUTUBE_ID_REGEX);
    return match && match[2].length >= 11 ? match[2] : null;
  }

  function getLink(url: string) {
    if (isValidYouTubeUrl(url)) {
      const id = parseYouTubeVideoId(url);
      return (
        <div className={classes.iframeWrapper}>
        <ResponsiveEmbed src={"https://www.youtube.com/embed/" + id} ratio="16:9" allowFullScreen />
        </div>
      )
    } else {
      return <ReactTinyLink
        cardSize={"small"}
        showGraphic={true}
        maxLine={2}
        minLine={1}
        url={url}
        proxyUrl={"https://cors-anywhere.herokuapp.com"}
      />;
    }
  }

  function renderLink(url: string) {
    if (url) {
      return (<div className={classes.tinyLink}>
        {getLink(url)}
      </div>);
    } else {
      return <div />;
    }
  }

  return renderLink(getPreviewLink());
};

export default PreviewLinks;

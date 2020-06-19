import React, { useState, useEffect } from "react";
import { Badge, makeStyles } from "@material-ui/core";
import ChromiaPageHeader from "../../../shared/chromia-page-header";
import { countTopicsInChannel } from "../../../core/services/topic-service";

interface Props {
  channel: string;
}

const useStyles = makeStyles({
  title: {
    position: "relative",
    top: -10,
  },
});

const ChannelTitle: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const [nrOfTopics, setNrOfTopics] = useState(0);

  useEffect(() => {
    if (props.channel) {
      countTopicsInChannel(props.channel).then((count) => setNrOfTopics(count));
    }
  }, [props.channel]);

  return (
    <Badge badgeContent={nrOfTopics} color="secondary" overlap="rectangle">
      <div className={classes.title}>
        <ChromiaPageHeader text={"#" + props.channel} />
      </div>
    </Badge>
  );
};

export default ChannelTitle;

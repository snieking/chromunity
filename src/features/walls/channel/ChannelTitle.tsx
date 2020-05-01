import React from "react";
import { Badge, makeStyles } from "@material-ui/core";
import ChromiaPageHeader from "../../../shared/ChromiaPageHeader";

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

  return (
    <Badge badgeContent={1} color="secondary" overlap="rectangle">
      <div className={classes.title}>
        <ChromiaPageHeader text={"#" + props.channel} />
      </div>
    </Badge>
  );
};

export default ChannelTitle;

import React from "react";
import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { COLOR_CHROMIA_DARK, COLOR_SOFT_PINK } from "../../theme";

const useStyles = makeStyles({
  badgeWrapper: {
    backgroundColor: COLOR_SOFT_PINK,
    position: "relative",
    top: 3,
    left: -14,
    transform: "rotateY(0deg) rotate(315deg)",
    textAlign: "center",
    width: "50px",
    float: "left"
  },
  text: {
    position: "relative",
    bottom: "-2px",
    fontSize: "11px",
    color: COLOR_CHROMIA_DARK
  }
});

const NewBadge: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.badgeWrapper}>
      <Typography variant="body2" component="span" className={classes.text}>
        NEW
      </Typography>
    </div>
  );
};

export default NewBadge;

import React from "react";
import Typography from "@material-ui/core/Typography";
import useTheme from "@material-ui/core/styles/useTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { COLOR_CHROMIA_DARK, COLOR_CHROMIA_DARKER, COLOR_OFF_WHITE } from "../../../theme";

interface Props {
  text: string;
  votes: number;
  total: number;
  selected: boolean;
}

const useStyles = makeStyles(theme => ({
  wrapper: {
    border: "1px solid",
    borderColor: COLOR_CHROMIA_DARKER,
    position: "relative",
    marginTop: "5px",
    marginBottom: "10px"
  },
  textWrapper: {
    margin: "10px"
  },
  text: {
    textShadow: `-0.7px -0.7px 0 ${theme.palette.type === "dark" ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE}, 0.7px -0.7px 0 ${
      theme.palette.type === "dark" ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE
    }, -0.7px 0.7px 0 ${theme.palette.type === "dark" ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE}, 0.7px 0.7px 0 ${
      theme.palette.type === "dark" ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE
    }`
  },
  percentage: {
    marginRight: "20px"
  }
}));

const PollOptionStats: React.FunctionComponent<Props> = props => {
  const theme = useTheme();
  const classes = useStyles();

  const percentageOfVotes = (props.votes / props.total) * 100;

  return (
    <>
      <div
        className={classes.wrapper}
        style={{
          backgroundColor: props.selected ? theme.palette.secondary.main : theme.palette.primary.main,
          transition: "width .2s ease-in",
          width: `${percentageOfVotes}%`
        }}
      >
        <div className={classes.textWrapper}>
          <Typography id={props.text} className={classes.text} gutterBottom>
            <span className={classes.percentage}>{Math.round(percentageOfVotes)}%</span>
            {props.text}
          </Typography>
        </div>
      </div>
    </>
  );
};

export default PollOptionStats;

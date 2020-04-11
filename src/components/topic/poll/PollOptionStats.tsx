import React, { useEffect, useState } from "react";
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
    zIndex: 9999
  },
  percentage: {
    marginRight: "20px"
  }
}));

const PollOptionStats: React.FunctionComponent<Props> = props => {
  const theme = useTheme();
  const classes = useStyles();

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const percentageOfVotes = (props.votes / props.total) * 100;

  return (
    <>
      <div
        className={classes.wrapper}
        style={{
          opacity: props.selected ? 1 : 0.5,
          backgroundColor: theme.palette.secondary.main,
          transition: "width .2s ease-in",
          width: `${percentageOfVotes}%`
        }}
      >
        <div className={classes.textWrapper}>
          <Typography id={props.text} className={classes.text} style={{ minWidth: width*0.7 }} gutterBottom>
            <span className={classes.percentage}>{Math.round(percentageOfVotes)}%</span>
            {props.text}
          </Typography>
        </div>
      </div>
    </>
  );
};

export default PollOptionStats;

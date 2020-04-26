import React from "react";
import { Badge, makeStyles, IconButton } from "@material-ui/core";
import { StarRate, StarBorder } from "@material-ui/icons";
import { COLOR_YELLOW } from "../../theme";

interface Props {
  ratedBy: string[];
  ratedByMe: boolean;
  toggleRating: () => void;
  className?: string;
}

const useStyles = makeStyles({
  icon: {
    color: COLOR_YELLOW,
  },
});

const StarRatingPresentation: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  console.log(props);

  function render() {
    if (props.toggleRating) {
      return (
        <IconButton data-tut="star_btn" aria-label="Like" onClick={props.toggleRating}>
          {icon()}
        </IconButton>
      );
    } else {
      return icon();
    }
  }

  function icon() {
    return (
      <Badge color="secondary" badgeContent={props.ratedBy.length}>
        {props.ratedByMe ? <StarRate className={classes.icon} /> : <StarBorder />}
      </Badge>
    );
  }

  return (
    <div className={props.className}>
      {render()}
    </div>
  );
};

export default StarRatingPresentation;

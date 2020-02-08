import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { COLOR_ORANGE } from "../../theme";
import { CreateCSSProperties } from "@material-ui/core/styles/withStyles";

const cardStyle: CreateCSSProperties = { textAlign: "center" };

const statsDescrStyle = (theme: Theme): CreateCSSProperties => ({
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    marginTop: "5px",
    display: "block"
  },
  [theme.breakpoints.up("md")]: {
    display: "inline",
    marginLeft: "15px"
  }
});

export const representativeCardStyles = (theme: Theme) =>
  createStyles({
    representativeCard: cardStyle,
    link: {
      color: COLOR_ORANGE
    },
    statsDescr: statsDescrStyle(theme)
  });

export const electionCandidateCardStyles = makeStyles(theme =>
  createStyles({
    candidateCard: cardStyle,
    statsDescr: statsDescrStyle(theme),
    votedFor: {
      border: "solid 3px",
      borderColor: theme.palette.secondary.main
    },
    voteBtn: {
      marginBottom: "2px"
    }
  })
);

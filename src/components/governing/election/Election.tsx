import React from "react";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  createStyles,
  Grid,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import Countdown from "react-countdown-now";
import {
  getElectionCandidates,
  getElectionVoteForUser,
  getNextElectionTimestamp,
  signUpForElection,
  voteForCandidate
} from "../../../blockchain/ElectionService";
import { getUser, isGod } from "../../../util/user-util";
import DictatorActions from "./dictator/DictatorActions";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import { ChromunityUser } from "../../../types";
import { initGA, pageView } from "../../../GoogleAnalytics";
import ElectionCandidateCard from "./ElectionCandidateCard";

const styles = createStyles({
  electionCard: {
    textAlign: "center",
    marginTop: "28px"
  }
});

interface Props extends WithStyles<typeof styles> {}

export interface ElectionState {
  timestamp: number;
  activeElection: boolean;
  electionId: string;
  votedFor: string;
  isACandidate: boolean;
  electionCandidates: string[];
  user: ChromunityUser;
}

// Renderer callback with condition
// @ts-ignore
const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    window.location.href = "/";
    return <div />;
  } else {
    // Render a countdown
    return (
      <div>
        <Typography gutterBottom variant="h5" component="h5">
          {days}:{hours}:{minutes}.{seconds}
        </Typography>
      </div>
    );
  }
};

const Election = withStyles(styles)(
  class extends React.Component<Props, ElectionState> {
    constructor(props: Props) {
      super(props);
      this.state = {
        activeElection: false,
        electionId: "",
        timestamp: Date.now(),
        votedFor: "",
        isACandidate: true,
        electionCandidates: [],
        user: getUser()
      };
      this.renderElection = this.renderElection.bind(this);
      this.voteForCandidate = this.voteForCandidate.bind(this);
    }

    componentDidMount(): void {
      getNextElectionTimestamp().then(election => {
        if (election != null) {
          this.setState({
            timestamp: election.timestamp,
            activeElection: true,
            electionId: election.id
          });

          getElectionCandidates().then(candidates =>
            this.setState({
              electionCandidates: candidates,
              isACandidate: this.state.user != null && candidates.includes(this.state.user.name)
            })
          );

          if (this.state.user != null) {
            getElectionVoteForUser(this.state.user.name).then(candidate => {
              if (candidate != null) {
                this.setState({ votedFor: candidate });
              }
            });
          }
        }
      });

      initGA();
      pageView();
    }

    renderElectionVoteStatus() {
      if (!this.state.activeElection) {
        return (
          <div>
            <Typography gutterBottom variant="h6" component="h6">
              No election is currently in progress
            </Typography>
          </div>
        );
      } else if (this.state.votedFor !== "") {
        return (
          <div>
            <Typography variant="body2" component="p">
              You have done your duty as a citizen!
            </Typography>
          </div>
        );
      } else {
        return (
          <div>
            <Typography variant="body2" component="p">
              Until the election, cast your vote!
            </Typography>
          </div>
        );
      }
    }

    renderParticipateButton() {
      if (this.state.user != null && this.state.user.name != null && !this.state.isACandidate) {
        return (
          <Button fullWidth variant="contained" color="primary" onClick={() => this.registerForElection()}>
            Participate
          </Button>
        );
      }
    }

    registerForElection() {
      signUpForElection(this.state.user).then(() => this.setState({ isACandidate: true }));
    }

    renderElection() {
      if (this.state.activeElection) {
        return <Countdown date={this.state.timestamp} renderer={renderer} />;
      } else if (isGod()) {
        return <DictatorActions />;
      }
    }

    voteForCandidate(name: string) {
      voteForCandidate(this.state.user, name).then(() => this.setState({ votedFor: name }));
    }

    render() {
      return (
        <Container fixed maxWidth="md">
          <ChromiaPageHeader text="Election" />
          <Card raised={true} key={"next-election"} className={this.props.classes.electionCard}>
            <CardContent>
              {this.renderElection()}
              {this.renderElectionVoteStatus()}
            </CardContent>
            <CardActions>{this.renderParticipateButton()}</CardActions>
          </Card>
          <Grid container spacing={1}>
            {this.state.electionCandidates.map(candidate => (
              <ElectionCandidateCard
                candidate={candidate}
                votedFor={this.state.votedFor}
                voteForCandidate={this.voteForCandidate}
              />
            ))}
          </Grid>
        </Container>
      );
    }
  }
);

export default Election;

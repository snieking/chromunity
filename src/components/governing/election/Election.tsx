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
import {
  blocksUntilElectionWrapsUp,
  blocksUntilNextElection,
  getElectionCandidates,
  getElectionVoteForUser,
  getNextElectionTimestamp,
  isEligibleForVoting,
  signUpForElection,
  voteForCandidate
} from "../../../blockchain/ElectionService";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import { ChromunityUser } from "../../../types";
import ElectionCandidateCard from "./ElectionCandidateCard";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import { toLowerCase } from "../../../util/util";

const styles = createStyles({
  electionCard: {
    textAlign: "center",
    marginTop: "28px"
  },
  actionBtn: {
    textAlign: "center",
    margin: "0 auto"
  }
});

interface Props extends WithStyles<typeof styles> {
  user: ChromunityUser;
}

export interface ElectionState {
  timestamp: number;
  activeElection: boolean;
  blocksUntilElectionWrapsUp: number;
  blocksUntilNextElection: number;
  electionId: string;
  votedFor: string;
  isACandidate: boolean;
  electionCandidates: string[];
  isEligibleForVoting: boolean;
}

const Election = withStyles(styles)(
  class extends React.Component<Props, ElectionState> {
    constructor(props: Props) {
      super(props);
      this.state = {
        activeElection: false,
        blocksUntilElectionWrapsUp: -1,
        blocksUntilNextElection: -1,
        electionId: "",
        timestamp: Date.now(),
        votedFor: "",
        isACandidate: false,
        electionCandidates: [],
        isEligibleForVoting: false
      };
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

          if (this.props.user != null) {
            isEligibleForVoting(this.props.user.name).then(eligible =>
              this.setState({ isEligibleForVoting: eligible })
            );
          }

          getElectionCandidates().then(candidates =>
            this.setState({
              electionCandidates: candidates,
              isACandidate:
                this.props.user != null && candidates.map(name => toLowerCase(name)).includes(this.props.user.name)
            })
          );

          if (this.props.user != null) {
            getElectionVoteForUser(this.props.user.name).then(candidate => {
              if (candidate != null) {
                this.setState({ votedFor: candidate });
              }
            });
          }

          blocksUntilElectionWrapsUp().then(blocks => this.setState({ blocksUntilElectionWrapsUp: blocks }));
        } else {
          blocksUntilNextElection().then(blocks => this.setState({ blocksUntilNextElection: blocks }));
        }
      });
    }

    renderElectionVoteStatus() {
      let text =
        this.state.blocksUntilElectionWrapsUp !== -1
          ? "An election is in progress and will finish in " + this.state.blocksUntilElectionWrapsUp + " blocks"
          : "An election is in progress";

      if (!this.state.activeElection) {
        text =
          this.state.blocksUntilNextElection !== -1
            ? "No election is currently in progress, next one is in " + this.state.blocksUntilNextElection + " blocks"
            : "No election is currently in progress.";
      } else if (this.state.votedFor !== "") {
        text = "Thanks for doing your duty as a Chromian!";
        if (this.state.blocksUntilElectionWrapsUp !== -1) {
          text = text + " The election will finish in " + this.state.blocksUntilElectionWrapsUp + " blocks";
        }
      } else if (this.props.user == null) {
        text = "Sign-in to be able to vote & participate in the election";
      }

      return (
        <Typography variant="subtitle1" component="p">
          {text}
        </Typography>
      );
    }

    renderParticipateButton() {
      if (
        this.state.activeElection &&
        this.props.user != null &&
        this.props.user.name != null &&
        !this.state.isACandidate &&
        this.state.isEligibleForVoting
      ) {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.registerForElection()}
            className={this.props.classes.actionBtn}
          >
            Participate in the election
          </Button>
        );
      }
    }

    registerForElection() {
      signUpForElection(this.props.user).then(() => window.location.reload());
    }

    voteForCandidate(name: string) {
      voteForCandidate(this.props.user, name).then(() => this.setState({ votedFor: name }));
    }

    render() {
      return (
        <Container fixed>
          <ChromiaPageHeader text="Election" />
          <Card raised={false} key={"next-election"} className={this.props.classes.electionCard}>
            <CardContent>{this.renderElectionVoteStatus()}</CardContent>
            <CardActions>{this.renderParticipateButton()}</CardActions>
          </Card>
          <br />
          <Grid container spacing={1}>
            {this.state.electionCandidates.map(candidate => (
              <ElectionCandidateCard
                candidate={candidate}
                votedFor={this.state.votedFor}
                voteForCandidate={this.voteForCandidate}
                key={"candiate-" + candidate}
                userIsEligibleToVote={this.state.isEligibleForVoting}
              />
            ))}
          </Grid>
        </Container>
      );
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(Election);

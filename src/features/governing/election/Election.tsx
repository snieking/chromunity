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
} from "../../../core/services/ElectionService";
import ChromiaPageHeader from "../../../shared/ChromiaPageHeader";
import { ChromunityUser } from "../../../types";
import ElectionCandidateCard from "./ElectionCandidateCard";
import { ApplicationState } from "../../../core/store";
import { connect } from "react-redux";
import { toLowerCase } from "../../../shared/util/util";
import Tutorial from "../../../shared/Tutorial";
import TutorialButton from "../../../shared/buttons/TutorialButton";
import { COLOR_CHROMIA_DARK } from "../../../theme";

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
      this.handleUserExists = this.handleUserExists.bind(this);
      this.renderTour = this.renderTour.bind(this);
      this.steps = this.steps.bind(this);
    }

    componentDidMount(): void {
      getNextElectionTimestamp().then(election => {
        if (election != null) {
          this.setState({
            timestamp: election.timestamp,
            activeElection: true,
            electionId: election.id
          });

          getElectionCandidates()
            .then(candidates => this.setState({ electionCandidates: candidates }))
            .then(() => {
              if (this.props.user != null) {
                this.setState({
                  isACandidate: this.state.electionCandidates
                    .map(name => toLowerCase(name))
                    .includes(toLowerCase(this.props.user.name))
                });
              }
            });

          if (this.props.user != null) {
            this.handleUserExists();
          }

          blocksUntilElectionWrapsUp().then(blocks => this.setState({ blocksUntilElectionWrapsUp: blocks }));
        } else {
          blocksUntilNextElection().then(blocks => this.setState({ blocksUntilNextElection: blocks }));
        }
      });
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
      if (this.props.user != null && prevProps.user !== this.props.user) {
        this.handleUserExists();
        this.setState({
          isACandidate: this.state.electionCandidates
            .map(name => toLowerCase(name))
            .includes(toLowerCase(this.props.user.name))
        });
      }
    }

    handleUserExists() {
      isEligibleForVoting(this.props.user.name).then(eligible => this.setState({ isEligibleForVoting: eligible }));

      getElectionVoteForUser(this.props.user.name).then(candidate => {
        if (candidate != null) {
          this.setState({ votedFor: candidate });
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
            <CardContent data-tut="election_status">{this.renderElectionVoteStatus()}</CardContent>
            <CardActions>{this.renderParticipateButton()}</CardActions>
          </Card>
          <br />
          <Grid container spacing={1} data-tut="candidates">
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
          {this.renderTour()}
        </Container>
      );
    }

    renderTour() {
      return (
        <>
          <Tutorial steps={this.steps()} />
          <TutorialButton />
        </>
      );
    }

    steps(): any[] {
      const steps = [
        {
          selector: ".first-step",
          content: () => (
            <div style={{ color: COLOR_CHROMIA_DARK }}>
              <p>
                As a decentralized community, Chromunity is self-governing by public elections where representatives are
                chosen who act as moderators.
              </p>
              <p>
                Elections and governing periods have a fixed block duration. Representatives remain until the next
                election has wrapped up.
              </p>
            </div>
          )
        },
        {
          selector: ".second-step",
          content: () => (
            <div style={{ color: COLOR_CHROMIA_DARK }}>
              <p>As an active member of Chromunity you are able to both participate and vote in elections.</p>
              <p>In order to participate in an election you must have signed up before the election started.</p>
            </div>
          )
        },
        {
          selector: '[data-tut="election_status"]',
          content: () => (
            <div style={{ color: COLOR_CHROMIA_DARK }}>
              <p>The status of the election is displayed here.</p>
              <p>You will get information of how many blocks are left until the election will wrap up.</p>
            </div>
          )
        }
      ];

      if (this.state.electionCandidates.length > 0) {
        steps.push(
          {
            selector: '[data-tut="candidates"]',
            content: () => (
              <div style={{ color: COLOR_CHROMIA_DARK }}>
                <p>Candidates that you may vote for are listed here.</p>
                <p>
                  You can only have one active vote per election, however, you may always change your vote until the
                  election wraps up.
                </p>
                <p>
                  It is not possible to vote for yourself.
                </p>
              </div>
            )
          }
        )
      }

      return steps;
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(Election);

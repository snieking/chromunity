import React from 'react';

import { Button, Container, createStyles, Grid, withStyles, WithStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import {
  getElectionCandidates,
  getElectionVoteForUser,
  getNextElectionTimestamp,
  isEligibleForVoting,
  signUpForElection,
  voteForCandidate,
} from '../../../core/services/election-service';
import ChromiaPageHeader from '../../../shared/chromia-page-header';
import { ChromunityUser } from '../../../types';
import ElectionCandidateCard from './election-candidate-card';
import ApplicationState from '../../../core/application-state';
import { toLowerCase } from '../../../shared/util/util';
import ElectionTutorial from './election-tutorial';
import ElectionDetails from './election-details';
import { ElectionStatus } from './election-status';

const styles = createStyles({
  actionBtn: {
    textAlign: 'center',
    margin: '0 auto',
  },
  participateBtn: {
    textAlign: 'center',
    marginTop: '10px',
    marginBottom: '10px',
  },
});

interface Props extends WithStyles<typeof styles> {
  user: ChromunityUser;
}

export interface ElectionState {
  timestamp: number;
  electionStatus: ElectionStatus;
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
        electionStatus: ElectionStatus.NOT_CHECKED,
        timestamp: Date.now(),
        votedFor: '',
        isACandidate: false,
        electionCandidates: [],
        isEligibleForVoting: false,
      };

      this.voteForCandidate = this.voteForCandidate.bind(this);
      this.handleUserExists = this.handleUserExists.bind(this);
    }

    componentDidMount(): void {
      getNextElectionTimestamp().then((election) => {
        if (election != null) {
          this.setState({ electionStatus: ElectionStatus.ONGOING });

          getElectionCandidates()
            .then((candidates) => this.setState({ electionCandidates: candidates }))
            .then(() => {
              if (this.props.user != null) {
                this.setState((_prevState) => ({
                  isACandidate: _prevState.electionCandidates
                    .map((name) => toLowerCase(name))
                    .includes(toLowerCase(this.props.user.name)),
                }));
              }
            });

          if (this.props.user != null) {
            this.handleUserExists();
          }
        } else {
          this.setState({ electionStatus: ElectionStatus.FINISHED });
        }
      });
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
      if (this.props.user != null && prevProps.user !== this.props.user) {
        this.handleUserExists();
        this.setState((_prevState) => ({
          isACandidate: _prevState.electionCandidates
            .map((name) => toLowerCase(name))
            .includes(toLowerCase(this.props.user.name)),
        }));
      }
    }

    handleUserExists() {
      isEligibleForVoting(this.props.user.name).then((eligible) => this.setState({ isEligibleForVoting: eligible }));

      getElectionVoteForUser(this.props.user.name).then((candidate) => {
        if (candidate != null) {
          this.setState({ votedFor: candidate });
        }
      });
    }

    registerForElection() {
      signUpForElection(this.props.user).then(() => window.location.reload());
    }

    voteForCandidate(name: string) {
      voteForCandidate(this.props.user, name).then(() => this.setState({ votedFor: name }));
    }

    renderParticipateButton() {
      if (
        ElectionStatus.ONGOING === this.state.electionStatus &&
        this.props.user != null &&
        this.props.user.name != null &&
        !this.state.isACandidate &&
        this.state.isEligibleForVoting
      ) {
        return (
          <div className={this.props.classes.participateBtn}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.registerForElection()}
              className={this.props.classes.actionBtn}
            >
              Participate in the election
            </Button>
          </div>
        );
      }
    }

    render() {
      return (
        <Container fixed>
          <ChromiaPageHeader text="Election" />
          <ElectionDetails electionStatus={this.state.electionStatus} />
          {this.renderParticipateButton()}
          <br />
          <Grid container spacing={1} data-tut="candidates">
            {this.state.electionCandidates.map((candidate) => (
              <ElectionCandidateCard
                candidate={candidate}
                votedFor={this.state.votedFor}
                voteForCandidate={this.voteForCandidate}
                key={`candiate-${candidate}`}
                userIsEligibleToVote={this.state.isEligibleForVoting}
              />
            ))}
          </Grid>
          <ElectionTutorial candidates={this.state.electionCandidates.length} />
        </Container>
      );
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

export default connect(mapStateToProps, null)(Election);

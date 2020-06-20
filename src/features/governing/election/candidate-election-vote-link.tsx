import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import ConfirmDialog from '../../../shared/confirm-dialog';
import { isEligibleForVoting, voteForCandidate } from '../../../core/services/election-service';
import { toLowerCase } from '../../../shared/util/util';
import { ChromunityUser } from '../../../types';
import ApplicationState from '../../../core/application-state';
import { getUsername } from '../../../shared/util/user-util';

interface Params {
  candidate: string;
}

interface Props extends RouteComponentProps<Params> {
  user: ChromunityUser;
}

const CandidateElectionVoteLink: React.FunctionComponent<Props> = (props) => {
  const [eligbilityChecked, setEligibilityChecked] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (props.user != null) {
      isEligibleForVoting(props.user.name).then((isEligible) => {
        setEligible(isEligible);
        setEligibilityChecked(true);
      });
    }
  }, [props]);

  setTimeout(() => {
    if (getUsername() == null && props.user == null) {
      window.location.href = '/user/login';
    } else if (
      (props.user != null && props.user.name === toLowerCase(props.match.params.candidate)) ||
      (eligbilityChecked && !eligible)
    ) {
      window.location.href = '/';
    }
  }, 5000);

  function onConfirm() {
    voteForCandidate(props.user, props.match.params.candidate)
      .then(() => navigateToElection())
      .catch(() => navigateToElection());
  }

  function navigateToElection() {
    window.location.href = '/gov/election';
  }

  if (props.user == null) {
    return null;
  }
  if (props.user.name === toLowerCase(props.match.params.candidate) || (eligbilityChecked && !eligible)) {
    return null;
  }
  return (
    <ConfirmDialog
      text={`Would you like to vote for ${props.match.params.candidate}`}
      open
      onClose={navigateToElection}
      onConfirm={onConfirm}
    />
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

export default connect(mapStateToProps, null)(CandidateElectionVoteLink);

import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import ConfirmDialog from "../../common/ConfirmDialog";
import { isEligibleForVoting, voteForCandidate } from "../../../blockchain/ElectionService";
import { toLowerCase } from "../../../util/util";
import { ChromunityUser } from "../../../types";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import { getUsername } from "../../../util/user-util";

interface Params {
  candidate: string;
}

interface Props extends RouteComponentProps<Params> {
  user: ChromunityUser;
}

const CandidateElectionVoteLink: React.FunctionComponent<Props> = props => {
  const [eligbilityChecked, setEligibilityChecked] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {}, []);

  useEffect(() => {
    if (props.user != null) {
      isEligibleForVoting(props.user.name).then(isEligible => {
        setEligible(isEligible);
        setEligibilityChecked(true);
      });
    }
  }, [props]);

  setTimeout(() => {
    if (getUsername() == null && props.user == null) {
      window.location.href = "/user/login";
    } else if (
      (props.user != null && props.user.name === toLowerCase(props.match.params.candidate)) ||
      (eligbilityChecked && !eligible)
    ) {
      window.location.href = "/";
    }
  }, 5000);

  function onConfirm() {
    voteForCandidate(props.user, props.match.params.candidate)
      .then(() => navigateToElection())
      .catch(() => navigateToElection());
  }

  function navigateToElection() {
    window.location.href = "/gov/election";
  }

  if (props.user == null) {
    return null;
  } else if (props.user.name === toLowerCase(props.match.params.candidate) || (eligbilityChecked && !eligible)) {
    return null;
  } else {
    return (
      <ConfirmDialog
        text={"Would you like to vote for " + props.match.params.candidate}
        open={true}
        onClose={navigateToElection}
        onConfirm={onConfirm}
      />
    );
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(CandidateElectionVoteLink);

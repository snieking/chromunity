import React from "react";
import { RouteComponentProps } from "react-router";
import ConfirmDialog from "../../common/ConfirmDialog";
import { voteForCandidate } from "../../../blockchain/ElectionService";
import { getUser } from "../../../util/user-util";

interface Params {
  candidate: string;
}

interface Props extends RouteComponentProps<Params> {}

const CandidateElectionVoteLink: React.FunctionComponent<Props> = props => {
  const user = getUser();

  function onConfirm() {
    voteForCandidate(user, props.match.params.candidate)
      .then(() => navigateToElection())
      .catch(() => navigateToElection());
  }

  function navigateToElection() {
    window.location.href = "/gov/election";
  }

  if (user == null) {
    window.location.href = "/user/login";
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

export default CandidateElectionVoteLink;

import React, { useEffect, useState } from "react";
import { ChromunityUser, PollData } from "../../types";
import { Card, CardContent } from "@material-ui/core";
import Poll from "react-polls";
import useTheme from "@material-ui/core/styles/useTheme";
import { getPollVote, voteForOptionInPoll } from "../../blockchain/TopicService";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";

interface Props {
  topicId: string;
  poll: PollData;
  user: ChromunityUser;
}

const PollRenderer: React.FunctionComponent<Props> = props => {
  const theme = useTheme();
  const [optionVote, setOptionVote] = useState<string>(null);

  useEffect(() => {
    if (props.topicId && props.user) {
      getPollVote(props.topicId, props.user).then(vote => setOptionVote(vote ? vote : ""));
    }
  }, [props]);

  if (!props.poll) return null;

  const darkTheme = theme.palette.type === "dark";

  function handleVote(voteAnswer: string) {
    if (props.user) {
      const answer = props.poll.options.find(answer => answer.option === voteAnswer);

      if (answer) {
        answer.votes++;
        voteForOptionInPoll(props.user, props.topicId, answer.option)
          .catch()
          .then();
      }
    }
  }

  if (props.user != null && optionVote != null) {
    return (
      <Card key="poll">
        <CardContent>
          <Poll
            question={props.poll.question}
            answers={props.poll.options}
            customStyles={{
              theme: darkTheme ? "white" : "black",
              questionBold: true,
              questionColor: theme.palette.primary.main
            }}
            onVote={handleVote}
            noStorage={true}
            vote={optionVote}
          />
        </CardContent>
      </Card>
    );
  } else {
    return null;
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(PollRenderer);

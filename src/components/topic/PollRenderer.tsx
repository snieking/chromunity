import React, { useEffect, useState } from "react";
import { ChromunityUser, PollData } from "../../types";
import { Card, CardContent } from "@material-ui/core";
import Poll from "react-polls";
import { getPollVote, voteForOptionInPoll } from "../../blockchain/TopicService";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { COLOR_CHROMIA_DARK, COLOR_OFF_WHITE } from "../../theme";

interface Props {
  topicId: string;
  poll: PollData;
  user: ChromunityUser;
}

const useStyles = makeStyles({
  pollWrapper: {
    background: COLOR_OFF_WHITE,
    border: "solid 1px",
    borderColor: COLOR_CHROMIA_DARK
  }
});

const PollRenderer: React.FunctionComponent<Props> = props => {
  const classes = useStyles();
  const [optionVote, setOptionVote] = useState<string>(null);

  useEffect(() => {
    if (props.topicId && props.user) {
      getPollVote(props.topicId, props.user).then(vote => setOptionVote(vote ? vote : ""));
    }
  }, [props]);

  if (!props.poll) return null;

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
          <div className={classes.pollWrapper}>
            <Poll
              question={props.poll.question}
              answers={props.poll.options}
              customStyles={{
                theme: "black",
                questionBold: true,
                questionColor: COLOR_CHROMIA_DARK,
                votesColor: "pink"
              }}
              onVote={handleVote}
              noStorage={true}
              vote={optionVote}
            />
          </div>
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

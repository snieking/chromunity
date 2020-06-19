import React, { useEffect } from "react";
import { Topic } from "../../types";
import { connect } from "react-redux";
import ApplicationState from "../../core/application-state";
import TopicOverviewCard from "../topic/TopicOverviewCard";
import { checkPinnedTopic } from "../governing/redux/govActions";

interface Props {
  topic?: Topic;
  autoLoginInProgress: boolean;
  checkPinnedTopic: typeof checkPinnedTopic;
}

const PinnedTopic: React.FunctionComponent<Props> = (props) => {
  useEffect(() => {
    if (!props.autoLoginInProgress) {
      props.checkPinnedTopic();
    }
    // eslint-disable-next-line
  }, [props.autoLoginInProgress]);

  return (
    props.topic != null && (
      <div>
        <TopicOverviewCard topic={props.topic} pinned />
      </div>
    )
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    topic: store.government.pinnedTopic,
    autoLoginInProgress: store.account.autoLoginInProgress,
  };
};

const mapDispatchToProps = {
  checkPinnedTopic
};

export default connect(mapStateToProps, mapDispatchToProps)(PinnedTopic);

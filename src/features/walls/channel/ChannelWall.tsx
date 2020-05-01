import React from "react";
import { styled } from "@material-ui/core/styles";
import { Container, LinearProgress, MenuItem, Select } from "@material-ui/core";
import { ChromunityUser, Topic } from "../../../types";

import { RouteComponentProps } from "react-router";
import { countTopicsInChannel } from "../../../core/services/TopicService";
import TopicOverviewCard from "../../topic/TopicOverviewCard";
import LoadMoreButton from "../../../shared/buttons/LoadMoreButton";
import NewTopicButton from "../../../shared/buttons/NewTopicButton";
import { TOPIC_VIEW_SELECTOR_OPTION } from "../WallCommon";
import { connect } from "react-redux";
import { channelInit, loadChannel, loadChannelByPopularity, loadOlderTopicsInChannel } from "../redux/channelActions";
import { ApplicationState } from "../../../core/store";
import { shouldBeFiltered, toLowerCase } from "../../../shared/util/util";
import { clearTopicsCache } from "../redux/wallActions";
import { markTopicWallRefreshed } from "../../../shared/util/user-util";
import ChannelFollowingButton from "./ChannelFollowingButton";
import ChannelTitle from "./ChannelTitle";

interface MatchParams {
  channel: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  loading: boolean;
  topics: Topic[];
  couldExistOlder: boolean;
  representatives: string[];
  distrustedUsers: string[];
  user: ChromunityUser;
  channelInit: typeof channelInit;
  loadChannel: typeof loadChannel;
  loadOlderTopicsInChannel: typeof loadOlderTopicsInChannel;
  loadChannelByPopularity: typeof loadChannelByPopularity;
  clearTopicsCache: typeof clearTopicsCache;
}

interface State {
  isLoading: boolean;
  id: string;
  countOfTopics: number;
  selector: TOPIC_VIEW_SELECTOR_OPTION;
  popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
}

const StyledSelect = styled(Select)((style) => ({
  color: style.theme.palette.primary.main,
  float: "left",
  marginRight: "10px",
}));

const topicsPageSize: number = 15;

class ChannelWall extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      id: "",
      isLoading: false,
      countOfTopics: 0,
      selector: TOPIC_VIEW_SELECTOR_OPTION.RECENT,
      popularSelector: TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK,
    };

    this.retrieveTopics = this.retrieveTopics.bind(this);
    this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    this.retrievePopularTopics = this.retrievePopularTopics.bind(this);
    this.handleSelectorChange = this.handleSelectorChange.bind(this);
    this.handlePopularChange = this.handlePopularChange.bind(this);
  }

  componentDidMount(): void {
    this.props.channelInit();
    this.retrieveTopics();

    const channel = this.props.match.params.channel;

    countTopicsInChannel(channel).then((count) => this.setState({ countOfTopics: count }));
    markTopicWallRefreshed();
  }

  render() {
    return (
      <Container>
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "-50px" }}>
          <ChannelTitle channel={this.props.match.params.channel}/>
        </div>

        <ChannelFollowingButton channel={this.props.match.params.channel} />

        {this.state.isLoading || this.props.loading ? <LinearProgress variant="query" /> : <div />}
        <StyledSelect value={this.state.selector} onChange={this.handleSelectorChange}>
          <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.RECENT}>Recent</MenuItem>
          <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR}>Popular</MenuItem>
        </StyledSelect>
        {this.state.selector === TOPIC_VIEW_SELECTOR_OPTION.POPULAR ? (
          <StyledSelect value={this.state.popularSelector} onChange={this.handlePopularChange}>
            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_DAY}>Last day</MenuItem>
            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK}>Last week</MenuItem>
            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_MONTH}>Last month</MenuItem>
            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_ALL_TIME}>All time</MenuItem>
          </StyledSelect>
        ) : (
          <div />
        )}
        <br />
        <br />
        {this.props.topics.map((topic) => {
          if (
            (this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) ||
            (this.props.user != null && toLowerCase(topic.author) === toLowerCase(this.props.user.name)) ||
            (!this.props.distrustedUsers.includes(topic.author) &&
              !shouldBeFiltered(topic.moderated_by, this.props.distrustedUsers))
          ) {
            return <TopicOverviewCard key={topic.id} topic={topic} />;
          } else {
            return <div />;
          }
        })}
        {this.renderLoadMoreButton()}
        {this.props.user != null ? (
          <NewTopicButton channel={this.props.match.params.channel} updateFunction={this.retrieveTopics} />
        ) : (
          <div />
        )}
      </Container>
    );
  }

  retrieveTopics() {
    const channel = this.props.match.params.channel;

    if (channel != null) {
      this.props.loadChannel(channel, topicsPageSize);
    }
  }

  retrieveOlderTopics() {
    this.props.loadOlderTopicsInChannel(topicsPageSize);
  }

  renderLoadMoreButton() {
    if (this.props.couldExistOlder) {
      return <LoadMoreButton onClick={this.retrieveOlderTopics} />;
    }
  }

  retrievePopularTopics(selected: TOPIC_VIEW_SELECTOR_OPTION) {
    const dayInMilliSeconds: number = 86400000;
    let timestamp: number;

    switch (selected) {
      case TOPIC_VIEW_SELECTOR_OPTION.POPULAR_DAY:
        timestamp = Date.now() - dayInMilliSeconds;
        break;
      case TOPIC_VIEW_SELECTOR_OPTION.POPULAR:
      case TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK:
        timestamp = Date.now() - dayInMilliSeconds * 7;
        break;
      case TOPIC_VIEW_SELECTOR_OPTION.POPULAR_MONTH:
        timestamp = Date.now() - dayInMilliSeconds * 30;
        break;
      default:
        timestamp = 0;
    }

    this.props.loadChannelByPopularity(this.props.match.params.channel, timestamp, topicsPageSize);
  }

  handleSelectorChange(event: React.ChangeEvent<{ value: unknown }>) {
    const selected = event.target.value as TOPIC_VIEW_SELECTOR_OPTION;

    this.setState({ selector: selected });

    if (this.state.selector !== selected) {
      if (selected === TOPIC_VIEW_SELECTOR_OPTION.RECENT) {
        this.retrieveTopics();
      } else if (selected === TOPIC_VIEW_SELECTOR_OPTION.POPULAR) {
        this.retrievePopularTopics(selected);
      }
    }
  }

  handlePopularChange(event: React.ChangeEvent<{ value: unknown }>) {
    const selected = event.target.value as TOPIC_VIEW_SELECTOR_OPTION;

    if (this.state.popularSelector !== selected) {
      this.setState({ popularSelector: selected });
      this.retrievePopularTopics(selected);
    }
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    channelInit: () => dispatch(channelInit()),
    loadChannel: (name: string, pageSize: number) => dispatch(loadChannel(name, pageSize)),
    loadOlderTopicsInChannel: (pageSize: number) => dispatch(loadOlderTopicsInChannel(pageSize)),
    loadChannelByPopularity: (name: string, timestamp: number, pageSize: number) =>
      dispatch(loadChannelByPopularity(name, timestamp, pageSize)),
    clearTopicsCache: () => dispatch(clearTopicsCache()),
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    loading: store.channel.loading,
    topics: store.channel.topics,
    couldExistOlder: store.channel.couldExistOlder,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelWall);

import React from "react";
import { styled } from "@material-ui/core/styles";
import { ChromunityUser, Topic } from "../../types";
import { Container, LinearProgress, MenuItem, Select } from "@material-ui/core";
import TopicOverviewCard from "../topic/TopicOverviewCard";
import NewTopicButton from "../../shared/buttons/NewTopicButton";
import LoadMoreButton from "../../shared/buttons/LoadMoreButton";
import { TrendingChannels } from "../tags/TrendingTags";
import ChromiaPageHeader from "../../shared/ChromiaPageHeader";
import { TOPIC_VIEW_SELECTOR_OPTION } from "./WallCommon";
import { ApplicationState } from "../../core/store";
import {
  loadAllTopicsByPopularity,
  loadAllTopicWall,
  loadFollowedChannelsTopicsByPopularity,
  loadFollowedChannelsTopicWall,
  loadFollowedUsersTopicsByPopularity,
  loadFollowedUsersTopicWall,
  loadOlderAllTopics,
  loadOlderFollowedChannelsTopics,
  loadOlderFollowedUsersTopics
} from "./redux/wallActions";
import { connect } from "react-redux";
import { shouldBeFiltered, toLowerCase, uniqueId } from "../../shared/util/util";
import { COLOR_CHROMIA_DARK } from "../../theme";
import Tutorial from "../../shared/Tutorial";
import TutorialButton from "../../shared/buttons/TutorialButton";
import { markTopicWallRefreshed } from "../../shared/util/user-util";

interface Props {
  type: string;
  loading: boolean;
  topics: Topic[];
  couldExistOlderTopics: boolean;
  representatives: string[];
  distrustedUsers: string[];
  user: ChromunityUser;
  loadAllTopics: typeof loadAllTopicWall;
  loadOlderTopics: typeof loadOlderAllTopics;
  loadAllTopicsByPopularity: typeof loadAllTopicsByPopularity;
  loadFollowedUsersTopics: typeof loadFollowedUsersTopicWall;
  loadOlderFollowedUsersTopics: typeof loadOlderFollowedUsersTopics;
  loadFollowedUsersTopicsByPopularity: typeof loadFollowedUsersTopicsByPopularity;
  loadFollowedChannelsTopics: typeof loadFollowedChannelsTopicWall;
  loadOlderFollowedChannelsTopics: typeof loadOlderFollowedChannelsTopics;
  loadFollowedChannelsTopicsByPopularity: typeof loadFollowedChannelsTopicsByPopularity;
}

interface State {
  selector: TOPIC_VIEW_SELECTOR_OPTION;
  popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
}

const StyledSelector = styled(Select)(style => ({
  color: style.theme.palette.primary.main,
  float: "left",
  marginRight: "10px"
}));

const topicsPageSize: number = 15;

class TopicWall extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selector: TOPIC_VIEW_SELECTOR_OPTION.RECENT,
      popularSelector: TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK
    };

    this.retrieveLatestTopics = this.retrieveLatestTopics.bind(this);
    this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    this.handleSelectorChange = this.handleSelectorChange.bind(this);
    this.handlePopularChange = this.handlePopularChange.bind(this);
  }

  componentDidMount() {
    this.retrieveLatestTopics(false);
    markTopicWallRefreshed();
  }

  render() {
    return (
      <div>
        <Container fixed>
          <ChromiaPageHeader text={this.getHeader()} />
          {this.props.loading ? <LinearProgress variant="query" /> : <div />}
          {this.props.type === "tagFollowings" ? <TrendingChannels /> : <div />}
          {this.props.type === "tagFollowings" ? <ChromiaPageHeader text="Followed Channels" /> : <div />}
          <StyledSelector data-tut="main_selector" value={this.state.selector} onChange={this.handleSelectorChange}>
            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.RECENT}>Recent</MenuItem>
            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR}>Popular</MenuItem>
          </StyledSelector>
          {this.state.selector === TOPIC_VIEW_SELECTOR_OPTION.POPULAR ? (
            <StyledSelector value={this.state.popularSelector} onChange={this.handlePopularChange}>
              <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_DAY}>Last day</MenuItem>
              <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK}>Last week</MenuItem>
              <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_MONTH}>Last month</MenuItem>
              <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_ALL_TIME}>All time</MenuItem>
            </StyledSelector>
          ) : (
            <div />
          )}
          <br />
          <br />
          {this.props.topics.map(topic => {
            if (
              (this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) ||
              (this.props.user != null && toLowerCase(topic.author) === toLowerCase(this.props.user.name)) ||
              (!this.props.distrustedUsers.includes(topic.author) &&
                !shouldBeFiltered(topic.moderated_by, this.props.distrustedUsers))
            ) {
              return <TopicOverviewCard key={"card-" + topic.id} topic={topic} />;
            } else {
              return <div key={uniqueId()}/>;
            }
          })}
          {this.renderLoadMoreButton()}
        </Container>
        {this.props.user != null ? (
          <NewTopicButton channel="" updateFunction={() => this.retrieveLatestTopics(true)} />
        ) : (
          <div />
        )}
        {this.renderTour()}
      </div>
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
            <p>This page displays a wall of summarized topics.</p>
            <p>Click on a topic in order to read it.</p>
          </div>
        )
      },
      {
        selector: '[data-tut="main_selector"]',
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>Click on the selector to change in which order topics are viewed.</p>
          </div>
        )
      }
    ];

    if (this.props.user != null) {
      steps.push({
        selector: '[data-tut="new_topic"]',
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>A new topic can be created by using this button.</p>
            <p>You will have to give the topic an appropriate title, as well as which channel it should belong to.</p>
          </div>
        )
      });
    }

    return steps;
  }

  renderLoadMoreButton() {
    if (this.props.couldExistOlderTopics) {
      return <LoadMoreButton onClick={this.retrieveOlderTopics} />;
    }
  }

  getHeader() {
    if (this.props.type === "userFollowings") {
      return "Followed Users";
    } else if (this.props.type === "tagFollowings") {
      return "Trending Channels";
    } else {
      return "All Topics";
    }
  }

  handleSelectorChange(event: React.ChangeEvent<{ value: unknown }>) {
    const selected = event.target.value as TOPIC_VIEW_SELECTOR_OPTION;

    if (this.state.selector !== selected) {
      this.setState({ selector: selected });

      if (selected === TOPIC_VIEW_SELECTOR_OPTION.RECENT) {
        this.retrieveLatestTopics(false);
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

  retrieveLatestTopics(ignoreCache: boolean) {
    if (this.props.type === "userFollowings" && this.props.user) {
      this.props.loadFollowedUsersTopics(this.props.user.name, topicsPageSize);
    } else if (this.props.type === "tagFollowings" && this.props.user) {
      this.props.loadFollowedChannelsTopics(this.props.user.name, topicsPageSize, ignoreCache);
    } else {
      this.props.loadAllTopics(topicsPageSize, ignoreCache);
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
        break;
    }

    if (this.props.type === "userFollowings") {
      this.props.loadFollowedUsersTopicsByPopularity(this.props.user.name, timestamp, topicsPageSize);
    } else if (this.props.type === "tagFollowings") {
      this.props.loadFollowedChannelsTopicsByPopularity(this.props.user.name, timestamp, topicsPageSize);
    } else {
      this.props.loadAllTopicsByPopularity(timestamp, topicsPageSize);
    }
  }

  retrieveOlderTopics() {
    if (this.props.topics.length > 0) {
      if (this.props.type === "userFollowings") {
        this.props.loadOlderFollowedUsersTopics(this.props.user.name, topicsPageSize);
      } else if (this.props.type === "tagFollowings") {
        this.props.loadOlderFollowedChannelsTopics(this.props.user.name, topicsPageSize);
      } else {
        this.props.loadOlderTopics(topicsPageSize);
      }
    }
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    loadAllTopics: (pageSize: number, ignoreCache: boolean) => dispatch(loadAllTopicWall(pageSize, ignoreCache)),
    loadOlderTopics: (pageSize: number) => dispatch(loadOlderAllTopics(pageSize)),
    loadAllTopicsByPopularity: (timestamp: number, pageSize: number) =>
      dispatch(loadAllTopicsByPopularity(timestamp, pageSize)),
    loadFollowedUsersTopics: (username: string, pageSize: number) =>
      dispatch(loadFollowedUsersTopicWall(username, pageSize)),
    loadOlderFollowedUsersTopics: (username: string, pageSize: number) =>
      dispatch(loadOlderFollowedUsersTopics(username, pageSize)),
    loadFollowedUsersTopicsByPopularity: (username: string, timestamp: number, pageSize: number) =>
      dispatch(loadFollowedUsersTopicsByPopularity(username, timestamp, pageSize)),
    loadFollowedChannelsTopics: (username: string, pageSize: number, ignoreCache: boolean) =>
      dispatch(loadFollowedChannelsTopicWall(username, pageSize, ignoreCache)),
    loadOlderFollowedChannelsTopics: (username: string, pageSize: number) =>
      dispatch(loadOlderFollowedChannelsTopics(username, pageSize)),
    loadFollowedChannelsTopicsByPopularity: (username: string, timestamp: number, pageSize: number) =>
      dispatch(loadFollowedChannelsTopicsByPopularity(username, timestamp, pageSize))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    topics: store.topicWall.topics,
    loading: store.topicWall.loading,
    couldExistOlderTopics: store.topicWall.couldExistOlder,
    representatives: store.government.representatives.map(rep => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopicWall);

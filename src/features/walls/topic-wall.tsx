import React from "react";
import { styled } from "@material-ui/core/styles";
import { ChromunityUser, Topic } from "../../types";
import { Container, MenuItem, Select } from "@material-ui/core";
import TopicOverviewCard from "../topic/topic-overview-card";
import NewTopicButton from "../../shared/buttons/new-topic-button";
import LoadMoreButton from "../../shared/buttons/load-more-button";
import { TrendingChannels } from "../tags/trending-tags";
import ChromiaPageHeader from "../../shared/chromia-page-header";
import { TOPIC_VIEW_SELECTOR_OPTION } from "./wall-common";
import ApplicationState from "../../core/application-state";
import {
  loadAllTopicsByPopularity,
  loadAllTopicWall,
  loadFollowedChannelsTopicsByPopularity,
  loadFollowedChannelsTopicWall,
  loadFollowedUsersTopicsByPopularity,
  loadFollowedUsersTopicWall,
  loadOlderAllTopics,
  loadOlderFollowedChannelsTopics,
  loadOlderFollowedUsersTopics,
} from "./redux/wall-actions";
import { connect } from "react-redux";
import { shouldBeFiltered, toLowerCase, uniqueId } from "../../shared/util/util";
import { COLOR_CHROMIA_DARK } from "../../theme";
import Tutorial from "../../shared/tutorial";
import TutorialButton from "../../shared/buttons/tutorial-button";
import { markTopicWallRefreshed } from "../../shared/util/user-util";
import PinnedTopic from "./pinned-topic";

interface Props {
  type: string;
  topics: Topic[];
  couldExistOlderTopics: boolean;
  representatives: string[];
  distrustedUsers: string[];
  user: ChromunityUser;
  pinnedTopic: Topic;
  loadAllTopicWall: typeof loadAllTopicWall;
  loadOlderAllTopics: typeof loadOlderAllTopics;
  loadAllTopicsByPopularity: typeof loadAllTopicsByPopularity;
  loadFollowedUsersTopicWall: typeof loadFollowedUsersTopicWall;
  loadOlderFollowedUsersTopics: typeof loadOlderFollowedUsersTopics;
  loadFollowedUsersTopicsByPopularity: typeof loadFollowedUsersTopicsByPopularity;
  loadFollowedChannelsTopicWall: typeof loadFollowedChannelsTopicWall;
  loadOlderFollowedChannelsTopics: typeof loadOlderFollowedChannelsTopics;
  loadFollowedChannelsTopicsByPopularity: typeof loadFollowedChannelsTopicsByPopularity;
}

interface State {
  selector: TOPIC_VIEW_SELECTOR_OPTION;
  popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
}

const StyledSelector = styled(Select)((style) => ({
  color: style.theme.palette.primary.main,
  float: "left",
  marginRight: "10px",
}));

const topicsPageSize: number = 15;

class TopicWall extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selector: TOPIC_VIEW_SELECTOR_OPTION.RECENT,
      popularSelector: TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK,
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
          <PinnedTopic />
          {this.props.topics.map((topic) => {
            if (
              (this.props.pinnedTopic == null || this.props.pinnedTopic.id !== topic.id) &&
              ((this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) ||
                (this.props.user != null && toLowerCase(topic.author) === toLowerCase(this.props.user.name)) ||
                (!this.props.distrustedUsers.includes(topic.author) &&
                  !shouldBeFiltered(topic.moderated_by, this.props.distrustedUsers)))
            ) {
              return <TopicOverviewCard key={"card-" + topic.id} topic={topic} />;
            } else {
              return <div key={uniqueId()} />;
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
        ),
      },
      {
        selector: '[data-tut="main_selector"]',
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>Click on the selector to change in which order topics are viewed.</p>
          </div>
        ),
      },
    ];

    if (this.props.user != null) {
      steps.push({
        selector: '[data-tut="new_topic"]',
        content: () => (
          <div style={{ color: COLOR_CHROMIA_DARK }}>
            <p>A new topic can be created by using this button.</p>
            <p>You will have to give the topic an appropriate title, as well as which channel it should belong to.</p>
          </div>
        ),
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
      this.props.loadFollowedUsersTopicWall({ username: this.props.user.name, pageSize: topicsPageSize });
    } else if (this.props.type === "tagFollowings" && this.props.user) {
      this.props.loadFollowedChannelsTopicWall({ username: this.props.user.name, pageSize: topicsPageSize, ignoreCache });
    } else {
      this.props.loadAllTopicWall({ pageSize: topicsPageSize, ignoreCache });
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
      this.props.loadFollowedUsersTopicsByPopularity({ username: this.props.user.name, timestamp, pageSize: topicsPageSize });
    } else if (this.props.type === "tagFollowings") {
      this.props.loadFollowedChannelsTopicsByPopularity({ username: this.props.user.name, timestamp, pageSize: topicsPageSize });
    } else {
      this.props.loadAllTopicsByPopularity({ timestamp, pageSize: topicsPageSize });
    }
  }

  retrieveOlderTopics() {
    if (this.props.topics.length > 0) {
      if (this.props.type === "userFollowings") {
        this.props.loadOlderFollowedUsersTopics({ username: this.props.user.name, pageSize: topicsPageSize });
      } else if (this.props.type === "tagFollowings") {
        this.props.loadOlderFollowedChannelsTopics({ username: this.props.user.name, pageSize: topicsPageSize });
      } else {
        this.props.loadOlderAllTopics(topicsPageSize);
      }
    }
  }
}

const mapDispatchToProps = {
  loadAllTopicWall,
  loadOlderAllTopics,
  loadAllTopicsByPopularity,
  loadFollowedUsersTopicWall,
  loadOlderFollowedUsersTopics,
  loadFollowedUsersTopicsByPopularity,
  loadFollowedChannelsTopicWall,
  loadOlderFollowedChannelsTopics,
  loadFollowedChannelsTopicsByPopularity
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    topics: store.topicWall.topics,
    couldExistOlderTopics: store.topicWall.couldExistOlder,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers,
    pinnedTopic: store.government.pinnedTopic,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopicWall);

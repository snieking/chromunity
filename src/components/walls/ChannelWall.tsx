import React from "react";
import { styled } from "@material-ui/core/styles";
import { Badge, Container, IconButton, LinearProgress, MenuItem, Select, Tooltip, Typography } from "@material-ui/core";
import { ChromunityUser, Topic } from "../../types";

import { RouteComponentProps } from "react-router";
import { countTopicsInChannel } from "../../blockchain/TopicService";
import TopicOverviewCard from "../topic/TopicOverviewCard";
import LoadMoreButton from "../buttons/LoadMoreButton";
import {
  countChannelFollowers,
  followChannel,
  getFollowedChannels,
  unfollowChannel
} from "../../blockchain/ChannelService";
import ChromiaPageHeader from "../common/ChromiaPageHeader";
import NewTopicButton from "../buttons/NewTopicButton";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import { getMutedUsers } from "../../blockchain/UserService";
import { TOPIC_VIEW_SELECTOR_OPTION } from "./WallCommon";
import { getUser } from "../../util/user-util";
import { connect } from "react-redux";
import { channelInit, loadChannel, loadChannelByPopularity, loadOlderTopicsInChannel } from "./redux/channelActions";
import { ApplicationState } from "../../store";
import { toLowerCase } from "../../util/util";

interface MatchParams {
  channel: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  loading: boolean;
  topics: Topic[];
  couldExistOlder: boolean;
  representatives: string[];
  channelInit: typeof channelInit;
  loadChannel: typeof loadChannel;
  loadOlderTopicsInChannel: typeof loadOlderTopicsInChannel;
  loadChannelByPopularity: typeof loadChannelByPopularity;
}

interface State {
  isLoading: boolean;
  id: string;
  channelFollowed: boolean;
  countOfTopics: number;
  countOfFollowers: number;
  selector: TOPIC_VIEW_SELECTOR_OPTION;
  popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
  mutedUsers: string[];
  user: ChromunityUser;
}

const StyledSelect = styled(Select)(style => ({
  color: style.theme.palette.primary.main,
  float: "left",
  marginRight: "10px"
}));

const topicsPageSize: number = 15;

class ChannelWall extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      id: "",
      isLoading: false,
      channelFollowed: false,
      countOfTopics: 0,
      countOfFollowers: 0,
      selector: TOPIC_VIEW_SELECTOR_OPTION.RECENT,
      popularSelector: TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK,
      mutedUsers: [],
      user: getUser()
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
    const user: ChromunityUser = this.state.user;
    if (user != null) {
      getFollowedChannels(user.name).then(channels =>
        this.setState({
          channelFollowed: channels.includes(channel.toLocaleLowerCase())
        })
      );
      getMutedUsers(user).then(users => this.setState({ mutedUsers: users }));
    }

    countChannelFollowers(channel).then(count => this.setState({ countOfFollowers: count }));
    countTopicsInChannel(channel).then(count => this.setState({ countOfTopics: count }));
  }

  render() {
    return (
      <Container>
        <div style={{ textAlign: "center" }}>
          <ChromiaPageHeader text={"#" + this.props.match.params.channel} />
          <Typography component="span" variant="subtitle1" className="pink-typography" style={{ display: "inline" }}>
            Topics: {this.state.countOfTopics}
          </Typography>
        </div>

        <IconButton onClick={() => this.toggleChannelFollow()}>
          <Badge badgeContent={this.state.countOfFollowers} color="primary">
            <Tooltip title={this.state.channelFollowed ? "Unfollow channel" : "Follow channel"}>
              {this.state.channelFollowed ? (
                <Favorite className="red-color" fontSize="large" />
              ) : (
                <FavoriteBorder className="pink-color" fontSize="large" />
              )}
            </Tooltip>
          </Badge>
        </IconButton>

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
        {this.props.topics.map(topic => {
          if (!this.state.mutedUsers.includes(topic.author) && !topic.removed) {
            return <TopicOverviewCard key={topic.id} topic={topic} />;
          } else {
            return <div />;
          }
        })}
        {this.renderLoadMoreButton()}
        {this.state.user != null ? (
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

  toggleChannelFollow() {
    if (!this.state.isLoading) {
      const channel = this.props.match.params.channel;
      this.setState({ isLoading: true });
      if (this.state.channelFollowed) {
        unfollowChannel(this.state.user, channel)
          .then(() =>
            this.setState(prevState => ({
              channelFollowed: false,
              countOfFollowers: prevState.countOfFollowers - 1,
              isLoading: false
            }))
          )
          .catch(() => this.setState({ isLoading: false }));
      } else {
        followChannel(this.state.user, channel)
          .then(() =>
            this.setState(prevState => ({
              channelFollowed: true,
              countOfFollowers: prevState.countOfFollowers + 1,
              isLoading: false
            }))
          )
          .catch(() => this.setState({ isLoading: false }));
      }
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
      dispatch(loadChannelByPopularity(name, timestamp, pageSize))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.channel.loading,
    topics: store.channel.topics,
    couldExistOlder: store.channel.couldExistOlder,
    representatives: store.government.representatives.map(rep => toLowerCase(rep))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelWall);

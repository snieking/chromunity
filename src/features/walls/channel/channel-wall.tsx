import React from 'react';
import { styled } from '@material-ui/core/styles';
import { Container, MenuItem, Select } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { ChromunityUser, Topic } from '../../../types';

import TopicOverviewCard from '../../topic/topic-overview-card';
import LoadMoreButton from '../../../shared/buttons/load-more-button';
import NewTopicButton from '../../../shared/buttons/new-topic-button';
import { TOPIC_VIEW_SELECTOR_OPTION } from '../wall-common';
import { channelInit, loadChannel, loadChannelByPopularity, loadOlderTopicsInChannel } from '../redux/channel-actions';
import ApplicationState from '../../../core/application-state';
import { shouldBeFiltered, toLowerCase } from '../../../shared/util/util';
import { clearTopicsCache } from '../redux/wall-actions';
import { markTopicWallRefreshed } from '../../../shared/util/user-util';
import ChannelFollowingButton from './channel-following-button';
import ChannelTitle from './channel-title';

interface MatchParams {
  channel: string;
}

interface Props extends RouteComponentProps<MatchParams> {
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
  selector: TOPIC_VIEW_SELECTOR_OPTION;
  popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
}

const StyledSelect = styled(Select)((style) => ({
  color: style.theme.palette.primary.main,
  float: 'left',
  marginRight: '10px',
}));

const topicsPageSize = 15;

class ChannelWall extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
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
    markTopicWallRefreshed();
  }

  retrieveTopics() {
    const { channel } = this.props.match.params;

    if (channel != null) {
      this.props.loadChannel({ name: channel, pageSize: topicsPageSize });
    }
  }

  retrieveOlderTopics() {
    this.props.loadOlderTopicsInChannel(topicsPageSize);
  }

  retrievePopularTopics(selected: TOPIC_VIEW_SELECTOR_OPTION) {
    const dayInMilliSeconds = 86400000;
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

    this.props.loadChannelByPopularity({
      name: this.props.match.params.channel,
      timestamp,
      pageSize: topicsPageSize,
    });
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

  renderLoadMoreButton() {
    if (this.props.couldExistOlder) {
      return <LoadMoreButton onClick={this.retrieveOlderTopics} />;
    }
  }

  render() {
    const { channel } = this.props.match.params;
    return (
      <Container>
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '-50px' }}>
          <ChannelTitle channel={channel} />
        </div>

        <div>
          <ChannelFollowingButton channel={channel} />
        </div>
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
          }
          return <div />;
        })}
        {this.renderLoadMoreButton()}
        {this.props.user != null ? <NewTopicButton channel={channel} updateFunction={this.retrieveTopics} /> : <div />}
      </Container>
    );
  }
}

const mapDispatchToProps = {
  channelInit,
  loadChannel,
  loadOlderTopicsInChannel,
  loadChannelByPopularity,
  clearTopicsCache,
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    topics: store.channel.topics,
    couldExistOlder: store.channel.couldExistOlder,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelWall);

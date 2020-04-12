import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  createStyles,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { Topic, TopicReply } from "../../types";

import { RouteComponentProps } from "react-router";
import ProfileCard from "../user/ProfileCard";
import TopicOverviewCard from "../topic/TopicOverviewCard";
import LoadMoreButton from "../buttons/LoadMoreButton";
import TopicReplyOverviewCard from "../topic/TopicReplyOverviewCard";
import { connect } from "react-redux";
import { ApplicationState } from "../../store";
import {
  userPageInit,
  loadUserTopics,
  loadUserReplies,
  loadUserFollowedChannels
} from "../user/redux/userPageActions";
import CustomChip from "../common/CustomChip";
import { markTopicWallRefreshed } from "../../util/user-util";

const styles = (theme: Theme) =>
  createStyles({
    text: {
      color: theme.palette.primary.main
    }
  });

interface MatchParams {
  userId: string;
}

interface UserWallProps extends RouteComponentProps<MatchParams>, WithStyles<typeof styles> {
  loading: boolean;
  userPageInit: typeof userPageInit;
  loadUserTopics: typeof loadUserTopics;
  loadUserReplies: typeof loadUserReplies;
  loadUserFollowedChannels: typeof loadUserFollowedChannels;
  topics: Topic[];
  couldExistOlderTopics: boolean;
  replies: TopicReply[];
  couldExistOlderReplies: boolean;
  userFollowedChannels: string[];
}

interface UserWallState {
  representatives: string[];
  couldExistOlderTopics: boolean;
  couldExistOlderTopicReplies: boolean;
  activeTab: number;
}

const topicsPageSize: number = 15;

const UserWall = withStyles(styles)(
  class extends React.Component<UserWallProps, UserWallState> {
    constructor(props: UserWallProps) {
      super(props);
      this.state = {
        representatives: [],
        couldExistOlderTopics: false,
        couldExistOlderTopicReplies: false,
        activeTab: 0
      };

      this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.update = this.update.bind(this);
    }

    componentDidMount(): void {
      this.update();
      markTopicWallRefreshed();
    }

    componentDidUpdate(prevProps: Readonly<UserWallProps>): void {
      if (prevProps.match.params.userId !== this.props.match.params.userId) {
        this.update();
      }
    }

    update() {
      const username = this.props.match.params.userId;
      this.props.userPageInit();
      this.props.loadUserTopics(username, topicsPageSize);
      this.props.loadUserReplies(username, topicsPageSize);
      this.props.loadUserFollowedChannels(username);
    }

    render() {
      return (
        <div>
          <Container fixed>
            {this.props.loading ? <LinearProgress variant="query" /> : <div />}
            {this.renderUserPageIntro()}
            <Tabs value={this.state.activeTab} onChange={this.handleChange} aria-label="User activity">
              <Tab data-tut="topics_nav" label="Topics" {...this.a11yProps(0)} className={this.props.classes.text} />
              <Tab data-tut="replies_nav" label="Replies" {...this.a11yProps(1)} className={this.props.classes.text} />
              <Tab data-tut="channels_nav" label="Channels" {...this.a11yProps(2)} className={this.props.classes.text} />
            </Tabs>
            {this.renderUserContent()}
            {this.renderLoadMoreButton()}
          </Container>
        </div>
      );
    }

    renderUserPageIntro() {
      if (this.props.match.params.userId != null) {
        return <ProfileCard username={this.props.match.params.userId} />;
      }
    }

    renderLoadMoreButton() {
      if (this.state.couldExistOlderTopics) {
        return <LoadMoreButton onClick={() => this.props.loadUserTopics(topicsPageSize)} />;
      }
    }

    a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`
      };
    }

    handleChange(event: React.ChangeEvent<{}>, newValue: number) {
      this.setState({ activeTab: newValue });
    }

    renderUserContent() {
      if (this.state.activeTab === 0) {
        return this.props.topics.map(topic => <TopicOverviewCard key={topic.id} topic={topic} />);
      } else if (this.state.activeTab === 1) {
        return this.props.replies.map(reply => <TopicReplyOverviewCard key={reply.id} reply={reply} />);
      } else if (this.state.activeTab === 2 && this.props.userFollowedChannels.length > 0) {
        return (
          <Paper>
            <div style={{ padding: "15px" }}>
              {this.props.userFollowedChannels.map(channel => {
                return (
                  <Link key={channel} to={"/c/" + channel.replace("#", "")}>
                    <CustomChip tag={channel}/>
                  </Link>
                );
              })}
            </div>
          </Paper>
        );
      } else {
        return <div />;
      }
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.userPage.loading,
    topics: store.userPage.topics,
    replies: store.userPage.replies,
    couldExistOlderTopics: store.userPage.couldExistOlderTopics,
    couldExistOlderReplies: store.userPage.couldExistOlderReplies,
    userFollowedChannels: store.userPage.followedChannels
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    userPageInit: () => dispatch(userPageInit()),
    loadUserTopics: (username: string, pageSize: number) => dispatch(loadUserTopics(username, pageSize)),
    loadUserReplies: (username: string, pageSize: number) => dispatch(loadUserReplies(username, pageSize)),
    loadUserFollowedChannels: (username: string, ) => dispatch(loadUserFollowedChannels(username))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserWall);

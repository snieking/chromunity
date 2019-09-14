import React from "react";
import { Link } from "react-router-dom";
import {
  Chip,
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
import { stringToHexColor } from "../../util/util";
import { connect } from "react-redux";
import { ApplicationState } from "../../redux/Store";
import {
  userPageInit,
  loadUserTopics,
  loadUserReplies,
  loadUserFollowedChannels
} from "../../redux/actions/UserPageActions";
import { pageView } from "../../GoogleAnalytics";

const styles = (theme: Theme) =>
  createStyles({
    text: {
      color: theme.palette.primary.main
    }
  });

interface MatchParams {
  userId: string;
}

export interface UserWallProps extends RouteComponentProps<MatchParams>, WithStyles<typeof styles> {
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

export interface UserWallState {
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

      this.props.userPageInit(props.match.params.userId);

      this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(): void {
      this.props.loadUserTopics(topicsPageSize);
      this.props.loadUserReplies(topicsPageSize);
      this.props.loadUserFollowedChannels();

      pageView();
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
                    <Chip
                      size="small"
                      label={"#" + channel}
                      style={{
                        marginLeft: "1px",
                        marginRight: "1px",
                        marginBottom: "3px",
                        backgroundColor: stringToHexColor(channel),
                        cursor: "pointer"
                      }}
                    />
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

    render() {
      return (
        <div>
          <Container fixed>
            {this.props.loading ? <LinearProgress variant="query" /> : <div />}
            {this.renderUserPageIntro()}
            <Tabs value={this.state.activeTab} onChange={this.handleChange} aria-label="User activity">
              <Tab label="Topics" {...this.a11yProps(0)} className={this.props.classes.text} />
              <Tab label="Replies" {...this.a11yProps(1)} className={this.props.classes.text} />
              <Tab label="Channels" {...this.a11yProps(2)} className={this.props.classes.text} />
            </Tabs>
            {this.renderUserContent()}
            {this.renderLoadMoreButton()}
          </Container>
        </div>
      );
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
    userPageInit: (username: string) => dispatch(userPageInit(username)),
    loadUserTopics: (pageSize: number) => dispatch(loadUserTopics(pageSize)),
    loadUserReplies: (pageSize: number) => dispatch(loadUserReplies(pageSize)),
    loadUserFollowedChannels: () => dispatch(loadUserFollowedChannels())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserWall);

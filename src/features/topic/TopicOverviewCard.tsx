import React from "react";
import { Link } from "react-router-dom";
import { Topic, ChromunityUser } from "../../types";
import {
  Badge,
  Card,
  CardActionArea,
  CardContent,
  createStyles,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { prepareUrlPath, shouldBeFiltered, toLowerCase } from "../../shared/util/util";
import {
  getWallPreviouslyRefreshed,
  ifEmptyAvatarThenPlaceholder,
  isTopicReadInSession,
} from "../../shared/util/user-util";
import { getUserSettingsCached } from "../../core/services/UserService";
import { Redirect } from "react-router";
import { countTopicReplies, getTopicStarRaters } from "../../core/services/TopicService";
import { getTopicChannelBelongings } from "../../core/services/ChannelService";
import { COLOR_ORANGE, COLOR_YELLOW } from "../../theme";
import Avatar, { AVATAR_SIZE } from "../../shared/Avatar";
import Timestamp from "../../shared/Timestamp";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import CustomChip from "../../shared/CustomChip";
import NewBadge from "./NewBadge";
import StarRating from "../../shared/star-rating/StarRating";

const styles = (theme: Theme) =>
  createStyles({
    representativeColor: {
      color: COLOR_ORANGE,
    },
    authorName: {
      display: "block",
      marginTop: "10px",
      marginRight: "10px",
      marginLeft: "5px",
    },
    ratingWrapper: {
      float: "left",
      marginTop: "10px",
    },
    overviewDetails: {
      marginLeft: "42px",
    },
    iconYellow: {
      color: COLOR_YELLOW,
    },
    tagChips: {
      display: "inline",
    },
    removed: {
      opacity: 0.5,
    },
    replyStatusText: {
      [theme.breakpoints.down("md")]: {
        display: "none",
      },
    },
  });

interface Props extends WithStyles<typeof styles> {
  topic: Topic;
  representatives: string[];
  distrustedUsers: string[];
  user: ChromunityUser;
}

interface State {
  redirectToFullCard: boolean;
  avatar: string;
  channels: string[];
  numberOfReplies: number;
}

const DAY_IN_MILLIS = 86_400_000;

const TopicOverviewCard = withStyles(styles)(
  class extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        channels: [],
        redirectToFullCard: false,
        avatar: "",
        numberOfReplies: 0,
      };

      this.authorIsRepresentative = this.authorIsRepresentative.bind(this);
      this.setAvatar = this.setAvatar.bind(this);
    }

    componentDidMount() {
      getTopicChannelBelongings(this.props.topic.id).then((channels) => this.setState({ channels: channels }));
      this.setAvatar();
      countTopicReplies(this.props.topic.id).then((count) => this.setState({ numberOfReplies: count }));
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
      if (this.props.topic.latest_poster !== prevProps.topic.latest_poster) {
        this.setAvatar();
      }
    }

    render() {
      if (this.state.redirectToFullCard) {
        return <Redirect to={"/t/" + this.props.topic.id + "/" + prepareUrlPath(this.props.topic.title)} push />;
      } else {
        return (
          <div
            className={
              this.props.user != null &&
              this.props.representatives.includes(toLowerCase(this.props.user.name)) &&
              shouldBeFiltered(this.props.topic.moderated_by, this.props.distrustedUsers)
                ? this.props.classes.removed
                : ""
            }
          >
            <Card raised={true} key={this.props.topic.id} style={{ zIndex: 0 }}>
              <CardActionArea onClick={() => this.setState({ redirectToFullCard: true })}>
                {this.isNewTopic() && <NewBadge />}
                {this.renderCardContent()}
              </CardActionArea>
            </Card>
          </div>
        );
      }
    }

    isNewTopic() {
      if (this.props.user == null || toLowerCase(this.props.user.name) === toLowerCase(this.props.topic.author)) {
        return false;
      }

      const topicCreated = this.props.topic.timestamp;
      const wallPreviouslyRead = getWallPreviouslyRefreshed();

      return (
        topicCreated > wallPreviouslyRead &&
        Date.now() - topicCreated < DAY_IN_MILLIS &&
        !isTopicReadInSession(this.props.topic.id)
      );
    }

    setAvatar() {
      getUserSettingsCached(
        this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author,
        1440
      ).then((settings) =>
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(
            settings.avatar,
            this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author
          ),
        })
      );
    }

    authorIsRepresentative(): boolean {
      return this.props.representatives.includes(
        this.props.topic.latest_poster != null
          ? this.props.topic.latest_poster.toLocaleLowerCase()
          : this.props.topic.author.toLocaleLowerCase()
      );
    }

    renderReplyStatus() {
      return (
        <div style={{ float: "right" }}>
          <Link
            to={
              "/u/" +
              (this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author)
            }
          >
            <Typography
              gutterBottom
              variant="subtitle2"
              component="span"
              className={this.authorIsRepresentative() ? this.props.classes.representativeColor : ""}
            >
              <span className={this.props.classes.authorName}>
                @{this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author}
              </span>
            </Typography>
          </Link>
          <div style={{ float: "right" }}>
            <Badge color="primary" badgeContent={this.state.numberOfReplies} max={999}>
              <Avatar
                src={this.state.avatar}
                size={AVATAR_SIZE.SMALL}
                name={this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author}
              />
            </Badge>
          </div>
        </div>
      );
    }

    renderTagChips() {
      if (this.state.channels != null) {
        return (
          <div className={this.props.classes.tagChips}>
            {this.state.channels.map((tag) => {
              return (
                <Link key={this.props.topic.id + ":" + tag} to={"/c/" + tag.replace("#", "")}>
                  <CustomChip tag={tag} />
                </Link>
              );
            })}
          </div>
        );
      }
    }

    renderCardContent() {
      return (
        <CardContent>
          <div className={this.props.classes.ratingWrapper}>
            <StarRating starRatingFetcher={() => getTopicStarRaters(this.props.topic.id)} />
          </div>
          {this.renderReplyStatus()}
          <div className={this.props.classes.overviewDetails}>
            <Timestamp milliseconds={this.props.topic.last_modified} />
            <Typography variant="subtitle1" component="span" style={{ marginRight: "10px" }}>
              {this.props.topic.title}
            </Typography>
            {this.renderTagChips()}
          </div>
        </CardContent>
      );
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    distrustedUsers: store.account.distrustedUsers,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
  };
};

export default connect(mapStateToProps, null)(TopicOverviewCard);

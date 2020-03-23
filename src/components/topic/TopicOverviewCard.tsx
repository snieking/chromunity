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
  WithStyles
} from "@material-ui/core";
import { prepareUrlPath, shouldBeFiltered, toLowerCase } from "../../util/util";
import { ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import { StarBorder, StarRate } from "@material-ui/icons";
import { getUserSettingsCached } from "../../blockchain/UserService";
import { Redirect } from "react-router";
import { countTopicReplies, getTopicStarRaters } from "../../blockchain/TopicService";
import { getTopicChannelBelongings } from "../../blockchain/ChannelService";
import { COLOR_ORANGE, COLOR_YELLOW } from "../../theme";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import Timestamp from "../common/Timestamp";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import CustomChip from "../common/CustomChip";

const styles = (theme: Theme) =>
  createStyles({
    representativeColor: {
      color: COLOR_ORANGE
    },
    authorName: {
      display: "block",
      marginTop: "10px",
      marginRight: "10px",
      marginLeft: "5px"
    },
    rating: {
      marginTop: "10px"
    },
    overviewDetails: {
      marginLeft: "42px"
    },
    iconYellow: {
      color: COLOR_YELLOW
    },
    tagChips: {
      display: "inline"
    },
    removed: {
      opacity: 0.5
    },
    replyStatusText: {
      [theme.breakpoints.down("md")]: {
        display: "none"
      }
    }
  });

interface Props extends WithStyles<typeof styles> {
  topic: Topic;
  representatives: string[];
  distrustedUsers: string[];
  user: ChromunityUser;
}

interface State {
  stars: number;
  ratedByMe: boolean;
  redirectToFullCard: boolean;
  avatar: string;
  channels: string[];
  numberOfReplies: number;
}

const TopicOverviewCard = withStyles(styles)(
  class extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        stars: 0,
        channels: [],
        ratedByMe: false,
        redirectToFullCard: false,
        avatar: "",
        numberOfReplies: 0
      };

      this.authorIsRepresentative = this.authorIsRepresentative.bind(this);
      this.setAvatar = this.setAvatar.bind(this);
    }

    componentDidMount() {
      getTopicChannelBelongings(this.props.topic.id).then(channels => this.setState({ channels: channels }));

      const user: ChromunityUser = this.props.user;
      this.setAvatar();
      getTopicStarRaters(this.props.topic.id).then(usersWhoStarRated =>
        this.setState({
          stars: usersWhoStarRated.length,
          ratedByMe: usersWhoStarRated.includes(user != null && user.name.toLocaleLowerCase())
        })
      );
      countTopicReplies(this.props.topic.id).then(count => this.setState({ numberOfReplies: count }));
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
              (this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name)))
                && shouldBeFiltered(this.props.topic.moderated_by, this.props.distrustedUsers)
                ? this.props.classes.removed
                : ""
            }
          >
            <Card raised={true} key={this.props.topic.id}>
              <CardActionArea onClick={() => this.setState({ redirectToFullCard: true })}>
                {this.renderCardContent()}
              </CardActionArea>
            </Card>
          </div>
        );
      }
    }

    setAvatar() {
      getUserSettingsCached(
        this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author,
        1440
      ).then(settings =>
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(
            settings.avatar,
            this.props.topic.latest_poster != null ? this.props.topic.latest_poster : this.props.topic.author
          )
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
            {this.state.channels.map(tag => {
              return (
                <Link key={this.props.topic.id + ":" + tag} to={"/c/" + tag.replace("#", "")}>
                  <CustomChip tag={tag}/>
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
          <div style={{ float: "left" }}>
            <div className={this.props.classes.rating}>
              <Badge color="secondary" badgeContent={this.state.stars}>
                {this.state.ratedByMe ? <StarRate className={this.props.classes.iconYellow} /> : <StarBorder />}
              </Badge>
            </div>
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
    representatives: store.government.representatives.map(rep => toLowerCase(rep))
  };
};

export default connect(mapStateToProps, null)(TopicOverviewCard);

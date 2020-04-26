import React from "react";
import { Link } from "react-router-dom";
import { TopicReply, ChromunityUser } from "../../types";
import {
  Card,
  CardActionArea,
  CardContent,
  createStyles,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { shouldBeFiltered, timeAgoReadable, toLowerCase } from "../../shared/util/util";
import { ifEmptyAvatarThenPlaceholder } from "../../shared/util/user-util";
import { getUserSettingsCached } from "../../core/services/UserService";
import { Redirect } from "react-router";
import { getReplyStarRaters } from "../../core/services/TopicService";
import Avatar, { AVATAR_SIZE } from "../../shared/Avatar";
import Timestamp from "../../shared/Timestamp";
import { COLOR_ORANGE, COLOR_YELLOW } from "../../theme";
import MarkdownRenderer from "../../shared/MarkdownRenderer";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import StarRating from "../../shared/star-rating/StarRating";

const styles = createStyles({
  authorName: {
    display: "block",
    marginTop: "10px",
    marginRight: "10px",
    marginLeft: "10px"
  },
  ratingWrapper: {
    float: "left",
    marginTop: "10px"
  },
  overviewDetails: {
    marginLeft: "42px",
    marginBottom: "-15px"
  },
  representativeColor: {
    color: COLOR_ORANGE
  },
  message: {
    marginTop: "-15px"
  },
  iconYellow: {
    color: COLOR_YELLOW
  },
  removed: {
    opacity: 0.5
  }
});

interface Props extends WithStyles<typeof styles> {
  reply: TopicReply;
  representatives: string[];
  distrustedUsers: string[];
  user: ChromunityUser;
}

interface State {
  redirectToTopic: boolean;
  avatar: string;
}

const TopicReplyOverviewCard = withStyles(styles)(
  class extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        redirectToTopic: false,
        avatar: ""
      };

      this.authorIsRepresentative = this.authorIsRepresentative.bind(this);
    }

    render() {
      if (this.state.redirectToTopic) {
        return <Redirect to={"/t/" + this.props.reply.topic_id + "#" + this.props.reply.id} push />;
      } else {
        return (
          <div
            className={
              this.props.user != null &&
              this.props.representatives.includes(toLowerCase(this.props.user.name)) &&
              shouldBeFiltered(this.props.reply.moderated_by, this.props.distrustedUsers)
                ? this.props.classes.removed
                : ""
            }
          >
            <Card key={this.props.reply.id}>
              <CardActionArea onClick={() => this.setState({ redirectToTopic: true })}>
                {this.renderCardContent()}
              </CardActionArea>
            </Card>
          </div>
        );
      }
    }

    componentDidMount() {
      getUserSettingsCached(this.props.reply.author, 1440).then(settings => {
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.reply.author)
        });
      });
    }

    authorIsRepresentative(): boolean {
      return this.props.representatives.includes(this.props.reply.author.toLocaleLowerCase());
    }

    renderAuthor() {
      return (
        <div style={{ float: "right" }}>
          <Link to={"/u/" + this.props.reply.author}>
            <Typography
              gutterBottom
              variant="subtitle2"
              component="span"
              className={this.authorIsRepresentative() ? this.props.classes.representativeColor : ""}
            >
              <span className={this.props.classes.authorName}>@{this.props.reply.author}</span>
            </Typography>
          </Link>
          <div style={{ float: "right" }}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.SMALL} name={this.props.reply.author} />
          </div>
        </div>
      );
    }

    renderCardContent() {
      return (
        <CardContent>
          <div className={this.props.classes.ratingWrapper}>
            <StarRating starRatingFetcher={() => getReplyStarRaters(this.props.reply.id)} />
          </div>
          {this.renderAuthor()}
          <div className={this.props.classes.overviewDetails}>
            <Timestamp milliseconds={this.props.reply.timestamp} />
            <Typography
              variant="subtitle1"
              component="p"
              style={{ marginRight: "10px" }}
              className={this.props.classes.message}
            >
              <MarkdownRenderer text={this.props.reply.message} />
            </Typography>
          </div>
        </CardContent>
      );
    }

    renderTimeAgo(timestamp: number) {
      return (
        <Typography className="timestamp" variant="inherit" component="p">
          {timeAgoReadable(timestamp)}
        </Typography>
      );
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map(rep => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers
  };
};

export default connect(mapStateToProps, null)(TopicReplyOverviewCard);

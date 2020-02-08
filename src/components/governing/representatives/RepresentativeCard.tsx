import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Grid,
  Tooltip,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import { ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { ChatBubble, Face, Favorite, Report, SentimentVeryDissatisfiedSharp, Star } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import { getTimesRepresentative } from "../../../blockchain/RepresentativesService";
import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser
} from "../../../blockchain/TopicService";
import { countUserFollowers } from "../../../blockchain/FollowingService";
import { representativeCardStyles } from "../sharedStyles";



export interface RepresentativeCardProps extends WithStyles<typeof representativeCardStyles> {
  name: string;
}

export interface RepresentativeCardState {
  avatar: string;
  timesRepresentative: number;
  topicRating: number;
  replyRating: number;
  followers: number;
  topics: number;
  replies: number;
}

const RepresentativeCard = withStyles(representativeCardStyles)(
  class extends React.Component<RepresentativeCardProps, RepresentativeCardState> {
    constructor(props: RepresentativeCardProps) {
      super(props);
      this.state = {
        avatar: "",
        timesRepresentative: 0,
        topicRating: 0,
        replyRating: 0,
        followers: 0,
        topics: 0,
        replies: 0
      };
    }

    render() {
      if (this.props.name != null) {
        return (
          <Grid item xs={6} sm={6} md={3}>
            <Card key={"representative-" + this.props.name} className={this.props.classes.representativeCard}>
              <CardContent>
                <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} name={this.props.name} />
                <Typography gutterBottom variant="h6" component="p">
                  <Link className={this.props.classes.link} to={"/u/" + this.props.name}>
                    @{this.props.name}
                  </Link>
                </Typography>
                <br />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Tooltip title={"Number of times @" + this.props.name + " has won elections"}>
                      <div>
                        <Badge badgeContent={this.state.timesRepresentative} color="secondary" showZero>
                          <Face fontSize="large" />
                        </Badge>
                        <Typography variant="body2" component="p" className={this.props.classes.statsDescr}>
                          Elected
                        </Typography>
                      </div>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={6}>
                    <Tooltip title={"Number of star ratings that @" + this.props.name + " received"}>
                      <div>
                        <Badge
                          badgeContent={this.state.topicRating + this.state.replyRating}
                          color="secondary"
                          showZero
                        >
                          <Star fontSize="large" />
                        </Badge>
                        <Typography variant="body2" component="p" className={this.props.classes.statsDescr}>
                          Ratings
                        </Typography>
                      </div>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={6}>
                    <Tooltip title={"Number of users who follow @" + this.props.name}>
                      <div>
                        <Badge badgeContent={this.state.followers} color="secondary" showZero>
                          <Favorite fontSize="large" />
                        </Badge>
                        <Typography variant="body2" component="p" className={this.props.classes.statsDescr}>
                          Followers
                        </Typography>
                      </div>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={6}>
                    <Tooltip title={"Messages sent by @" + this.props.name}>
                      <div>
                        <Badge badgeContent={this.state.topics + this.state.replies} color="secondary" showZero>
                          <ChatBubble fontSize="large" />
                        </Badge>
                        <Typography variant="body2" component="p" className={this.props.classes.statsDescr}>
                          Messages
                        </Typography>
                      </div>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={6}>
                    <Tooltip title={"Users who doesn't trust @" + this.props.name + " as a representative"}>
                      <div>
                        <Badge badgeContent={1} color="secondary" showZero max={99999}>
                          <SentimentVeryDissatisfiedSharp fontSize="large" />
                        </Badge>
                        <Typography variant="body2" component="span" className={this.props.classes.statsDescr}>
                          Distrusts
                        </Typography>
                      </div>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={6}>
                    <Tooltip title={"Number of users that @" + this.props.name + " have distrusted"}>
                      <div>
                        <Badge badgeContent={1} color="secondary" showZero max={99999}>
                          <Report fontSize="large" />
                        </Badge>
                        <Typography variant="body2" component="span" className={this.props.classes.statsDescr}>
                          Distrusted
                        </Typography>
                      </div>
                    </Tooltip>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        );
      } else {
        return <div />;
      }
    }

    componentDidMount() {
      getUserSettingsCached(this.props.name, 1440).then(settings =>
        this.setState({ avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.name) })
      );

      getTimesRepresentative(this.props.name).then(count => this.setState({ timesRepresentative: count }));
      countUserFollowers(this.props.name).then(count => this.setState({ followers: count }));
      countTopicStarRatingForUser(this.props.name).then(count => this.setState({ topicRating: count }));
      countReplyStarRatingForUser(this.props.name).then(count => this.setState({ replyRating: count }));
      countTopicsByUser(this.props.name).then(count => this.setState({ topics: count }));
      countRepliesByUser(this.props.name).then(count => this.setState({ replies: count }));
    }
  }
);

export default RepresentativeCard;

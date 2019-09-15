import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  createStyles,
  Grid,
  Theme,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import { ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { COLOR_ORANGE } from "../../../theme";
import { Face, Star } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import { getTimesRepresentative } from "../../../blockchain/RepresentativesService";
import { countReplyStarRatingForUser, countTopicStarRatingForUser } from "../../../blockchain/TopicService";

const styles = (theme: Theme) =>
  createStyles({
    representativeCard: {
      textAlign: "center"
    },
    link: {
      color: COLOR_ORANGE
    },
    statsDescr: {
      position: "relative",
      [theme.breakpoints.up("xs")]: { left: 15 },
      [theme.breakpoints.only("sm")]: { left: 0 },
      textAlign: "center"
    }
  });

export interface RepresentativeCardProps extends WithStyles<typeof styles> {
  name: string;
}

export interface RepresentativeCardState {
  avatar: string;
  timesRepresentative: number;
  topicRating: number;
  replyRating: number;
}

const RepresentativeCard = withStyles(styles)(
  class extends React.Component<RepresentativeCardProps, RepresentativeCardState> {
    constructor(props: RepresentativeCardProps) {
      super(props);
      this.state = { avatar: "", timesRepresentative: 0, topicRating: 0, replyRating: 0 };
    }

    render() {
      if (this.props.name != null) {
        return (
          <Grid item xs={4}>
            <Card key={"representative-" + this.props.name} className={this.props.classes.representativeCard}>
              <CardContent>
                <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} />
                <Typography gutterBottom variant="subtitle1" component="p">
                  <Link className={this.props.classes.link} to={"/u/" + this.props.name}>
                    @{this.props.name}
                  </Link>
                </Typography>
                <br />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Badge badgeContent={this.state.timesRepresentative} color="secondary" showZero>
                      <Face className="menu-item-button" />
                    </Badge>
                    <Typography variant="body1" component="span" className={this.props.classes.statsDescr}>
                      Elected
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Badge badgeContent={this.state.topicRating + this.state.replyRating} color="secondary" showZero>
                      <Star />
                    </Badge>
                    <Typography variant="body1" component="span" className={this.props.classes.statsDescr}>
                      Ratings
                    </Typography>
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
      countTopicStarRatingForUser(this.props.name).then(count => this.setState({ topicRating: count }));
      countReplyStarRatingForUser(this.props.name).then(count => this.setState({ replyRating: count }));
    }
  }
);

export default RepresentativeCard;

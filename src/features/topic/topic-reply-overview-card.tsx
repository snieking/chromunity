import React from 'react';
import { Card, CardActionArea, CardContent, createStyles, Typography, withStyles, WithStyles } from '@material-ui/core';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { TopicReply, ChromunityUser } from '../../types';
import { shouldBeFiltered, timeAgoReadable, toLowerCase } from '../../shared/util/util';
import { ifEmptyAvatarThenPlaceholder } from '../../shared/util/user-util';
import { getUserSettingsCached } from '../../core/services/user-service';
import { getReplyStarRaters } from '../../core/services/topic-service';
import Avatar, { AVATAR_SIZE } from '../../shared/avatar';
import Timestamp from '../../shared/timestamp';
import { COLOR_YELLOW } from '../../theme';
import MarkdownRenderer from '../../shared/markdown-renderer';
import ApplicationState from '../../core/application-state';
import StarRating from '../../shared/star-rating/star-rating';
import NameText from '../../shared/name-displays/name-text';

const styles = createStyles({
  ratingWrapper: {
    float: 'left',
    marginTop: '10px',
  },
  overviewDetails: {
    marginLeft: '42px',
    marginBottom: '-15px',
  },
  message: {
    marginTop: '-15px',
  },
  iconYellow: {
    color: COLOR_YELLOW,
  },
  removed: {
    opacity: 0.5,
  },
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
        avatar: '',
      };
    }

    componentDidMount() {
      getUserSettingsCached(this.props.reply.author, 1440).then((settings) => {
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.reply.author),
        });
      });
    }

    renderAuthor() {
      return (
        <div style={{ float: 'right' }}>
          <NameText name={this.props.reply.author} />
          <div style={{ float: 'right' }}>
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
              style={{ marginRight: '10px' }}
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

    render() {
      if (this.state.redirectToTopic) {
        return <Redirect to={`/t/${this.props.reply.topic_id}#${this.props.reply.id}`} push />;
      }
      return (
        <div
          className={
            this.props.user != null &&
            this.props.representatives.includes(toLowerCase(this.props.user.name)) &&
            shouldBeFiltered(this.props.reply.moderated_by, this.props.distrustedUsers)
              ? this.props.classes.removed
              : ''
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
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers,
  };
};

export default connect(mapStateToProps, null)(TopicReplyOverviewCard);

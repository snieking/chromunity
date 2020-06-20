import React from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { Delete, Report, UnfoldMore } from '@material-ui/icons';
import * as BoomerangCache from 'boomerang-cache';
import { connect } from 'react-redux';
import CardActions from '@material-ui/core/CardActions';
import Divider from '@material-ui/core/Divider';
import { TopicReply, ChromunityUser } from '../../types';
import { ifEmptyAvatarThenPlaceholder } from '../../shared/util/user-util';
import { getUserSettingsCached } from '../../core/services/user-service';
import {
  createTopicSubReply,
  deleteReply,
  getReplyStarRaters,
  getTopicSubReplies,
  giveReplyStarRating,
  modifyReply,
  removeReplyStarRating,
} from '../../core/services/topic-service';

import {
  reportReply,
  removeTopicReply,
  hasReportedId,
  REMOVE_TOPIC_REPLY_OP_ID,
  hasReportedReply,
} from '../../core/services/representatives-service';
import EditMessageButton from '../../shared/buttons/edit-message-button';
import Avatar, { AVATAR_SIZE } from '../../shared/avatar';
import Timestamp from '../../shared/timestamp';
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from '../../theme';
import MarkdownRenderer from '../../shared/markdown-renderer';
import ConfirmDialog from '../../shared/confirm-dialog';
import ApplicationState from '../../core/application-state';
import { shouldBeFiltered, toLowerCase, uniqueId } from '../../shared/util/util';
import TextToolbar from '../../shared/text-toolbar/text-toolbar';
import PreviewLinks from '../../shared/preview-links';
import { notifyError, notifySuccess } from '../../core/snackbar/redux/snackbar-actions';
import StarRating from '../../shared/star-rating/star-rating';
import { setRateLimited, setQueryPending, setOperationPending } from '../../shared/redux/common-actions';
import ReplyButton from '../../shared/buttons/reply-button';
import TippingButton from '../../shared/buttons/tipping-button';

const styles = (theme: Theme) =>
  createStyles({
    removed: {
      opacity: 0.25,
    },
    authorName: {
      display: 'block',
      paddingTop: '2px',
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    authorLink: {
      float: 'right',
      borderRadius: '0 0 0 5px',
      marginTop: '-18px',
      marginBottom: '7px',
      marginRight: '-16px',
    },
    content: {
      marginRight: '5px',
      whiteSpace: 'normal',
      maxWidth: '95%',
    },
    bottomBar: {
      marginTop: '7px',
      marginBottom: '-22px',
      marginLeft: '-10px',
    },
    userColor: {
      backgroundColor: theme.palette.secondary.main,
    },
    repColor: {
      backgroundColor: COLOR_ORANGE,
    },
    iconYellow: {
      color: COLOR_YELLOW,
    },
    iconOrange: {
      color: COLOR_ORANGE,
    },
    iconRed: {
      color: COLOR_RED,
    },
    editorWrapper: {
      position: 'relative',
    },
    highlighted: {
      borderColor: theme.palette.secondary.main,
      borderSize: '1px',
      border: 'solid',
    },
    hidden: {
      display: 'none',
    },
    ratingWrapper: {
      display: 'inline',
    },
    cardActions: {
      width: '100%',
      display: 'flex',
      marginTop: '-10px',
    },
  });

interface Props extends WithStyles<typeof styles> {
  user: ChromunityUser;
  topicId: string;
  reply: TopicReply;
  indention: number;
  representatives: string[];
  distrustedUsers: string[];
  rateLimited: boolean;
  cascadeOpenSubReplies?: () => void;
  notifyError: typeof notifyError;
  notifySuccess: typeof notifySuccess;
  setRateLimited: typeof setRateLimited;
  setQueryPending: typeof setQueryPending;
  setOperationPending: typeof setOperationPending;
}

interface State {
  stars: number;
  ratedByMe: boolean;
  replyBoxOpen: boolean;
  replyMessage: string;
  hideThreadConfirmDialogOpen: boolean;
  avatar: string;
  subReplies: TopicReply[];
  removeReplyDialogOpen: boolean;
  reportReplyDialogOpen: boolean;
  replyReported: boolean;
  timeLeftUntilNoLongerModifiable: number;
  renderSubReplies: boolean;
  interval: NodeJS.Timeout;
}

const allowedEditTimeMillis = 300000;
const replyMaxRenderAgeMillis: number = 1000 * 60 * 60 * 24;

const replyUnfoldCache = BoomerangCache.create('reply-unfold-bucket', {
  storage: 'local',
  encrypt: false,
});

const TopicReplyCard = withStyles(styles)(
  class extends React.Component<Props, State> {
    private readonly textInput: React.RefObject<HTMLInputElement>;

    private readonly cardRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
      super(props);

      const previouslyFoldedSubReplies: boolean = replyUnfoldCache.get(props.reply.id) != null;
      const decisionToRenderSubReplies: boolean = replyUnfoldCache.get(props.reply.id);
      const shouldRenderDueToTimestamp: boolean = props.reply.timestamp + replyMaxRenderAgeMillis > Date.now();

      this.state = {
        stars: 0,
        ratedByMe: false,
        replyBoxOpen: false,
        replyMessage: '',
        hideThreadConfirmDialogOpen: false,
        avatar: '',
        subReplies: [],
        removeReplyDialogOpen: false,
        reportReplyDialogOpen: false,
        replyReported: false,
        timeLeftUntilNoLongerModifiable: 0,
        renderSubReplies: previouslyFoldedSubReplies ? decisionToRenderSubReplies : shouldRenderDueToTimestamp,
        interval: null,
      };

      if (!previouslyFoldedSubReplies && shouldRenderDueToTimestamp && this.props.cascadeOpenSubReplies != null) {
        this.props.cascadeOpenSubReplies();
      }

      this.textInput = React.createRef();
      this.cardRef = React.createRef();

      this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
      this.sendReply = this.sendReply.bind(this);
      this.editReplyMessage = this.editReplyMessage.bind(this);
      this.deleteReplyMessage = this.deleteReplyMessage.bind(this);
      this.reportReply = this.reportReply.bind(this);
      this.closeReportReply = this.closeReportReply.bind(this);
      this.isRepresentative = this.isRepresentative.bind(this);
      this.addTextFromToolbarInReply = this.addTextFromToolbarInReply.bind(this);
      this.openSubReplies = this.openSubReplies.bind(this);
    }

    componentDidMount() {
      const { user } = this.props;

      getUserSettingsCached(this.props.reply.author, 1440).then((settings) => {
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.reply.author),
        });
      });
      getReplyStarRaters(this.props.reply.id).then((usersWhoStarRated) =>
        this.setState({
          stars: usersWhoStarRated.length,
          ratedByMe: usersWhoStarRated.includes(user != null && user.name.toLocaleLowerCase()),
        })
      );

      this.setState({ replyReported: hasReportedReply(user, this.props.reply) });

      getTopicSubReplies(this.props.reply.id, user).then((replies) => this.setState({ subReplies: replies }));

      const interval = setInterval(() => {
        getTopicSubReplies(this.props.reply.id, user).then((replies) => this.setState({ subReplies: replies }));
      }, 30000);

      this.setState({ interval });

      const modifiableUntil = this.props.reply.timestamp + allowedEditTimeMillis;

      if (modifiableUntil > Date.now()) {
        setInterval(() => {
          if (modifiableUntil >= Date.now()) {
            this.setState({ timeLeftUntilNoLongerModifiable: this.getTimeLeft(modifiableUntil) });
          }
        }, 1000);
      }
      if (this.isReplyHighlighted()) {
        this.openSubReplies();
        this.scrollToReply();
      }
    }

    componentWillUnmount() {
      if (this.state.interval) {
        clearInterval(this.state.interval);
      }
    }

    getTimeLeft(until: number): number {
      const currentTime = Date.now();
      return currentTime < until ? Math.floor((until - currentTime) / 1000) : 0;
    }

    scrollToReply = () =>
      this.cardRef && this.cardRef.current ? window.scrollTo(0, this.cardRef.current.offsetTop) : null;

    openSubReplies() {
      this.setState({ renderSubReplies: true });
      replyUnfoldCache.set(this.props.reply.id, true, replyMaxRenderAgeMillis * 7);
      if (this.props.cascadeOpenSubReplies != null) {
        this.props.cascadeOpenSubReplies();
      }
    }

    isReplyHighlighted(): boolean {
      return window.location.href.indexOf(`#${this.props.reply.id}`) > -1;
    }

    bottomBar() {
      const { user } = this.props;
      const { id } = this.props.reply;

      if (user != null) {
        return (
          <CardActions disableSpacing className={this.props.classes.cardActions}>
            <div className={this.props.classes.ratingWrapper}>
              <StarRating
                starRatingFetcher={() => getReplyStarRaters(id)}
                incrementRating={() => giveReplyStarRating(user, id)}
                removeRating={() => removeReplyStarRating(user, id)}
              />
            </div>
            <TippingButton receiver={this.props.reply.author} />
            {this.props.reply.timestamp + allowedEditTimeMillis > Date.now() &&
            user != null &&
            this.props.reply.author === user.name ? (
              <EditMessageButton
                modifiableUntil={this.state.timeLeftUntilNoLongerModifiable}
                value={this.props.reply.message}
                editFunction={this.editReplyMessage}
                deleteFunction={this.deleteReplyMessage}
              />
            ) : null}

            <ConfirmDialog
              text="This action will report the message"
              open={this.state.reportReplyDialogOpen}
              onClose={this.closeReportReply}
              onConfirm={this.reportReply}
            />

            {!this.isRepresentative() && !this.state.replyReported && (
              <IconButton
                aria-label="Report"
                onClick={() => this.setState({ reportReplyDialogOpen: true })}
                disabled={this.props.rateLimited}
              >
                <Tooltip title="Report">
                  <Report />
                </Tooltip>
              </IconButton>
            )}

            {this.subRepliesButton()}
            {this.renderAdminActions()}

            <ReplyButton
              onClick={() =>
                this.setState((prevState) => ({
                  replyBoxOpen: !prevState.replyBoxOpen,
                }))
              }
              size="small"
              toggled={this.state.replyBoxOpen}
            />
          </CardActions>
        );
      }
      return (
        <CardActions>
          <div className={this.props.classes.ratingWrapper}>
            <StarRating starRatingFetcher={() => getReplyStarRaters(id)} />
          </div>
          {this.subRepliesButton()}
        </CardActions>
      );
    }

    subRepliesButton() {
      if (this.state.subReplies.length > 0) {
        return (
          <IconButton aria-label="Load replies" onClick={() => this.toggleRenderReply()}>
            <Tooltip title="Toggle replies">
              <Badge badgeContent={!this.state.renderSubReplies ? this.state.subReplies.length : 0} color="secondary">
                <UnfoldMore />
              </Badge>
            </Tooltip>
          </IconButton>
        );
      }
      return <div style={{ display: 'inline-block' }} />;
    }

    toggleRenderReply() {
      replyUnfoldCache.set(this.props.reply.id, !this.state.renderSubReplies, replyMaxRenderAgeMillis * 7);
      this.setState((prevState) => ({ renderSubReplies: !prevState.renderSubReplies }));
    }

    editReplyMessage(text: string) {
      this.props.setOperationPending(true);
      modifyReply(this.props.user, this.props.reply.id, text)
        .then(() => window.location.reload())
        .catch((error) => {
          this.props.notifyError(error.message);
          this.props.setRateLimited();
        })
        .finally(() => this.props.setOperationPending(false));
    }

    deleteReplyMessage() {
      this.props.setOperationPending(true);
      deleteReply(this.props.user, this.props.reply.id)
        .then(() => window.location.reload())
        .catch((error) => {
          this.props.notifyError(error.message);
          this.props.setRateLimited();
        })
        .finally(() => this.props.setOperationPending(false));
    }

    closeReportReply() {
      this.setState({ reportReplyDialogOpen: false });
    }

    reportReply() {
      this.closeReportReply();

      if (this.props.user != null) {
        this.props.setOperationPending(true);
        reportReply(this.props.user, this.props.reply)
          .catch((error) => {
            this.props.notifyError(error.message);
            this.props.setRateLimited();
          })
          .then(() => this.setState({ replyReported: true }))
          .finally(() => this.props.setOperationPending(false));
      } else {
        window.location.href = '/user/login';
      }
    }

    isRepresentative() {
      const { user } = this.props;
      return user != null && this.props.representatives.includes(user.name.toLocaleLowerCase());
    }

    addTextFromToolbarInReply(text: string) {
      const startPosition = this.textInput.current.selectionStart;

      this.setState((prevState) => ({
        replyMessage: [
          prevState.replyMessage.slice(0, startPosition),
          text,
          prevState.replyMessage.slice(startPosition),
        ].join(''),
      }));

      setTimeout(() => {
        this.textInput.current.selectionStart = startPosition + text.length;
        this.textInput.current.selectionEnd = startPosition + text.length;
      }, 100);
    }

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ replyMessage: event.target.value });
    }

    sendReply() {
      const message: string = this.state.replyMessage;
      this.setState({ replyBoxOpen: false, replyMessage: '' });
      this.props.setOperationPending(true);
      createTopicSubReply(this.props.user, this.props.topicId, this.props.reply.id, message, this.props.reply.author)
        .catch((error) => {
          this.props.notifyError(error.message);
          this.props.setRateLimited();
        })
        .then(() => {
          this.props.notifySuccess('Reply sent');
          getTopicSubReplies(this.props.reply.id).then((replies) => this.setState({ subReplies: replies }));
          this.openSubReplies();
        })
        .finally(() => this.props.setOperationPending(false));
    }

    renderReplyBox() {
      const { user } = this.props;
      if (this.state.replyBoxOpen && user == null) {
        window.location.href = '/user/login';
      } else if (this.state.replyBoxOpen) {
        return (
          <div style={{ margin: '15px', position: 'relative' }}>
            <Divider />
            <div className={this.props.classes.editorWrapper}>
              <TextToolbar addText={this.addTextFromToolbarInReply} />
              <TextField
                autoFocus
                margin="dense"
                id="message"
                multiline
                label="Reply"
                type="text"
                rows="3"
                rowsMax="10"
                variant="outlined"
                fullWidth
                onChange={this.handleReplyMessageChange}
                value={this.state.replyMessage}
                inputRef={this.textInput}
              />
            </div>
            <div style={{ float: 'right' }}>
              <Button
                onClick={() => this.setState({ replyBoxOpen: false })}
                color="secondary"
                variant="contained"
                style={{ marginRight: '5px' }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => this.sendReply()}
                disabled={this.props.rateLimited}
              >
                Send
              </Button>
              <br />
              <br />
            </div>
          </div>
        );
      }
    }

    renderAdminActions() {
      if (this.isRepresentative() && !hasReportedId(`${REMOVE_TOPIC_REPLY_OP_ID}:${this.props.reply.id}`)) {
        return (
          <div style={{ display: 'inline-block' }}>
            <IconButton
              aria-label="Remove reply"
              onClick={() => this.setState({ removeReplyDialogOpen: true })}
              disabled={this.props.rateLimited}
            >
              <Tooltip title="Remove reply">
                <Delete className={this.props.classes.iconRed} />
              </Tooltip>
            </IconButton>

            <Dialog
              open={this.state.removeReplyDialogOpen}
              onClose={() => this.setState({ removeReplyDialogOpen: false })}
              aria-labelledby="dialog-title"
            >
              <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This action will remove the topic, which makes sure that no one will be able to read the initial
                  message.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.setState({ removeReplyDialogOpen: false })} color="secondary">
                  No
                </Button>
                <Button
                  onClick={() =>
                    this.setState(
                      {
                        removeReplyDialogOpen: false,
                      },
                      () =>
                        removeTopicReply(this.props.user, this.props.reply.id)
                          .catch((error) => {
                            this.props.notifyError(error.message);
                            this.props.setRateLimited();
                          })
                          .then(() => window.location.reload())
                    )
                  }
                  color="primary"
                  disabled={this.props.rateLimited}
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );
      }
    }

    renderSubReplies() {
      return this.state.subReplies.map((reply) => (
        <TopicReplyCard
          key={`reply-${reply.id}`}
          reply={reply}
          indention={this.props.indention + 10}
          topicId={this.props.topicId}
          representatives={this.props.representatives}
          cascadeOpenSubReplies={this.openSubReplies}
          user={this.props.user}
          distrustedUsers={this.props.distrustedUsers}
          notifyError={this.props.notifyError}
          notifySuccess={this.props.notifySuccess}
          setRateLimited={this.props.setRateLimited}
          rateLimited={this.props.rateLimited}
          setQueryPending={this.props.setQueryPending}
          setOperationPending={this.props.setOperationPending}
        />
      ));
    }

    renderCardContent() {
      return (
        <>
          <CardContent>
            {this.renderAuthor()}
            <div className={this.props.classes.content}>
              <Timestamp milliseconds={this.props.reply.timestamp} />
              <MarkdownRenderer text={this.props.reply.message} />
              <PreviewLinks text={this.props.reply ? this.props.reply.message : null} />
            </div>
          </CardContent>
          {this.bottomBar()}
          {this.renderReplyBox()}
        </>
      );
    }

    renderAuthor() {
      return (
        <div style={{ float: 'right' }}>
          <Link
            className={`${this.props.classes.authorLink} ${
              this.props.representatives.includes(this.props.reply.author.toLocaleLowerCase())
                ? this.props.classes.repColor
                : this.props.classes.userColor
            }`}
            to={`/u/${this.props.reply.author}`}
          >
            <Typography gutterBottom variant="subtitle1" component="span">
              <span className={this.props.classes.authorName}>@{this.props.reply.author}</span>
            </Typography>
          </Link>
          <br />
          <div style={{ float: 'right' }}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.MEDIUM} name={this.props.reply.author} />
          </div>
        </div>
      );
    }

    render() {
      const filtered =
        !(this.props.user != null && toLowerCase(this.props.reply.author) === toLowerCase(this.props.user.name)) &&
        shouldBeFiltered(this.props.reply.moderated_by, this.props.distrustedUsers);
      if (
        !this.props.distrustedUsers.includes(this.props.reply.author) &&
        ((this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) ||
          !filtered)
      ) {
        return (
          <>
            <div className={filtered ? this.props.classes.removed : ''}>
              <Card
                key={this.props.reply.id}
                ref={this.cardRef}
                style={{ marginLeft: `${this.props.indention}px` }}
                className={this.isReplyHighlighted() ? this.props.classes.highlighted : ''}
              >
                {this.renderCardContent()}
              </Card>
            </div>
            <div className={!this.state.renderSubReplies ? this.props.classes.hidden : ''}>
              {this.renderSubReplies()}
            </div>
          </>
        );
      }
      return <div key={uniqueId()} />;
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    distrustedUsers: store.account.distrustedUsers,
    rateLimited: store.common.rateLimited,
  };
};

const mapDispatchToProps = {
  notifyError,
  notifySuccess,
  setRateLimited,
  setQueryPending,
  setOperationPending,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopicReplyCard);

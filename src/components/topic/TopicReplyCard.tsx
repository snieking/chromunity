import React from "react";
import { Link } from "react-router-dom";
import { TopicReply, ChromunityUser } from "../../types";
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
  LinearProgress,
  TextField,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import { Delete, Reply, Report, StarBorder, StarRate, UnfoldMore } from "@material-ui/icons";
import { getUserSettingsCached } from "../../blockchain/UserService";
import {
  createTopicSubReply,
  deleteReply,
  getReplyStarRaters,
  getTopicSubReplies,
  giveReplyStarRating,
  modifyReply,
  removeReplyStarRating
} from "../../blockchain/TopicService";

import {
  reportReply,
  removeTopicReply,
  hasReportedId,
  REMOVE_TOPIC_REPLY_OP_ID,
  hasReportedReply
} from "../../blockchain/RepresentativesService";
import EditMessageButton from "../buttons/EditMessageButton";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import Timestamp from "../common/Timestamp";
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from "../../theme";
import MarkdownRenderer from "../common/MarkdownRenderer";
import ConfirmDialog from "../common/ConfirmDialog";
import * as BoomerangCache from "boomerang-cache";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import { shouldBeFiltered, toLowerCase, uniqueId } from "../../util/util";
import TextToolbar from "../common/textToolbar/TextToolbar";
import CardActions from "@material-ui/core/CardActions";
import Divider from "@material-ui/core/Divider";
import PreviewLinks from "../common/PreviewLinks";

const styles = (theme: Theme) =>
  createStyles({
    removed: {
      opacity: 0.25
    },
    authorName: {
      display: "block",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "5px"
    },
    authorLink: {
      float: "right",
      borderRadius: "0 0 0 5px",
      marginTop: "-18px",
      marginBottom: "7px",
      marginRight: "-16px"
    },
    content: {
      marginRight: "5px",
      whiteSpace: "normal",
      maxWidth: "95%"
    },
    bottomBar: {
      marginTop: "7px",
      marginBottom: "-22px",
      marginLeft: "-10px"
    },
    userColor: {
      backgroundColor: theme.palette.secondary.main
    },
    repColor: {
      backgroundColor: COLOR_ORANGE
    },
    iconYellow: {
      color: COLOR_YELLOW
    },
    iconOrange: {
      color: COLOR_ORANGE
    },
    iconRed: {
      color: COLOR_RED
    },
    editorWrapper: {
      position: "relative"
    },
    highlighted: {
      borderColor: theme.palette.secondary.main,
      borderSize: "1px",
      border: "solid"
    },
    hidden: {
      display: "none"
    }
  });

interface Props extends WithStyles<typeof styles> {
  user: ChromunityUser;
  topicId: string;
  reply: TopicReply;
  indention: number;
  representatives: string[];
  distrustedUsers: string[];
  cascadeOpenSubReplies?: Function;
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
  isLoading: boolean;
  timeLeftUntilNoLongerModifiable: number;
  renderSubReplies: boolean;
}

const allowedEditTimeMillis: number = 300000;
const replyMaxRenderAgeMillis: number = 1000 * 60 * 60 * 24;

const replyUnfoldCache = BoomerangCache.create("reply-unfold-bucket", {
  storage: "local",
  encrypt: false
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
        replyMessage: "",
        hideThreadConfirmDialogOpen: false,
        avatar: "",
        subReplies: [],
        removeReplyDialogOpen: false,
        reportReplyDialogOpen: false,
        isLoading: false,
        timeLeftUntilNoLongerModifiable: 0,
        renderSubReplies: previouslyFoldedSubReplies ? decisionToRenderSubReplies : shouldRenderDueToTimestamp
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
      const user: ChromunityUser = this.props.user;

      getUserSettingsCached(this.props.reply.author, 1440).then(settings => {
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.reply.author)
        });
      });
      getReplyStarRaters(this.props.reply.id).then(usersWhoStarRated =>
        this.setState({
          stars: usersWhoStarRated.length,
          ratedByMe: usersWhoStarRated.includes(user != null && user.name.toLocaleLowerCase())
        })
      );
      getTopicSubReplies(this.props.reply.id, user).then(replies => this.setState({ subReplies: replies }));

      const modifiableUntil = this.props.reply.timestamp + allowedEditTimeMillis;
      setInterval(() => {
        this.setState({ timeLeftUntilNoLongerModifiable: this.getTimeLeft(modifiableUntil) });
      }, 1000);

      if (this.isReplyHighlighted()) {
        this.openSubReplies();
        this.scrollToReply();
      }
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
            <div className={filtered ? this.props.classes.removed : ""}>
              <Card
                key={this.props.reply.id}
                ref={this.cardRef}
                style={{ marginLeft: this.props.indention + "px" }}
                className={this.isReplyHighlighted() ? this.props.classes.highlighted : ""}
              >
                {this.state.isLoading ? <LinearProgress /> : <div />}
                {this.renderCardContent()}
              </Card>
            </div>
            <div className={!this.state.renderSubReplies ? this.props.classes.hidden : ""}>
              {this.renderSubReplies()}
            </div>
          </>
        );
      } else {
        return <div key={uniqueId()} />;
      }
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

    renderSubReplies() {
      return this.state.subReplies.map(reply => (
        <TopicReplyCard
          key={"reply-" + reply.id}
          reply={reply}
          indention={this.props.indention + 10}
          topicId={this.props.topicId}
          representatives={this.props.representatives}
          cascadeOpenSubReplies={this.openSubReplies}
          user={this.props.user}
          distrustedUsers={this.props.distrustedUsers}
        />
      ));
    }

    getTimeLeft(until: number): number {
      const currentTime = Date.now();
      return currentTime < until ? Math.floor((until - currentTime) / 1000) : 0;
    }

    toggleStarRate() {
      if (!this.state.isLoading) {
        this.setState({ isLoading: true });
        const id = this.props.reply.id;
        const user = this.props.user;

        if (user != null) {
          if (this.state.ratedByMe) {
            removeReplyStarRating(this.props.user, id)
              .then(() =>
                this.setState(prevState => ({
                  ratedByMe: false,
                  stars: prevState.stars - 1,
                  isLoading: false
                }))
              )
              .catch(() => this.setState({ isLoading: false }));
          } else {
            giveReplyStarRating(this.props.user, id)
              .then(() =>
                this.setState(prevState => ({
                  ratedByMe: true,
                  stars: prevState.stars + 1,
                  isLoading: false
                }))
              )
              .catch(() => this.setState({ isLoading: false }));
          }
        } else {
          window.location.href = "/user/login";
        }
      }
    }

    renderAuthor() {
      return (
        <div style={{ float: "right" }}>
          <Link
            className={`${this.props.classes.authorLink} ${
              this.props.representatives.includes(this.props.reply.author.toLocaleLowerCase())
                ? this.props.classes.repColor
                : this.props.classes.userColor
            }`}
            to={"/u/" + this.props.reply.author}
          >
            <Typography gutterBottom variant="subtitle1" component="span">
              <span className={this.props.classes.authorName}>@{this.props.reply.author}</span>
            </Typography>
          </Link>
          <br />
          <div style={{ float: "right" }}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.MEDIUM} name={this.props.reply.author} />
          </div>
        </div>
      );
    }

    isReplyHighlighted(): boolean {
      return window.location.href.indexOf("#" + this.props.reply.id) > -1;
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

    bottomBar() {
      const user: ChromunityUser = this.props.user;

      if (user != null) {
        return (
          <CardActions disableSpacing style={{ display: "block", marginTop: "-10px" }}>
            <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
              <Badge className="star-badge" color="secondary" badgeContent={this.state.stars}>
                <Tooltip title="Like">
                  {this.state.ratedByMe ? <StarRate className={this.props.classes.iconYellow} /> : <StarBorder />}
                </Tooltip>
              </Badge>
            </IconButton>
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
            <IconButton
              aria-label="Reply"
              onClick={() =>
                this.setState(prevState => ({
                  replyBoxOpen: !prevState.replyBoxOpen
                }))
              }
            >
              <Tooltip title="Reply">
                <Reply className={this.state.replyBoxOpen ? this.props.classes.iconOrange : ""} />
              </Tooltip>
            </IconButton>

            <ConfirmDialog
              text="This action will report the message"
              open={this.state.reportReplyDialogOpen}
              onClose={this.closeReportReply}
              onConfirm={this.reportReply}
            />

            {!this.isRepresentative() && !hasReportedReply(user, this.props.reply) && (
              <IconButton aria-label="Report" onClick={() => this.setState({ reportReplyDialogOpen: true })}>
                <Tooltip title="Report">
                  <Report />
                </Tooltip>
              </IconButton>
            )}

            {this.state.subReplies.length > 0 ? (
              <IconButton aria-label="Load replies" onClick={() => this.toggleRenderReply()}>
                <Tooltip title="Toggle replies">
                  <Badge
                    badgeContent={!this.state.renderSubReplies ? this.state.subReplies.length : 0}
                    color="secondary"
                  >
                    <UnfoldMore />
                  </Badge>
                </Tooltip>
              </IconButton>
            ) : (
              <div style={{ display: "inline-block" }} />
            )}
            {this.renderAdminActions()}
          </CardActions>
        );
      } else {
        return (
          <CardActions style={{ marginTop: "-20px" }}>
            <Badge
              className="star-badge"
              color="secondary"
              badgeContent={this.state.stars}
              style={{ marginLeft: "5px", marginBottom: "5px" }}
            >
              <Tooltip title="Like">
                <StarBorder />
              </Tooltip>
            </Badge>
          </CardActions>
        );
      }
    }

    toggleRenderReply() {
      replyUnfoldCache.set(this.props.reply.id, !this.state.renderSubReplies, replyMaxRenderAgeMillis * 7);
      this.setState(prevState => ({ renderSubReplies: !prevState.renderSubReplies }));
    }

    editReplyMessage(text: string) {
      this.setState({ isLoading: true });
      modifyReply(this.props.user, this.props.reply.id, text)
        .then(() => window.location.reload())
        .catch(() => this.setState({ isLoading: false }));
    }

    deleteReplyMessage() {
      this.setState({ isLoading: true });
      deleteReply(this.props.user, this.props.reply.id)
        .then(() => window.location.reload())
        .catch(() => this.setState({ isLoading: false }));
    }

    closeReportReply() {
      this.setState({ reportReplyDialogOpen: false });
    }

    reportReply() {
      this.closeReportReply();

      if (this.props.user != null) {
        reportReply(this.props.user, this.props.reply);
      } else {
        window.location.href = "/user/login";
      }
    }

    isRepresentative() {
      const user: ChromunityUser = this.props.user;
      return user != null && this.props.representatives.includes(user.name.toLocaleLowerCase());
    }

    renderAdminActions() {
      if (this.isRepresentative() && !hasReportedId(REMOVE_TOPIC_REPLY_OP_ID + ":" + this.props.reply.id)) {
        return (
          <div style={{ display: "inline-block" }}>
            <IconButton aria-label="Remove reply" onClick={() => this.setState({ removeReplyDialogOpen: true })}>
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
                        removeReplyDialogOpen: false
                      },
                      () => removeTopicReply(this.props.user, this.props.reply.id).then(() => window.location.reload())
                    )
                  }
                  color="primary"
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );
      }
    }

    renderReplyBox() {
      const user: ChromunityUser = this.props.user;
      if (this.state.replyBoxOpen && user == null) {
        window.location.href = "/user/login";
      } else if (this.state.replyBoxOpen) {
        return (
          <div style={{ margin: "15px", position: "relative" }}>
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
                variant="outlined"
                fullWidth
                onChange={this.handleReplyMessageChange}
                value={this.state.replyMessage}
                inputRef={this.textInput}
              />
            </div>
            <div style={{ float: "right" }}>
              <Button
                onClick={() => this.setState({ replyBoxOpen: false })}
                color="secondary"
                variant="contained"
                style={{ marginRight: "5px" }}
              >
                Cancel
              </Button>
              <Button color="primary" variant="contained" onClick={() => this.sendReply()}>
                Send
              </Button>
              <br />
              <br />
            </div>
          </div>
        );
      }
    }

    addTextFromToolbarInReply(text: string) {
      const startPosition = this.textInput.current.selectionStart;

      this.setState(prevState => ({
        replyMessage: [
          prevState.replyMessage.slice(0, startPosition),
          text,
          prevState.replyMessage.slice(startPosition)
        ].join("")
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
      this.setState({ replyBoxOpen: false, replyMessage: "" });
      createTopicSubReply(
        this.props.user,
        this.props.topicId,
        this.props.reply.id,
        message,
        this.props.reply.author
      ).then(() => {
        getTopicSubReplies(this.props.reply.id).then(replies => this.setState({ subReplies: replies }));
        this.openSubReplies();
      });
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    distrustedUsers: store.account.distrustedUsers
  };
};

export default connect(mapStateToProps, null)(TopicReplyCard);

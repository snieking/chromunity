import React from 'react';
import { Link } from "react-router-dom";
import { Topic } from '../../../types';
import { Card, Typography, IconButton, Badge, CardContent, CardActionArea, Chip } from '@material-ui/core';
import { timeAgoReadable, stringToHexColor } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate, MoreHoriz } from '@material-ui/icons';
import './TopicOverviewCard.css';
import '../Topic.css'
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { Redirect } from 'react-router';
import { getTopicStarRaters, removeTopicStarRating, giveTopicStarRating } from '../../../blockchain/TopicService';
import { getTags } from '../../../util/text-parsing';

interface Props {
    topic: Topic;
}

interface State {
    stars: number;
    ratedByMe: boolean;
    redirectToFullCard: boolean;
    replyBoxOpen: boolean;
    replyMessage: string;
    isRepresentative: boolean;
    hideThreadConfirmDialogOpen: boolean;
    avatar: string;
    tags: string[];
}

class TopicOverviewCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            stars: 0,
            tags: [],
            ratedByMe: false,
            redirectToFullCard: false,
            replyBoxOpen: false,
            replyMessage: "",
            isRepresentative: false,
            hideThreadConfirmDialogOpen: false,
            avatar: ""
        };
    }

    render() {
        if (this.state.redirectToFullCard) {
            return (<Redirect to={"/t/" + this.props.topic.id} />);
        } else {
            return (
                <div className={this.props.topic.removed ? "removed" : ""}>
                    <Card raised={true} key={this.props.topic.id} className='topic-card'>
                        <CardActionArea onClick={() => this.setState({ redirectToFullCard: true })}>
                            {this.renderCardContent()}
                        </CardActionArea>
                    </Card>
                </div>
            );
        }
    }

    componentDidMount() {
        this.setState({ tags: getTags(this.props.topic.message).slice(0, 3) });
        getUserSettingsCached(this.props.topic.author, 1440)
            .then(settings => {
                this.setState({
                    avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.topic.author)
                });
            });
        getTopicStarRaters(this.props.topic.id).then(usersWhoStarRated => this.setState({
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(getUser().name)
        }));
    }

    renderReadMoreButton() {
        return (
            <Link to={'/t' + this.props.topic.id} >
                <IconButton aria-label="Read more">
                    <MoreHoriz />
                </IconButton>
            </Link>
        );
    }

    toggleStarRate() {
        const id = this.props.topic.id;
        const name = getUser().name;

        if (name != null) {
            if (this.state.ratedByMe) {
                removeTopicStarRating(getUser(), id)
                    .then(() => this.setState(prevState => ({ ratedByMe: false, stars: prevState.stars - 1 })));
            } else {
                giveTopicStarRating(getUser(), id)
                    .then(() => this.setState(prevState => ({ ratedByMe: true, stars: prevState.stars + 1 })))
            }
        } else {
            window.location.replace("/user/login");
        }
    }

    renderAuthor() {
        return (
            <div className="right">
                <Link
                    className="pink-typography"
                    to={"/u/" + this.props.topic.author}
                    style={{ marginBottom: "18px"}}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="span"
                        className="typography"
                    >
                        <span className="author-name">@{this.props.topic.author}</span>
                    </Typography>
                </Link>
                {this.state.avatar !== "" ? <img src={this.state.avatar} className="author-avatar" alt="Profile Avatar" /> : <div></div>}
            </div>
        );
    }

    renderTagChips() {
        if (this.state.tags != null) {
            return (
                <div className="tag-chips">
                    {this.state.tags.map(tag => {
                        return (
                            <Link key={this.props.topic.id + ":" + tag} to={"/tag/" + tag.replace("#", "")}>
                                <Chip
                                    size="small"
                                    label={tag}
                                    style={{
                                        marginLeft: "1px",
                                        marginRight: "1px",
                                        marginBottom: "3px",
                                        backgroundColor: stringToHexColor(tag),
                                        cursor: "pointer"
                                    }}
                                />
                            </Link>
                        )
                    })}
                </div>
            )
        }
    }

    renderCardContent() {
        return (
            <CardContent>
                <div className="left">
                    <div className="overview-rating">
                        <Badge
                            color="primary"
                            badgeContent={this.state.stars}
                        >
                            <StarRate className={this.state.ratedByMe ? "yellow-color" : "purple-color"} />
                        </Badge>
                    </div>
                </div>
                {this.renderAuthor()}
                <div className="topic-overview-details">
                    {this.renderTimeAgo(this.props.topic.last_modified)}
                    <Typography variant="subtitle1" className='purple-typography' component="span" style={{ marginRight: "10px" }}>
                        {this.props.topic.title}
                    </Typography>
                    {this.renderTagChips()}
                </div>
            </CardContent >
        );
    }

    renderTimeAgo(timestamp: number) {
        return (
            <Typography className='timestamp' variant='inherit' component='p'>
                {timeAgoReadable(timestamp)}
            </Typography>
        )
    }
}

export default TopicOverviewCard;

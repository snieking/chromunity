import React from 'react';
import { Link } from "react-router-dom";
import { Topic, User } from '../../../types';
import { Card, Typography, Badge, CardContent, CardActionArea, Chip } from '@material-ui/core';
import { timeAgoReadable, stringToHexColor } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate } from '@material-ui/icons';
import './TopicOverviewCard.css';
import '../Topic.css'
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { Redirect } from 'react-router';
import { getTopicStarRaters } from '../../../blockchain/TopicService';
import { getTags } from '../../../util/text-parsing';

interface Props {
    topic: Topic;
    isRepresentative: boolean;
}

interface State {
    stars: number;
    ratedByMe: boolean;
    redirectToFullCard: boolean;
    isRepresentative: boolean;
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
            isRepresentative: false,
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
        
        const user: User = getUser();
        getTopicStarRaters(this.props.topic.id).then(usersWhoStarRated => this.setState({
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(user != null && user.name)
        }));
    }

    renderAuthor() {
        return (
            <div className="right">
                <Link
                    className={this.props.isRepresentative ? "rep-typography" : "pink-typography"}
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

import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { getUserForumAvatar } from '../../../../blockchain/UserService';
import { ifEmptyAvatarThenPlaceholder } from '../../../../util/user-util';

export interface RepresentativeCardProps {
    name: string
}

export interface RepresentativeCardState {
    avatar: string
}

class RepresentativeCard extends React.Component<RepresentativeCardProps, RepresentativeCardState> {

    constructor(props: RepresentativeCardProps) {
        super(props);
        this.state = { avatar: "" };
    }

    render() {
        if (this.props.name != null) {
            return (
                <Card raised={true} key={"representative-" + this.props.name}
                    className="representative-card">
                    <CardMedia
                        component="img"
                        alt="Election candidate"
                        height="140"
                        src={this.state.avatar}
                        title="Representative"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h5">
                            <Link className="pink-typography" to={"/u/" + this.props.name}>@{this.props.name}</Link>
                        </Typography>
                    </CardContent>
                </Card>
            );
        } else {
            return (<div></div>)
        }
    }

    componentDidMount() {
        getUserForumAvatar(this.props.name, 1440)
            .then(avatar => this.setState({ avatar: ifEmptyAvatarThenPlaceholder(avatar, this.props.name) }));
    }
}

export default RepresentativeCard;

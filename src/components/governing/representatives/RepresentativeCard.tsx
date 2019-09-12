import React from 'react';
import {Link} from "react-router-dom";
import {Card, CardContent, createStyles, Grid, Typography, withStyles, WithStyles} from '@material-ui/core';
import {getUserSettingsCached} from '../../../blockchain/UserService';
import {ifEmptyAvatarThenPlaceholder} from '../../../util/user-util';
import Avatar, {AVATAR_SIZE} from "../../common/Avatar";
import {COLOR_ORANGE} from "../../../theme";

const styles = createStyles({
    representativeCard: {
        textAlign: "center"
    },
    link: {
        color: COLOR_ORANGE
    }
});

export interface RepresentativeCardProps extends WithStyles<typeof styles> {
    name: string
}

export interface RepresentativeCardState {
    avatar: string
}

const RepresentativeCard = withStyles(styles)(
    class extends React.Component<RepresentativeCardProps, RepresentativeCardState> {

        constructor(props: RepresentativeCardProps) {
            super(props);
            this.state = {avatar: ""};
        }

        render() {
            if (this.props.name != null) {
                return (
                    <Grid item xs={4}>
                        <Card key={"representative-" + this.props.name}
                              className={this.props.classes.representativeCard}>
                            <CardContent>
                                <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE}/>
                                <Typography gutterBottom variant="subtitle1" component="p">
                                    <Link className={this.props.classes.link}
                                          to={"/u/" + this.props.name}>@{this.props.name}</Link>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            } else {
                return (<div/>)
            }
        }

        componentDidMount() {
            getUserSettingsCached(this.props.name, 1440)
                .then(settings => this.setState({avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.name)}));
        }
    }
);

export default RepresentativeCard;

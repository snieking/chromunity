import React from 'react';
import './Wall.css';
import {Container} from "@material-ui/core";
import {getAllThreads, getThreadsByTag, getThreadsByUserId} from "../../blockchain/MessageService";
import {Thread} from "../../types";

import {RouteComponentProps} from "react-router";
import {ThreadCard} from "../ThreadCard/ThreadCard";
import {NewThreadButton} from "../buttons/NewThreadButton";
import {ProfileCard} from "../user/Profile/ProfileCard";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import {getUser} from "../../util/user-util";

interface MatchParams {
    userId: string,
    tag: string
}

export interface WallProps extends RouteComponentProps<MatchParams> {

}

export interface WallState {
    threads: Thread[];
    id: string;
    truncated: boolean;
    displayFollowersOnlySwitch: boolean,
    followersOnly: boolean;
}

function shouldDisplayFollowersOnlySwitch(params: MatchParams): boolean {
    return getUser().name != null && params.userId == null && params.tag == null;
}

export class Wall extends React.Component<WallProps, WallState> {

    constructor(props: WallProps) {
        super(props);
        this.state = {
            threads: [],
            id: "",
            truncated: true,
            displayFollowersOnlySwitch: shouldDisplayFollowersOnlySwitch(props.match.params),
            followersOnly: false
        };

        this.retrieveThreads = this.retrieveThreads.bind(this);
        this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
    }

    componentDidMount(): void {
        this.retrieveThreads();
    }

    retrieveThreads() {
        const userId = this.props.match.params.userId;
        const tag = this.props.match.params.tag;
        if (userId != null) {
            getThreadsByUserId(userId).then(retrievedThreads => {
                this.setState({ threads: retrievedThreads });
            });

        } else if (tag != null) {
            getThreadsByTag(tag).then(retrievedThreads => {
                this.setState({ threads: retrievedThreads });
            });
        } else {
            getAllThreads().then(retrievedThreads => {
                this.setState({ threads: retrievedThreads });
            });
        }
    }

    renderUserPageIntro() {
        if (this.props.match.params.userId != null) {
            return (
                <ProfileCard username={this.props.match.params.userId}/>
            )
        }
    }

    renderFollowersOnlySwitch() {
        if (this.state.displayFollowersOnlySwitch) {
            return (
                <FormGroup row>
                    <FormControlLabel className="switch-label"
                                      control={
                                          <Switch checked={this.state.followersOnly}
                                                  onChange={() => this.toggleFollowersOnly()}
                                                  value={this.state.followersOnly}
                                                  className="switch"/>
                                      }
                                      label="Followers only"
                    />
                </FormGroup>
            )
        }
    }

    toggleFollowersOnly() {
        this.setState(prevState => ({followersOnly: !prevState.followersOnly}));
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth="md">
                    <div className="thread-wall-container">
                        <br/>
                        {this.renderFollowersOnlySwitch()}
                        {this.renderUserPageIntro()}
                        {this.state.threads.map(thread => <ThreadCard
                            key={"card-" + thread.id}
                            truncated={true}
                            isSubCard={false}
                            isUserPage={this.props.match.params.userId != null}
                            thread={thread}
                        />)}
                    </div>
                </Container>
                {this.props.match.params.userId == null
                    ? <NewThreadButton updateFunction={this.retrieveThreads}/>
                    : <div></div>}
            </div>
        );
    }

}

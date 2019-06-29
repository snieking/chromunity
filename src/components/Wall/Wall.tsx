import React from 'react';
import {Link} from 'react-router-dom';
import './Wall.css';
import Header from '../Header/Header'
import {Container} from "@material-ui/core";
import {getAllThreads, getThreadsByUserId, getThreadStarRating} from "../../blockchain/MessageService";
import {Thread} from "../../types";

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {Redirect, RouteComponentProps} from "react-router";

interface MatchParams {
    userId: string
}

export interface WallProps extends RouteComponentProps<MatchParams> {

}

export interface WallState {
    threads: Thread[];
    id: string;
    truncated: boolean;
}

export class Wall extends React.Component<WallProps, WallState> {

    constructor(props: WallProps) {
        super(props);
        this.state = {
            threads: [],
            id: "",
            truncated: true
        };
    }

    componentDidMount(): void {
        const userId = this.props.match.params.userId;
        if (userId == null) {
            getAllThreads().then(retrievedThreads => {
                console.log("Retrieved threads: ", retrievedThreads);
                this.setState({
                    threads: retrievedThreads
                });
            });
        } else {
            getThreadsByUserId(userId).then(retrievedThreads => {
                this.setState(prevState => ({threads: retrievedThreads, id: prevState.id, truncated: false}));
            })
        }

    }

    getPostId(id: string) {
        return "/thread/" + id;
    }

    setIdForCardNavigation(threadId: string) {
        this.setState(prevState => ({threads: prevState.threads, id: threadId}));
    }

    renderThread(thread: Thread) {
        if (this.state.id !== "") {
            return <Redirect key={"red-" + this.state.id} to={this.getPostId(this.state.id)}/>
        }

        return (
            <Card key={thread.id} className="thread-card">
                <CardActionArea onClick={() => this.setIdForCardNavigation(thread.id)}>
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h6">
                           <Link to={`/u/${thread.author}`}> @{thread.author}</Link>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {thread.message}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        )
    }


    render() {
        return (
            <div>
                <Header/>
                <Container fixed>
                    <br/>
                    {this.state.threads.map(thread => this.renderThread(thread))}
                </Container>
            </div>
        );
    }

}

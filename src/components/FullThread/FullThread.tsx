import React from "react";
import {getThreadById} from "../../blockchain/MessageService";
import {Thread} from "../../types";
import {Container} from "@material-ui/core";

import {RouteComponentProps} from "react-router";
import Header from "../Header/Header";
import {ThreadCard} from "../ThreadCard/ThreadCard";
import {ReplyThreadButton} from "../buttons/ReplyThreadButton";


interface MatchParams {
    id: string
}

export interface FullThreadProps extends RouteComponentProps<MatchParams> {
    pathName: string
}

export interface FullThreadState {
    thread: Thread,
    replyBoxOpen: boolean
}

export class FullThread extends React.Component<FullThreadProps, FullThreadState> {

    constructor(props: FullThreadProps) {
        super(props);

        const initialThread: Thread = {
            id: "",
            rootThreadId: "",
            author: "",
            message: "",
            timestamp: 0
        };

        this.state = {
            thread: initialThread,
            replyBoxOpen: false
        };

        this.retrieveThreads = this.retrieveThreads.bind(this);
    }

    componentDidMount(): void {
        this.retrieveThreads();
    }

    retrieveThreads(): void {
        const id = this.props.match.params.id;
        getThreadById(id).then(receivedThread => {
            console.log("Retrieved thread: ", receivedThread);
            this.setState({thread: receivedThread});
        });
    }

    renderThread() {
        return (<ThreadCard truncated={false} isSubCard={false} thread={this.state.thread}/>);
    }

    renderReplyButton() {
        return (<ReplyThreadButton updateFunction={this.retrieveThreads} rootThreadId={this.props.match.params.id}/>)
    }

    render() {
        return (
            <div>
                <Header/>
                <Container fixed>
                    <br/>
                    {this.renderThread()}
                    {this.renderReplyButton()}
                </Container>
            </div>
        )
    }
}

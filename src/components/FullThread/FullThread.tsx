import React from "react";
import {Link} from 'react-router-dom'
import {getThreadById} from "../../blockchain/MessageService";
import {Thread} from "../../types";
import {Container} from "@material-ui/core";

import {RouteComponentProps} from "react-router";
import Header from "../Header/Header";
import {ThreadCard} from "../ThreadCard/ThreadCard";


interface MatchParams {
    id: string
}

export interface FullThreadProps extends RouteComponentProps<MatchParams> {

}

export interface FullThreadState {
    thread: Thread,
}

export class FullThread extends React.Component<FullThreadProps, FullThreadState> {

    constructor(props: FullThreadProps) {
        super(props);

        const initialThread: Thread = {
            id: "",
            author: "",
            message: "",
            timestamp: 0
        };

        this.state = {
            thread: initialThread,
        };
    }

    componentDidMount(): void {
        const id = this.props.match.params.id;
        getThreadById(id).then(receivedThread => {
            console.log("Retrieved thread: ", receivedThread);
            this.setState({thread: receivedThread});
        });

    }

    renderThread() {
         return (<ThreadCard truncated={false} thread={this.state.thread}/> );
    }

    render() {
        return (
            <div>
                <Header/>
                <Container fixed>
                    <br/>
                    {this.renderThread()}
                </Container>
            </div>
        )
    }
}

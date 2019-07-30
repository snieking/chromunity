import * as React from 'react';
import { Link } from "react-router-dom";

import { Chip, Card, CardContent } from '@material-ui/core';
import { getTrendingChannels } from '../../blockchain/ChannelService';
import { stringToHexColor } from '../../util/util';

type State = {
    channels: string[];
};

export class TrendingChannels extends React.Component<{}, State>{

    constructor(props: any) {
        super(props);
        this.state = { channels: [] };
    }

    componentDidMount() {
        getTrendingChannels(7).then(channels => this.setState({ channels: channels }));
    }

    render() {
        return (
            <div>
                <Card>
                    <CardContent>
                        {this.state.channels.map((channel: string) => {
                            return (
                                <Link key={channel} to={"/c/" + channel}>
                                    <Chip
                                        size="small"
                                        label={"#" + channel}
                                        style={{
                                            marginLeft: "1px",
                                            marginRight: "1px",
                                            marginTop: "3px",
                                            backgroundColor: stringToHexColor(channel),
                                            cursor: "pointer"
                                        }}
                                    />
                                </Link>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        )
    }

}
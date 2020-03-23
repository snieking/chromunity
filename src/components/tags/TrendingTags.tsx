import * as React from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@material-ui/core";
import { getTrendingChannels } from "../../blockchain/ChannelService";
import CustomChip from "../common/CustomChip";

type State = {
  channels: string[];
};

export class TrendingChannels extends React.Component<{}, State> {
  constructor(props: unknown) {
    super(props);
    this.state = { channels: [] };
  }

  componentDidMount() {
    getTrendingChannels(7).then(channels => this.setState({ channels: channels }));
  }

  render() {
    return (
      <Card>
        <CardContent>
          {this.state.channels.map((channel: string) => {
            return (
              <Link key={channel} to={"/c/" + channel}>
                <CustomChip tag={channel}/>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    );
  }
}

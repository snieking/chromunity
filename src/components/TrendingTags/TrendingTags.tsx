import * as React from 'react';
import { Link } from "react-router-dom";

import { Chip, Card, CardContent } from '@material-ui/core';
import { getTrendingTags } from '../../blockchain/TagService';
import { stringToHexColor } from '../../util/util';

type State = {
    tags: string[];
};

export class TrendingTags extends React.Component<{}, State>{

    constructor(props: any) {
        super(props);
        this.state = { tags: [] };
    }

    componentDidMount() {
        getTrendingTags(7).then(tags => this.setState({ tags: tags }));
    }

    render() {
        return (
            <div>
                <br />
                <Card>
                    <CardContent>
                        {this.state.tags.map((tag: string) => {
                            return (
                                <Link key={tag} to={"/tag/" + tag}>
                                    <Chip
                                        size="small"
                                        label={"#" + tag}
                                        style={{
                                            marginLeft: "1px",
                                            marginRight: "1px",
                                            marginTop: "3px",
                                            backgroundColor: stringToHexColor("#" + tag),
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
    };

}
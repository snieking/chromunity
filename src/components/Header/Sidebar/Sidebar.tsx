import React from 'react';

import './Sidebar.css';

import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem, {ListItemProps} from "@material-ui/core/ListItem";
import {getTrendingTags} from "../../../blockchain/TagService";
import Drawer from "@material-ui/core/Drawer";

export interface SidebarProps {
    toggleFunction: Function,
    drawerOpen: boolean
}

export interface SidebarState {
    tags: string[]
}

function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
    return <ListItem button component="a" {...props} />;
}

function renderButtonText(tag: string) {
    return (
        <Typography variant="body2" color="textSecondary" component="p">
            #{tag}
        </Typography>
    )
}

export class Sidebar extends React.Component<SidebarProps, SidebarState> {

    constructor(props: SidebarProps) {
        super(props);

        this.state = { tags: [] };
    }

    componentDidMount(): void {
        getTrendingTags(7).then(tags => this.setState({tags: tags}));
    }

    render() {
        return (
            <div>
                <Drawer open={this.props.drawerOpen} onClose={() => this.props.toggleFunction()}>
                    <div className="list-container">
                        <Typography gutterBottom variant="h6" component="h6"
                                    className="typography pink-typography sidebar-title">
                            Trending
                        </Typography>
                        <List component="nav" aria-label="Trending tags">
                            {this.state.tags.map(tag => {
                                return (
                                    <div key={"item-" + tag}>
                                        <ListItemLink href={"/tag/" + tag} className="sidebar-list-item">
                                            <ListItemText
                                                          primary={renderButtonText(tag)}
                                            />
                                        </ListItemLink>
                                    </div>
                                )
                            })}
                        </List>
                    </div>
                </Drawer>
            </div>
        )
    }

}

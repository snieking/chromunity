import React from 'react';
import HeaderNav from "./HeaderNav/HeaderNav";
import {Sidebar} from "./Sidebar/Sidebar";

export interface HeaderState {
    sidebarOpen: boolean
}

export class Header extends React.Component<{}, HeaderState> {

    constructor(props: any) {
        super(props);

        this.state = { sidebarOpen: false };
        this.toggleSidebar = this.toggleSidebar.bind(this);
    }

    toggleSidebar() {
        this.setState(prevState => ({ sidebarOpen: !prevState.sidebarOpen }));
    }

    render() {
        return (
            <div>
                <HeaderNav toggleSidebarFunction={this.toggleSidebar}/>
                <Sidebar toggleFunction={this.toggleSidebar} drawerOpen={this.state.sidebarOpen}/>
            </div>
        );
    }
}

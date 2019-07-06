import React from 'react';
import './Header.css';
import HeaderNav from "./HeaderNav/HeaderNav";
import {Sidebar} from "./Sidebar/Sidebar";

export interface HeaderProps {

}

export interface HeaderState {
    sidebarOpen: boolean
}

export class Header extends React.Component<HeaderProps, HeaderState> {

    constructor(props: HeaderProps) {
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
};

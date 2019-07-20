import React from 'react';
import HeaderNav from "./HeaderNav/HeaderNav";

export interface HeaderState {
    sidebarOpen: boolean
}

export class Header extends React.Component<{}, HeaderState> {

    constructor(props: any) {
        super(props);

        this.state = { sidebarOpen: false };
    }

    render() {
        return (
            <div>
                <HeaderNav/>
            </div>
        );
    }
}

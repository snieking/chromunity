import React from 'react';
import { Button, Typography } from '@material-ui/core';

import './AvatarChanger.css';
import Avatar from 'react-avatar-edit';

export interface AvatarChangerProps {
    updateFunction: Function,
    previousPicture: string
}

export interface AvatarChangerState {
    src: string
}

class AvatarChanger extends React.Component<AvatarChangerProps, AvatarChangerState> {

    constructor(props: AvatarChangerProps) {
        super(props);
        this.state = { src: "" }

        this.onCrop = this.onCrop.bind(this);
        this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
    }

    onCrop(preview: string) {
        this.setState({ src: preview })
        this.props.updateFunction(preview);
    }

    onBeforeFileLoad(elem: { target: { files: { size: number; }[]; value: string; }; }) {
        if (elem.target.files[0].size > 71680) {
            alert("File is too big!");
            elem.target.value = "";
        };
    }

    render() {
        return (
            <Avatar
                width={"99%"}
                height={128}
                onCrop={this.onCrop}
                onBeforeFileLoad={this.onBeforeFileLoad}
                src={this.state.src}
                className="avatar-changer"
            />
        );
    }
}

export default AvatarChanger;

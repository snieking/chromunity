import React from 'react';

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
        this.state = {src: ""};

        this.onCrop = this.onCrop.bind(this);
        this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
    }

    compressImage(base64: string) {
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');

        return new Promise((resolve, reject) => {
            img.onload = function () {
                let width = img.width;
                let height = img.height;
                const maxHeight = 128;
                const maxWidth = 128;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', 0.7))
            };
            img.onerror = function (err) {
                reject(err);
            };

            img.src = base64;
        })
    }

    onCrop(preview: string) {
        this.compressImage(preview).then(img => {
            this.setState({src: preview});
            this.props.updateFunction(preview);
        });
    }

    onBeforeFileLoad(elem: { target: { files: { size: number; }[]; value: string; }; }) {

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

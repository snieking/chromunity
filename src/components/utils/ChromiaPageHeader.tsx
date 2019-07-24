import React from 'react';
import { Typography } from "@material-ui/core";

export interface ChromiaHeaderProps {
    text: string;
}

const ChromiaPageHeader: React.SFC<ChromiaHeaderProps> = (props: ChromiaHeaderProps) => {
    return (
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "10px" }}>
            <Typography variant="h5" 
                component="h5" 
                className="pink-typography"
                style={{ fontFamily: '"ChromiaFont", "MonoSpace", "sans-serif"' }}
            >
                {props.text}
            </Typography>
        </div>
    );
}

export default ChromiaPageHeader;
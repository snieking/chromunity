import React from 'react';
import { Typography } from "@material-ui/core";

export interface ChromiaHeaderProps {
    text: string;
}

const ChromiaBodyText: React.SFC<ChromiaHeaderProps> = (props: ChromiaHeaderProps) => {
    return (
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "10px" }}>
            <Typography variant="body2"
                component="span" 
                className="pink-typography"
                style={{ fontFamily: 'ChromiaFont' }}
            >
                {props.text}
            </Typography>
        </div>
    );
}

export default ChromiaBodyText;
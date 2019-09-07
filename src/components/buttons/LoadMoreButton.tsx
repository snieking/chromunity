import React from 'react';
import {Button} from '@material-ui/core';

export interface LoadMoreButtonProps {
    onClick: Function
}

const LoadMoreButton: React.FunctionComponent<LoadMoreButtonProps> = (props) => {
    return (
        <Button type="submit"
                fullWidth
                color="secondary"
                onClick={() => props.onClick()}
                variant="contained"
                style={{marginTop: "5px"}}
        >
            Load more
        </Button>
    );
};

export default LoadMoreButton;
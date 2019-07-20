import React from 'react';
import { createMuiTheme, Button } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

export interface LoadMoreButtonProps {
    onClick: Function
}

const theme = createMuiTheme({ palette: { primary: { main: "#FFAFC1" } } });

const LoadMoreButton: React.SFC<LoadMoreButtonProps> = (props: LoadMoreButtonProps) => {
    return ( 
        <MuiThemeProvider theme={theme}>
                    <Button type="submit" fullWidth color="primary"
                        onClick={() => props.onClick()}
                        variant="contained"
                        style={{ marginTop: "5px" }}
                    >
                        Load more
                    </Button>
                </MuiThemeProvider>
     );
}
 
export default LoadMoreButton;
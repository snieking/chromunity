import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

export const COLOR_CHROMIA_DARK = '#1F1A23';
export const COLOR_RED = '#FF405E';
export const COLOR_ORANGE = '#FF702B';
export const COLOR_STEEL_BLUE = '#4D617D';
export const COLOR_PURPLE = '#CC91F0';
export const COLOR_SOFT_PINK = '#FFB0C2';
export const COLOR_YELLOW = '#FFB500';
export const COLOR_OFF_WHITE = '#FFF8F8';

const theme = createMuiTheme({
    palette: {
        type: 'light',
        primary: {
            main: COLOR_STEEL_BLUE
        },
        secondary: {
            main: COLOR_ORANGE
        },
        background: {default: COLOR_CHROMIA_DARK}
    },
    typography: {
        fontFamily: '"International", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    overrides: {
        MuiTypography: {
            subtitle1: {
                color: COLOR_CHROMIA_DARK
            },
            subtitle2: {
                color: COLOR_PURPLE
            },
            caption: {
                color: COLOR_YELLOW
            },
            h5: {
                color: COLOR_SOFT_PINK,
                fontFamily: '"Battlefin", "International", "Roboto", "Helvetica", "Arial", "sans-serif"'
            },
            h6: {
                color: COLOR_STEEL_BLUE,
                fontFamily: '"Battlefin", "International", "Roboto", "Helvetica", "Arial", "sans-serif"'
            },
            body1: {
                color: COLOR_CHROMIA_DARK
            },
            body2: {
                color: COLOR_CHROMIA_DARK
            },
            colorTextSecondary: {
                color: COLOR_CHROMIA_DARK,
                opacity: 0.4
            },
            gutterBottom: {
                marginBottom: 0
            },
            colorInherit: {
                color: 'none'
            }
        },
        MuiMenuItem: {
            gutters: {
                color: COLOR_CHROMIA_DARK,
            }
        },
        MuiListItemIcon: {
            root: {
                color: COLOR_CHROMIA_DARK,
            }
        },
        MuiIconButton: {
            colorInherit: {
                color: COLOR_CHROMIA_DARK
            }
        },
        MuiPaper: {
            root: {
                color: COLOR_OFF_WHITE
            }
        },
        MuiCard: {
            root: {
                background: COLOR_OFF_WHITE,
                marginBottom: "2px"
            }
        },
        MuiSvgIcon: {
            root: {
                color: COLOR_CHROMIA_DARK
            }
        },
        MuiLink: {
            root: {
                color: COLOR_PURPLE
            }
        }
    }
});

export default theme;
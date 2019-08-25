import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

export const COLOR_CHROMIA_DARK_LIGHTER = '#333037';
export const COLOR_CHROMIA_DARK = '#1F1A23';
export const COLOR_CHROMIA_DARKER = '#151119';
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
            main: COLOR_PURPLE
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
        MuiDialog: {
            paper: {
                background: COLOR_CHROMIA_DARK,
                border: "solid 1px",
                borderColor: COLOR_STEEL_BLUE
            }
        },
        MuiTextField: {
            root: {
                '& label.Mui-focused': {
                    color: COLOR_SOFT_PINK
                },
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: COLOR_STEEL_BLUE,
                    },
                    '&:hover fieldset': {
                        borderColor: COLOR_OFF_WHITE,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: COLOR_SOFT_PINK,
                    },
                    color: COLOR_OFF_WHITE
                },
                '& label': {
                    color: COLOR_OFF_WHITE,
                    opacity: 0.5
                }
            }
        },
        MuiToolbar: {
            root: {
                background: COLOR_CHROMIA_DARKER
            }
        },
        MuiTypography: {
            subtitle1: {
                color: COLOR_OFF_WHITE
            },
            subtitle2: {
                color: COLOR_SOFT_PINK
            },
            caption: {
                color: COLOR_YELLOW
            },
            h5: {
                color: COLOR_SOFT_PINK,
                fontFamily: '"Battlefin", "International", "Roboto", "Helvetica", "Arial", "sans-serif"'
            },
            h6: {
                color: COLOR_SOFT_PINK,
                fontFamily: '"Battlefin", "International", "Roboto", "Helvetica", "Arial", "sans-serif"'
            },
            body1: {
                color: COLOR_OFF_WHITE
            },
            body2: {
                color: COLOR_OFF_WHITE
            },
            colorTextSecondary: {
                color: COLOR_OFF_WHITE,
                opacity: 0.4
            },
            gutterBottom: {
                marginBottom: 0
            },
            colorInherit: {
                color: 'none'
            }
        },
        MuiMenu: {
            paper: {
                background: COLOR_CHROMIA_DARK
            }
        },
        MuiMenuItem: {
            gutters: {
                color: COLOR_SOFT_PINK,
                background: COLOR_CHROMIA_DARK
            }
        },
        MuiListItemIcon: {
            root: {
                color: COLOR_SOFT_PINK
            }
        },
        MuiIconButton: {
            colorInherit: {
                color: COLOR_SOFT_PINK
            }
        },
        MuiPaper: {
            root: {
                backgroundColor: COLOR_CHROMIA_DARK_LIGHTER
            }
        },
        MuiCard: {
            root: {
                background: COLOR_CHROMIA_DARK_LIGHTER,
                marginBottom: "3px"
            }
        },
        MuiSvgIcon: {
            root: {
                color: COLOR_SOFT_PINK
            }
        },
        MuiLink: {
            root: {
                color: COLOR_PURPLE
            }
        },
        MuiListItem: {
            "root": {
                "&$selected": {
                    "backgroundColor": COLOR_CHROMIA_DARK
                }
            }
        },
        MuiAvatar: {
            root: {
                color: COLOR_CHROMIA_DARKER
            }
        },
        MuiSelect: {
            icon: {
                color: COLOR_SOFT_PINK
            }
        }
    }
});

export default theme;
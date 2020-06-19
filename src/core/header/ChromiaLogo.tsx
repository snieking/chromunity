import React from "react";
import { COLOR_CHROMIA_DARKER, COLOR_OFF_WHITE, COLOR_SOFT_PINK } from "../../theme";
import { Theme } from "@material-ui/core";
import ApplicationState from "../application-state";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

interface Props {
  theme: Theme;
}

const useStyles = makeStyles(theme => ({
  logo: {
    backgroundColor: COLOR_CHROMIA_DARKER,
    paddingLeft: "6px",
    paddingRight: "6px",
    paddingTop: "4px",
    borderRadius: "5px"
  }
}));

const ChromiaLogo: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {
  const classes = useStyles();
  return (
    <div>
      <a href="https://chromia.com" target="_blank" rel="noopener noreferrer" className={classes.logo}>
        <svg width={81} height={21} viewBox="0 0 130 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M35.846 29.001v-9.33c0-2.203-.853-3.457-2.713-3.457-1.92 0-2.834 1.132-2.834 3.243V29h-5.058V6.363h5.058v7.281c.731-1.376 2.377-2.202 4.389-2.202 3.87 0 6.216 2.447 6.216 6.883V29h-5.059zM55.284 14.497a3.048 3.048 0 0 0-3.042-3.054 3.048 3.048 0 0 0-3.042 3.054 3.048 3.048 0 0 0 3.042 3.054 3.048 3.048 0 0 0 3.042-3.054zM43.617 12.005h4.754v16.977h-4.754V12.006z"
            fill={COLOR_SOFT_PINK}
          />
          <path
            d="M96.589 28.99v-9.146c0-2.662-.853-3.64-2.59-3.64-1.92 0-2.804 1.162-2.804 3.395v9.392h-5.058V19.63c0-2.203-.793-3.427-2.53-3.427-1.98 0-2.864 1.285-2.864 3.641v9.146h-5.06V12.014h4.725v1.804h.06c.884-1.59 2.5-2.386 4.663-2.386 2.194 0 3.809 1.101 4.876 3.029 1.219-1.928 3.047-3.029 5.363-3.029 3.779 0 6.277 2.325 6.277 7.067V28.99h-5.058zM109.428 12.005h-5.058v16.977h5.058V12.006zM124.941 28.99v-1.835h-.061c-.731 1.5-2.743 2.417-4.967 2.417-4.998 0-8.472-3.947-8.472-9.086 0-5.017 3.627-9.055 8.472-9.055 2.072 0 3.992.826 4.967 2.386h.061v-1.804H130V28.99h-5.059zm0-8.504a4.3 4.3 0 0 0-4.297-4.313c-2.316 0-4.144 1.927-4.144 4.375 0 2.355 1.859 4.282 4.206 4.282 2.376 0 4.235-1.896 4.235-4.344zM109.941 7.804a3.048 3.048 0 0 0-3.042-3.054 3.048 3.048 0 0 0-3.042 3.054 3.048 3.048 0 0 0 3.042 3.054 3.048 3.048 0 0 0 3.042-3.054z"
            fill={COLOR_OFF_WHITE}
          />
          <path
            d="M64.687 11.495c-4.965 0-8.99 4.04-8.99 9.025 0 4.984 4.025 9.024 8.99 9.024s8.99-4.04 8.99-9.024c0-4.984-4.025-9.025-8.99-9.025zm0 13.308a4.275 4.275 0 0 1-4.266-4.283 4.275 4.275 0 0 1 4.266-4.283 4.275 4.275 0 0 1 4.267 4.283 4.275 4.275 0 0 1-4.267 4.283zM16.877 20.417a5.884 5.884 0 0 1-5.207 3.15c-3.252 0-5.889-2.646-5.889-5.911 0-3.266 2.637-5.913 5.89-5.913a5.884 5.884 0 0 1 5.206 3.152h6.13c-1.23-5.147-5.832-8.978-11.337-8.978C5.225 5.917 0 11.162 0 17.633c0 6.47 5.225 11.715 11.67 11.715 5.489 0 10.08-3.808 11.326-8.931h-6.12z"
            fill={COLOR_SOFT_PINK}
          />
          <path
            d="M20.897 10.489a5.876 5.876 0 0 0 2.157-4.558c0-3.246-2.622-5.878-5.855-5.878-3.235 0-5.856 2.632-5.856 5.878v.005c.108-.003.217-.005.327-.005 3.758 0 7.096 1.786 9.227 4.558z"
            fill={"#CC91F0"}
          />
          <path
            d="M17.202 11.816c1.403 0 2.69-.495 3.7-1.321-2.132-2.771-5.47-4.557-9.228-4.557-.11 0-.218.002-.327.005.002 3.244 2.623 5.873 5.855 5.873z"
            fill={"#CC66B8"}
          />
        </svg>
      </a>
    </div>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    theme: store.styling.theme
  };
};

export default connect(mapStateToProps)(ChromiaLogo);

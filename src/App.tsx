import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "redux";
import { ApplicationState } from "./redux/Store";
import Logout from "./components/user/authentication/Logout";
import UserNotifications from "./components/user/notifications/UserNotifications";
import HeaderNav from "./components/static/HeaderNav";
import Footer from "./components/static/Footer";
import Election from "./components/governing/election/Election";
import Representatives from "./components/governing/representatives/Representatives";
import { GovLog } from "./components/governing/GovLog";
import UserWall from "./components/walls/Userwall";
import ChannelWall from "./components/walls/ChannelWall";
import Settings from "./components/user/settings/Settings";
import TopicWall from "./components/walls/TopicWall";
import FullTopic from "./components/topic/FullTopic";
import { Reports } from "./components/governing/reports/Reports";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./theme";
import { CssBaseline } from "@material-ui/core";
import WalletLogin from "./components/user/authentication/WalletLogin";
import RegisterAccount from "./components/user/authentication/RegisterAccount";

interface Props {
  store: Store<ApplicationState>;
}

const App: React.FunctionComponent<Props> = props => {
  return (
    <Provider store={props.store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <HeaderNav />
          <div className="content">
            <Route exact path="/" component={() => <TopicWall type="all" />} />
            <Route
              path="/followings"
              component={() => <TopicWall type="userFollowings" />}
            />
            <Route
              path="/channels"
              component={() => <TopicWall type="tagFollowings" />}
            />
            <Route path="/user/register/:username" component={RegisterAccount} />
            <Route path="/user/login" component={WalletLogin} />
            <Route path="/user/logout" component={Logout} />
            <Route path="/user/settings" component={Settings} />
            <Route path="/u/:userId" component={UserWall} />
            <Route
              path="/notifications/:userId"
              component={UserNotifications}
            />
            <Route path="/c/:channel" component={ChannelWall} />
            <Route path="/gov/representatives" component={Representatives} />
            <Route path="/gov/election" component={Election} />
            <Route path="/gov/log" component={GovLog} />
            <Route path="/gov/reports" component={Reports} />
            <Route path="/t/:id" component={FullTopic} />
          </div>
          <Footer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;

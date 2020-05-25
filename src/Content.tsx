import React from "react";
import VaultSuccess from "./features/user/authentication/VaultSuccess";
import Logout from "./features/user/authentication/Logout";
import Settings from "./features/user/settings/Settings";
import UserWall from "./features/walls/Userwall";
import UserNotifications from "./features/user/notifications/UserNotifications";
import ChannelWall from "./features/walls/channel/ChannelWall";
import Representatives from "./features/governing/representatives/Representatives";
import Election from "./features/governing/election/Election";
import GovLog from "./features/governing/GovLog";
import FullTopic from "./features/topic/full/FullTopic";
import { Route, Switch, withRouter } from "react-router";
import TopicWall from "./features/walls/TopicWall";
import { ErrorPage } from "./features/error-pages/ErrorPage";
import CandidateElectionVoteLink from "./features/governing/election/CandidateElectionVoteLink";
import ChatPage from "./features/chat/ChatPage";
import VaultCancel from "./features/user/authentication/VaultCancel";
import Reports from "./features/governing/reports/Reports";
import MetaTags from "react-meta-tags";
import * as config from "./config";
import SnackbarHolder from "./core/snackbar/SnackbarHolder";
import VaultLogin from "./features/user/authentication/vault-login/VaultLogin";

const Content: React.FunctionComponent = () => {
  return (
    <div className="content">
      <MetaTags>{config.test && <meta property="robots" content="noindex" />}</MetaTags>
      <Switch>
        <Route exact path="/" component={() => <TopicWall key="topic-wall" type="all" />} />
        <Route path="/followings" component={() => <TopicWall type="userFollowings" />} />
        <Route path="/channels" component={() => <TopicWall type="tagFollowings" />} />
        <Route path="/vault/success" component={VaultSuccess} />
        <Route path="/vault/cancel" component={VaultCancel} />
        <Route path="/user/login" component={VaultLogin} />
        <Route path="/user/logout" component={Logout} />
        <Route path="/user/settings" component={Settings} />
        <Route path="/u/:userId" component={UserWall} />
        <Route path="/notifications/:userId" component={UserNotifications} />
        <Route path="/c/:channel" component={ChannelWall} />
        <Route path="/gov/representatives" component={Representatives} />
        <Route path="/gov/election" component={Election} />
        <Route path="/gov/vote/:candidate" component={CandidateElectionVoteLink} />
        <Route path="/gov/log" component={GovLog} />
        <Route path="/gov/reports" component={Reports} />
        <Route path="/t/:id" component={FullTopic} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/error" component={ErrorPage} />
      </Switch>
      <SnackbarHolder />
    </div>
  );
};

export default withRouter(Content);

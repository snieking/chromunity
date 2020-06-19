import React from "react";
import VaultSuccess from "./features/user/authentication/vault-success";
import Logout from "./features/user/authentication/logout";
import Settings from "./features/user/settings/settings";
import UserWall from "./features/walls/user-wall";
import UserNotifications from "./features/user/notifications/user-notifications";
import ChannelWall from "./features/walls/channel/channel-wall";
import Representatives from "./features/governing/representatives/representatives";
import Election from "./features/governing/election/election";
import GovLog from "./features/governing/gov-log";
import FullTopic from "./features/topic/full/full-topic";
import { Route, Switch, withRouter } from "react-router";
import TopicWall from "./features/walls/topic-wall";
import { ErrorPage } from "./features/error-pages/error-page";
import CandidateElectionVoteLink from "./features/governing/election/candidate-election-vote-link";
import ChatPage from "./features/chat/chat-page";
import VaultCancel from "./features/user/authentication/vault-cancel";
import Reports from "./features/governing/reports/reports";
import MetaTags from "react-meta-tags";
import * as config from "./config";
import SnackbarHolder from "./core/snackbar/snackbar-holder";
import VaultLogin from "./features/user/authentication/vault-login/vault-login";

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

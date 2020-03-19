import React from "react";
import VaultSuccess from "./components/user/authentication/VaultSuccess";
import Logout from "./components/user/authentication/Logout";
import Settings from "./components/user/settings/Settings";
import UserWall from "./components/walls/Userwall";
import UserNotifications from "./components/user/notifications/UserNotifications";
import ChannelWall from "./components/walls/ChannelWall";
import Representatives from "./components/governing/representatives/Representatives";
import Election from "./components/governing/election/Election";
import { GovLog } from "./components/governing/GovLog";
import FullTopic from "./components/topic/FullTopic";
import { Route, Switch, withRouter } from "react-router";
import TopicWall from "./components/walls/TopicWall";
import WalletLogin from "./components/user/authentication/WalletLogin";
import { ErrorPage } from "./components/static/ErrorPage";
import CandidateElectionVoteLink from "./components/governing/election/CandidateElectionVoteLink";
import ChatPage from "./components/chat/ChatPage";
import VaultCancel from "./components/user/authentication/VaultCancel";
import Reports from "./components/governing/reports/Reports";

const Content: React.FunctionComponent = () => {
  return (
    <div className="content">
      <Switch>
        <Route exact path="/" component={() => <TopicWall key="topic-wall" type="all" />} />
        <Route path="/followings" component={() => <TopicWall type="userFollowings" />} />
        <Route path="/channels" component={() => <TopicWall type="tagFollowings" />} />
        <Route path="/vault/success" component={VaultSuccess} />
        <Route path="/vault/cancel" component={VaultCancel} />
        <Route path="/user/login" component={WalletLogin} />
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
    </div>
  );
};

export default withRouter(Content);

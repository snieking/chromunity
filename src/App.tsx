import * as React from "react";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Register} from "./components/user/Register/Register";
import {Login} from "./components/user/Login/Login";
import Logout from "./components/user/Logout/Logout";
import UserNotifications from "./components/Notification/UserNotifications";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import {Election} from "./components/Government/Election/Election";
import {Representatives} from "./components/Government/Representatives/Representatives";
import {GovLog} from "./components/Government/Log/GovLog";
import {UserWall} from "./components/Walls/UserWall/Userwall";
import {ChannelWall} from "./components/Walls/ChannelWall/ChannelWall";
import Settings from "./components/user/Settings/Settings";
import TopicWall from "./components/Walls/TopicWall/TopicWall";
import {FullTopic} from "./components/Topic/FullTopic/FullTopic";
import {Reports} from "./components/Government/Reports/Reports";

export class App extends React.Component {
    render() {
        return (
            <Router>
                <Header/>
                <div className="content">
                    <Route exact path="/" component={() => <TopicWall type="all"/>}/>
                    <Route path="/followings" component={() => <TopicWall type="userFollowings"/>}/>
                    <Route path="/channels" component={() => <TopicWall type="tagFollowings"/>}/>
                    <Route path="/user/register" component={Register}/>
                    <Route path="/user/login" component={Login}/>
                    <Route path="/user/logout" component={Logout}/>
                    <Route path="/user/settings" component={Settings}/>
                    <Route path="/u/:userId" component={UserWall}/>
                    <Route path="/notifications/:userId" component={UserNotifications}/>
                    <Route path="/c/:channel" component={ChannelWall}/>
                    <Route path="/gov/representatives" component={Representatives}/>
                    <Route path="/gov/election" component={Election}/>
                    <Route path="/gov/log" component={GovLog}/>
                    <Route path="/gov/reports" component={Reports}/>
                    <Route path='/t/:id' component={FullTopic}/>
                </div>
                <Footer/>
            </Router>
        );
    }
}

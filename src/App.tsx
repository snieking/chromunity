import * as React from "react";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {MainWall} from "./components/Walls/MainWall/MainWall";
import {Register} from "./components/user/Register/Register";
import {Login} from "./components/user/Login/Login";
import Logout from "./components/user/Logout/Logout";
import {FullThread} from "./components/FullThread/FullThread";
import {UserNotifications} from "./components/Notification/UserNotifications";
import {Header} from "./components/Header/Header";
import {Election} from "./components/Government/Election/Election";
import {Representatives} from "./components/Government/Representatives/Representatives";
import {GovLog} from "./components/Government/Log/GovLog";
import { UserWall } from "./components/Walls/UserWall/Userwall";
import { TagWall } from "./components/Walls/TagWall/TagWall";
import Settings from "./components/user/Settings/Settings";


export class App extends React.Component {
    render() {
        return (
            <Router>
                <Header/>
                <Route exact path="/" component={MainWall}/>
                <Route path="/user/register" component={Register}/>
                <Route path="/user/login" component={Login}/>
                <Route path="/user/logout" component={Logout}/>
                <Route path="/user/settings" component={Settings}/>
                <Route path="/u/:userId" component={UserWall}/>
                <Route path="/notifications/:userId" component={UserNotifications}/>
                <Route path="/thread/:id" component={FullThread}/>
                <Route path="/tag/:tag" component={TagWall}/>
                <Route path="/gov/representatives" component={Representatives}/>
                <Route path="/gov/election" component={Election}/>
                <Route path="/gov/log" component={GovLog}/>
            </Router>
        );
    }
}

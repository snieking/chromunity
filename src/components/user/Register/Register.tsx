import * as React from 'react';
import {register} from '../../../blockchain/UserService';
import {Redirect} from 'react-router-dom'
import '../../../styles/fade.css';

import AccountCircle from '@material-ui/icons/AccountCircle'

export interface RegisterProps {

}

export interface RegisterState {
    username: string,
    password: string,
    redirect: boolean
}

export class Register extends React.Component<RegisterProps, RegisterState> {

    constructor(props: RegisterProps) {
        super(props);

        this.state = {
            username: "",
            password: "",
            redirect: false
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.signUp = this.signUp.bind(this);
    }

    render() {
        if (this.state.redirect === true) {
            return <Redirect to='/user/login'/>
        }

        return (
            <div className="wrapper fadeInDown">
                <div id="formContent">
                    <br/>
                    <div className="fadeIn first">
                        <AccountCircle fontSize="large"/>
                    </div>

                    <input type="text" id="login" className="fadeIn second" name="register" placeholder="user"
                           onChange={this.handleUsernameChange}/>
                    <input type="password" id="password" className="fadeIn third" name="register"
                           placeholder="password"
                           onChange={this.handlePasswordChange}/>
                    <input type="button" className="fadeIn fourth" value="Register" onClick={this.signUp}/>

                </div>
            </div>
        );
    }

    private handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.persist();
        this.setState(prevState => ({
            username: event.target.value,
            password: prevState.password,
            redirect: false
        }));
    }

    private handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.persist();
        this.setState(prevState => ({
            username: prevState.username,
            password: event.target.value,
            redirect: false
        }));
    }

    private signUp() {
        register(this.state.username, this.state.password);
        this.setState(prevState => ({
            username: prevState.username,
            password: prevState.password,
            redirect: true
        }));
    }
}

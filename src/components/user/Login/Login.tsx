import * as React from "react";
import {login} from "../../../blockchain/UserService";
import {AccountCircle} from "@material-ui/icons";
import {getMnemonic} from "../../../util/user-util";

export interface LoginProps {
    login: Function
}

export interface LoginState {
    username: string,
    password: string,
    mnemonic: string,
    redirect: boolean
}

export class Login extends React.Component<LoginProps, LoginState> {

    constructor(props: LoginProps) {
        super(props);

        this.state = {
            username: "",
            password: "",
            mnemonic: getMnemonic(),
            redirect: false
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleMnemonicChange = this.handleMnemonicChange.bind(this);
        this.login = this.login.bind(this);
    }

    render() {
        if (this.state.redirect === true) {
            window.location.replace("/");
        }

        return (
            <div className="wrapper fadeInDown">
                <div id="formContent">
                    <br/>
                    <div className="fadeIn first">
                        <AccountCircle fontSize="large"/>
                    </div>

                    <input type="text" id="login" className="fadeIn second" name="login" placeholder="user"
                           onChange={this.handleUsernameChange}/>
                    <input type="password" id="password" className="fadeIn third" name="login"
                           placeholder="password"
                           onChange={this.handlePasswordChange}/>
                    <input type="text" id="mnemonic" className="fadeIn third" name="login"
                           placeholder="mnemonic phrase"
                           value={this.state.mnemonic || ""}
                           onChange={this.handleMnemonicChange}/>
                    <input type="button" className="fadeIn fourth" value="Login" onClick={this.login}/>

                    <div id="formFooter">
                        <a className="underlineHover no-text-decorator" href="/user/register">Sign up</a>
                    </div>

                </div>
            </div>
        );
    }

    private handleMnemonicChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.persist();
        this.setState({ mnemonic: event.target.value });
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

    private login() {
        login(this.state.username, this.state.password, this.state.mnemonic)
            .then(() => this.setState(prevState => ({
                    username: prevState.username,
                    password: prevState.password,
                    redirect: true
                }))
            )
            .catch(error => console.log("Error logging in: ", error));
    }
}

import * as React from 'react';
import {register} from '../../../blockchain/UserService';
import {Redirect} from 'react-router-dom'
import '../../../styles/fade.css';
import './Register.css';

import AccountCircle from '@material-ui/icons/AccountCircle'
import {Button, Chip, Typography} from "@material-ui/core";
import {generateRandomMnemonic} from "../../../blockchain/CryptoService";

export interface RegisterProps {

}

export interface RegisterState {
    username: string,
    password: string,
    redirect: boolean,
    generatedMnemonics: string[],
    currentClickableMnemonic: string,
    reBuiltMnemonics: string
}

export class Register extends React.Component<RegisterProps, RegisterState> {

    constructor(props: RegisterProps) {
        super(props);

        this.state = {
            username: "",
            password: "",
            redirect: false,
            generatedMnemonics: [],
            currentClickableMnemonic: "",
            reBuiltMnemonics: ""
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.signUp = this.signUp.bind(this);
        this.handleMnemonicClicked = this.handleMnemonicClicked.bind(this);
        this.retrieveRandomMnemonic = this.retrieveRandomMnemonic.bind(this);
        this.deleteMnemonicFromGeneratedMnemonics = this.deleteMnemonicFromGeneratedMnemonics.bind(this);
        this.copyMnemonicToClipboard = this.copyMnemonicToClipboard.bind(this);
        this.renderCopyToClipboardButton = this.renderCopyToClipboardButton.bind(this);
        this.renderMnemonicDescription = this.renderMnemonicDescription.bind(this);
    }

    componentDidMount(): void {
        const mnemonics: string = generateRandomMnemonic();
        const generatedMnemonics: string[] = mnemonics.split(" ");
        this.setState({
            generatedMnemonics: generatedMnemonics,
            currentClickableMnemonic: this.retrieveRandomMnemonic(generatedMnemonics)
        });
    }

    retrieveRandomMnemonic(mnemonics: string[]): string {
        return mnemonics[Math.floor(Math.random() * mnemonics.length)];
    }

    deleteMnemonicFromGeneratedMnemonics(mnemonic: string) {
        const mnemonics: string[] = this.state.generatedMnemonics;
        const filteredMnemonics: string[] = [];

        while (mnemonics.length) {
            const poppedMnemonic = mnemonics.pop();

            if (poppedMnemonic != null && mnemonic !== poppedMnemonic) {
                filteredMnemonics.push(poppedMnemonic);
            }
        }

        return filteredMnemonics;
    }

    handleMnemonicClicked() {
        const clickedMnemonic: string = this.state.currentClickableMnemonic;
        const updatedMnemonics: string[] = this.deleteMnemonicFromGeneratedMnemonics(clickedMnemonic);

        this.setState(prevState => ({
            reBuiltMnemonics: prevState.reBuiltMnemonics + clickedMnemonic + (updatedMnemonics.length > 0 ? " " : ""),
            currentClickableMnemonic: this.retrieveRandomMnemonic(updatedMnemonics),
            generatedMnemonics: updatedMnemonics
        }));
    }

    generateMnemonicChip(mnemonic: string) {
        if (this.state.currentClickableMnemonic === mnemonic) {
            return (
                <Chip key={"mnemonic-" + mnemonic} label={mnemonic} onDelete={this.handleMnemonicClicked}
                      color="primary"/>
            )
        } else {
            return (
                <Chip key={"mnemonic-" + mnemonic} label={mnemonic}/>
            )
        }
    }

    copyMnemonicToClipboard() {
        const mnemonicInput = document.getElementById("mnemonic") as HTMLInputElement;

        if (mnemonicInput != null) {
            mnemonicInput.select();
            mnemonicInput.focus();
            document.execCommand("copy");
        }
    }

    renderCopyToClipboardButton() {
        if (this.state.generatedMnemonics.length === 0) {
            return (
                <div>
                    <Button type="submit" color="primary" onClick={() => this.copyMnemonicToClipboard()}>
                        Copy to clipboard
                    </Button>
                    <br/>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Save your mnemonic seed, you will need it later
                    </Typography>
                </div>
            )
        }
    }

    renderMnemonicDescription() {
        if (this.state.generatedMnemonics.length > 0) {
            return (
                <div>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Click the marked phrases
                    </Typography>
                    <br/>
                </div>
            )
        }
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

                    <div className="mnemonic-area">
                        {this.renderMnemonicDescription()}
                        {this.state.generatedMnemonics.map(mnemonic => this.generateMnemonicChip(mnemonic))}
                        <br/>
                        <br/>
                        <input type="text" readOnly id="mnemonic" className="fadeIn second"
                               value={this.state.reBuiltMnemonics}/>
                        <br/>
                        {this.renderCopyToClipboardButton()}
                        <br/>
                    </div>
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
        register(this.state.username, this.state.password, this.state.reBuiltMnemonics);
        this.setState({redirect: true});
    }
}

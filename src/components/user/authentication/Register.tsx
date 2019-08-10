import * as React from 'react';
import {register} from '../../../blockchain/UserService';
import {Redirect} from 'react-router-dom'
import '../../../styles.css';

import AccountCircle from '@material-ui/icons/AccountCircle'
import {Button, Chip, createStyles, Snackbar, Typography, withStyles, WithStyles} from "@material-ui/core";
import {generateRandomMnemonic} from "../../../blockchain/CryptoService";
import {CustomSnackbarContentWrapper} from '../../common/CustomSnackbar';

const styles = createStyles({
    mnemonicArea: {
        paddingTop: "20px"
    }
});

export interface RegisterProps extends WithStyles<typeof styles> {

}

export interface RegisterState {
    username: string,
    password: string,
    secondPassword: string,
    redirect: boolean,
    generatedMnemonics: string[],
    currentClickableMnemonic: string,
    reBuiltMnemonics: string,
    conditionsNotMet: boolean,
    snackbarOpen: boolean,
    snackbarText: string
}

const Register = withStyles(styles)(
    class extends React.Component<RegisterProps, RegisterState> {

        constructor(props: RegisterProps) {
            super(props);

            this.state = {
                username: "",
                password: "",
                secondPassword: "",
                redirect: false,
                generatedMnemonics: [],
                currentClickableMnemonic: "",
                reBuiltMnemonics: "",
                conditionsNotMet: true,
                snackbarOpen: false,
                snackbarText: ""
            };

            this.handleUsernameChange = this.handleUsernameChange.bind(this);
            this.handlePasswordChange = this.handlePasswordChange.bind(this);
            this.handleSecondPasswordChange = this.handleSecondPasswordChange.bind(this);
            this.signUp = this.signUp.bind(this);
            this.handleMnemonicClicked = this.handleMnemonicClicked.bind(this);
            this.retrieveRandomMnemonic = this.retrieveRandomMnemonic.bind(this);
            this.deleteMnemonicFromGeneratedMnemonics = this.deleteMnemonicFromGeneratedMnemonics.bind(this);
            this.copyMnemonicToClipboard = this.copyMnemonicToClipboard.bind(this);
            this.renderCopyToClipboardButton = this.renderCopyToClipboardButton.bind(this);
            this.renderMnemonicDescription = this.renderMnemonicDescription.bind(this);
            this.handleClose = this.handleClose.bind(this);
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
                generatedMnemonics: updatedMnemonics,
                conditionsNotMet: updatedMnemonics.length > 0
            }));
        }

        generateMnemonicChip(mnemonic: string) {
            if (this.state.currentClickableMnemonic === mnemonic) {
                return (
                    <Chip key={"mnemonic-" + mnemonic}
                          label={mnemonic}
                          clickable onClick={this.handleMnemonicClicked}
                          style={{backgroundColor: '#FFAFC1'}}
                    />
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
                               onChange={this.handlePasswordChange}
                               value={this.state.password}/>
                        <input type="password" id="secondPassword" className="fadeIn third" name="register"
                               placeholder="repeat password"
                               onChange={this.handleSecondPasswordChange}
                               value={this.state.secondPassword}/>

                        <div className={this.props.classes.mnemonicArea}>
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
                        <input type="button"
                               className="fadeIn fourth"
                               value="Register"
                               onClick={this.signUp}
                               disabled={this.state.conditionsNotMet}
                        />
                    </div>

                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={this.state.snackbarOpen}
                        autoHideDuration={6000}
                        onClose={this.handleClose}
                    >
                        <CustomSnackbarContentWrapper
                            variant="error"
                            message={this.state.snackbarText}
                        />
                    </Snackbar>

                </div>
            );
        }

        private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
            if (reason === 'clickaway') {
                return;
            }

            this.setState({snackbarOpen: false, snackbarText: ""});
        }

        private handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
            event.preventDefault();
            event.stopPropagation();
            this.setState({username: event.target.value});
        }

        private handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
            event.preventDefault();
            event.stopPropagation();
            this.setState({password: event.target.value});
        }

        private handleSecondPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
            event.preventDefault();
            event.stopPropagation();
            this.setState({secondPassword: event.target.value});
        }

        private signUp() {
            if (this.state.password === this.state.secondPassword &&
                this.state.password.length > 5) {
                register(this.state.username, this.state.password, this.state.reBuiltMnemonics)
                    .then(() => this.setState({redirect: true}))
                    .catch(() => this.setState({
                        snackbarOpen: true,
                        snackbarText: "Error signing up, try another username",
                        username: "",
                        password: "",
                        secondPassword: ""
                    }));
            } else {
                this.setState({
                    password: "",
                    secondPassword: "",
                    snackbarOpen: true,
                    snackbarText: "Passwords must be at least 6 chars and match"
                });
            }
        }
    }
);

export default Register;

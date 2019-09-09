import React from "react";
import {clearSession} from "../../../util/user-util";

const Logout: React.FC = () => {
    logout();
    window.location.href = "/";
    return (
        <div></div>
    );
};

function logout() {
    clearSession();
}

export default Logout;

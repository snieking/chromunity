import React from "react";
import { Redirect } from "react-router-dom";

const Logout: React.FC = () => {
    logout();
    return (
        <div>
            return <Redirect to="/user/login" />
        </div>
    );
};

function logout() {
    localStorage.removeItem("user");
}

export default Logout;

import React from "react";

const Logout: React.FC = () => {
    logout();
    window.location.replace("/");
    return (
        <div></div>
    );
};

function logout() {
    localStorage.clear();
}

export default Logout;

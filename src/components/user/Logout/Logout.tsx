import React from "react";

const Logout: React.FC = () => {
    logout();
    window.location.replace("/");
    return (
        <div></div>
    );
};

function logout() {
    sessionStorage.clear();
    localStorage.clear();
}

export default Logout;

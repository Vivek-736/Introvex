import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-white flex justify-center items-center">
            {children}
        </div>
    );
};

export default AuthLayout;

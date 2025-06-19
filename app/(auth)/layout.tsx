import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gradient-to-tr from-purple-300 to-slate-600 flex justify-center items-center">
            {children}
        </div>
    );
};

export default AuthLayout;

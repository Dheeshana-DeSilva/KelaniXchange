import React from "react";
import { Outlet } from "react-router";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] flex-col">
            <AdminNavbar />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1450px] mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

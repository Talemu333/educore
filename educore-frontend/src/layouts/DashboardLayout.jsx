import { useState } from "react";

import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";


function DashboardLayout() {

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);


    return (

        <div className="flex min-h-screen bg-gray-100">


            {/* MOBILE OVERLAY */}

            {sidebarOpen && (

                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />

            )}


            {/* SIDEBAR */}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
            />


            {/* MAIN CONTENT */}

            <main className="min-w-0 flex-1">


                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />


                <section className="w-full p-4 sm:p-5 md:p-6 lg:p-8">

                    <Outlet />

                </section>

            </main>

        </div>

    );

}


export default DashboardLayout;

// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/layout/Sidebar";
// import Navbar from "../components/layout/Navbar";

// function DashboardLayout({ children }) {

//     return (

//         <div className="min-h-screen flex bg-gray-100">

//             <Sidebar />

//             <main className="flex-1">

//                 <Navbar />

//                 <section className="p-8">

//                     <Outlet />

//                 </section>

//             </main>

//         </div>

//     );

// }

// export default DashboardLayout;
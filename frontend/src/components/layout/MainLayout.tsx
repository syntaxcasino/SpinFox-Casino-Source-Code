"use client";

declare global {
    interface Window {
        LiveAgent: any;
    }
}

import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

import SidePanelHeader from "../SidePanelHeader";
import TopBarHeader from "../TopBarHeader";
import ModernHeader from "../ModernHeader";
import ModernSideBar from "../ModernSideBar";
import Footer from "../Footer";
import AdminSidePanel from "../AdminSidePanel";
import GameNavigation from "../GameNavigation";
import AdminTopBarHeader from "../AdminTopBarHeader";
import BetSlipModal from "../ui/BetSlip";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const pathname = usePathname();

    const [isAdmin, setIsAdmin] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("lobby");

    // Determine admin status
    useEffect(() => {
        if (user && user.role !== "user") setIsAdmin(true);
        else setIsAdmin(false);
    }, [user]);

    // Determine active category based on pathname
    useEffect(() => {
        if (!pathname) return;
        if (pathname.startsWith("/features")) setActiveCategory("Feature");
        else if (pathname.startsWith("/origin")) setActiveCategory("Origin");
        else if (pathname.startsWith("/slots")) setActiveCategory("Slot");
        else if (pathname.startsWith("/tables")) setActiveCategory("Tables");
        else if (pathname.startsWith("/news")) setActiveCategory("New");
        else setActiveCategory("lobby");
    }, [pathname]);

    // Initialize LiveAgent chat button after user and script are ready
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            if (window.LiveAgent && window.LiveAgent.createButton) {
                window.LiveAgent.createButton("3zrjvh22", {
                    name: user.username,
                    email: user.email,
                });
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="flex flex-col min-h-screen h-full bg-gradient-to-br from-light-bg via-light-bg to-light-bg-secondary dark:from-[#0a0615] dark:via-[#0f0a1f] dark:to-[#1a0f2e] transition-colors duration-300">

            {/* Headers */}
            {pathname.includes("admin") ? <AdminTopBarHeader /> : <ModernHeader />}

            {/* Sidebar */}
            {isAdmin && pathname.includes("admin") ? <AdminSidePanel /> : <ModernSideBar />}

            {/* Main Content */}
            <main className="flex-1 pt-24 pb-24 lg:pb-8 lg:pl-[280px] transition-all duration-300 ease-in-out">
                {children}
            </main>

            {/* Footer */}
            {/* <Footer /> */}

            {/* BetSlip Modal */}
            <BetSlipModal />

            {/* Load LiveAgent script */}
            <Script
                id="liveagent-script"
                strategy="afterInteractive"
                src="https://spinfox.ladesk.com/scripts/track.js"
            />
        </div>
    );
}

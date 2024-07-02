import React from 'react';
import {Route, Routes} from "react-router-dom";
import Layout from "@/components/layouts/Layout.jsx";
import Main from "@/pages/Main/Main.jsx";
import NotFound from "@/pages/NotFound/NotFound.jsx";
import Auth from "@/pages/Auth/Auth.jsx";

import RequireAuth from "@/components/business/RequireAuth.jsx";
import {AuthProvider} from "@/components/business/AuthProvider.jsx";
import Lobby from "@/pages/Lobby/Lobby.jsx";
import WaitPage from "@/pages/JoinGame/WaitPage.jsx";

import WinningTeam from "@/pages/GameOver/WinningTeam.jsx";
import AdminPageDuringGameplay from "@/pages/AdminPageDuringGameplay/AdminPageDuringGameplay.jsx";

const AppRouter = () => {
    return (
        <>
            <AuthProvider>
                <Routes>
                    <Route path="/auth" element={<Auth/>}/>
                    <Route path="/" element={<Layout className="bg-[#3FC7B8]"/>}>
                        <Route path="" element={<RequireAuth><Main/></RequireAuth>}/>
                        <Route path="join_game" element={<RequireAuth><WaitPage/></RequireAuth>}/>
                        <Route path="lobby" element={<RequireAuth><Lobby/></RequireAuth>}/>
                        <Route path="admin_page_during_gameplay" element={<RequireAuth><AdminPageDuringGameplay/></RequireAuth>}/>
                        <Route path="win" element={<RequireAuth><WinningTeam/></RequireAuth>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Route>
                </Routes>
            </AuthProvider>
        </>
    );
};

export default AppRouter;

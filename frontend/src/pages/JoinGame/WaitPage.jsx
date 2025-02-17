import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {getRules, joinGame, leaveGame} from "@/api/gamesCommon.js";
import {getDuration, getPlayerRole, getState} from "@/api/hideAndSeek.js";
import {useColor} from "@/components/layouts/ColorContext.jsx";
import {useInterval} from "@/utils/UseInterval.jsx";
import steps_1 from "@/assets/hideAndSeek/steps_1.svg";

export default function WaitPage() {
    const [duration, setDuration] = useState(null);
    const [waitTime, setWaitTime] = useState(null);
    const [rules, setRules] = useState(null);
    const [note, setNote] = useState(null);
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const gameId = searchParams.get("game_id");

    const [userRole, setUserRole] = useState(null);
    const [gameState, setGameState] = useState(null);

    const leaveGameByButton = () => {
        // Assuming leaveGame handles game leave logic
        navigate("/");
        leaveGame(gameId);
    }

    useEffect(() => {
        if (!gameId) {
            navigate("/");
        }

        joinGame(gameId) // Assuming joinGame handles game join logic
            .catch((error) => {
                if (error.response.status === 400) {
                    alert("Game has already started!");
                    navigate("/");
                }
            });
        getDuration(gameId).then((result) => {
            setDuration(result?.duration);
            setWaitTime(result?.time_to_hide);
        });
        getRules(gameId).then((result) => {
            setRules(result?.rules);
            setNote(result?.note);
        });
        getPlayerRole(gameId).then((result) => {
            setUserRole(result?.role);
        });
        getState(gameId).then((result) => {
            setGameState(result?.state);
        });
    }, [gameId, navigate]);

    useInterval(() => {
        getPlayerRole(gameId).then((result) => {
            setUserRole(result?.role);
        });
    }, 1000);

    useEffect(() => {
        if (userRole === "hider") {
            navigate(`/hider?game_id=${gameId}`);
        } else if (userRole === "seeker") {
            navigate(`/seeker?game_id=${gameId}`);
        }
    }, [userRole, gameId, navigate]);

    useEffect(() => {
        if (gameState === "hiders_win" || gameState === "seekers_win" || gameState === "no_winners") {
            navigate("/win?game_id=" + gameId);
        }
    }, [gameId, gameState, navigate]);

    const {setHeaderColor, setFooterColor, setBackgroundColor} = useColor();

    useEffect(() => {
        setHeaderColor('#FF7F29');
        setFooterColor('#FF7F29');
        setBackgroundColor('#FF7F29');
    }, [setHeaderColor, setFooterColor, setBackgroundColor]);

    return (
        <section className="my-8 flex flex-col justify-center items-center px-4 sm:px-8">
            <img src={steps_1} alt="steps" className="absolute top-24 right-0 h-96 z-0"/>
            <img src={steps_1} alt="steps" className="absolute bottom-0 left-0 h-96 z-0 rotate-90"/>
            <h1 className="text-3xl text-white font-bold mb-6">Hide and Seek Game</h1>

            <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-auto shadow-md border-4 border-[#FFC87A] z-10">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg">Number of Participants:</p>
                        <div className="bg-[#FFC87A] px-3 py-1 rounded-lg">
                            <p className="font-medium">Unlimited</p>
                        </div>
                    </div>

                    <div className="text-lg text-gray-800 justify-between mb-4">
                        <p className="mb-2">Rules of the game:</p>
                        <p>{rules}</p>
                    </div>

                    {
                        note && (
                            <div className="text-lg text-gray-800 justify-between mb-4">
                                <p className="mb-2">Game master comment:</p>
                                <p className="bg-[#FFC87A] px-3 py-1 rounded-lg font-bold" style={{whiteSpace: "pre-wrap"}}>{note}</p>
                            </div>
                        )
                    }

                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg">Game Duration:</p>
                        <div className="bg-[#FFC87A] px-3 py-1 rounded-lg">
                            <p className="font-medium">{duration} minutes</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-lg">Wait Time for Seekers:</p>
                        <div className="bg-[#FFC87A] px-3 py-1 rounded-lg">
                            <p className="font-medium">{waitTime} minutes</p>
                        </div>
                    </div>

                    <button
                        className="mt-6 bg-[#FF7F29] text-white font-bold py-2 px-4 rounded-lg"
                        onClick={leaveGameByButton}>Leave the Game
                    </button>
                </div>
            </div>
        </section>
    );
}

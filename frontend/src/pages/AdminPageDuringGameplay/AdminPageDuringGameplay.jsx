import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import clock from "@/assets/hideAndSeek/clock.svg";
import steps_1 from "@/assets/hideAndSeek/steps_1.svg";
import {getDuration, getHiderResults, getSeekerResults} from "@/api/hideAndSeek.js";

export default function AdminPageDuringGameplay() {
    const [searchParams] = useSearchParams();
    const [hiderResults, setHiderResults] = useState([]);
    const [seekerResults, setSeekerResults] = useState([]);
    const [activeButton, setActiveButton] = useState('hiders');
    const [hours, setHours] = useState(1);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const navigate = useNavigate();
    const gameId = searchParams.get("game_id");

    useEffect(() => {
        if (!gameId) {
            navigate("/", {replace: true});
        }
    }, [gameId, navigate]);

    // get duration and update the timer
    useEffect(() => {
        const fetchDuration = async () => {
            const res = await getDuration(gameId);
            const duration = Number(res["duration"]);

            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;

            setHours(hours);
            setMinutes(minutes);
            setSeconds(0);
        }

        fetchDuration();
    }, [gameId]);

    const finishGame = () => {
        navigate("/feedback_review");
    };

    useEffect(() => {
        const refreshData = async () => {
            const seekerRes = await getSeekerResults(gameId);
            setSeekerResults(seekerRes);

            const hiderRes = await getHiderResults(gameId);
            setHiderResults(hiderRes);
        };

        const timer = setInterval(() => {
            refreshData();
        }, 5000);

        return () => clearInterval(timer);
    }, [gameId]);


    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prevSeconds => {
                if (prevSeconds === 0) {
                    if (minutes === 0) {
                        if (hours === 0) {
                            clearInterval(timer);
                            finishGame();
                            return 0;
                        }
                        setHours(prevHours => prevHours - 1);
                        setMinutes(59);
                        return 59;
                    }
                    setMinutes(prevMinutes => prevMinutes - 1);
                    return 59;
                }
                return prevSeconds - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [minutes, hours, finishGame]);

    return (
        <section className="relative flex flex-col items-center justify-center bg-[#FF7F29]">
            <img src={steps_1} alt="steps" className="absolute top-24 right-0 h-96 z-0"/>
            <img src={steps_1} alt="steps" className="absolute bottom-0 left-0 h-96 z-0 rotate-90"/>

            <h1 className="text-4xl text-white font-bold mb-8 z-10">Hide and Seek</h1>
            <div className="flex flex-col sm:flex-row w-full sm:w-3/4 h-full sm:h-auto z-10">
                <div className="sm:w-1/2 p-4 flex flex-col items-center">
                    <div className="flex space-x-4 mt-4 justify-start w-full">
                        <button
                            className={`px-6 py-3 font-bold rounded ${activeButton === 'hiders' ? 'bg-white text-black' : 'bg-[#FFCD7B] text-black'} hover:bg-white`}
                            onClick={() => setActiveButton('hiders')}
                        >
                            Hiders
                        </button>
                        <button
                            className={`px-6 py-3 font-bold rounded ${activeButton === 'seekers' ? 'bg-white text-black' : 'bg-[#FFCD7B] text-black'} hover:bg-white`}
                            onClick={() => setActiveButton('seekers')}
                        >
                            Seekers
                        </button>
                    </div>

                    <div className="relative mt-4 w-full">
                        <div className="overflow-y-auto max-h-64">
                            <table className="table-auto border-collapse w-full bg-white rounded-lg">
                                <thead className="sticky top-0 bg-gray-200">
                                <tr>
                                    <th className="p-2 text-center">Telegram ID</th>
                                    <th className="p-2 text-center">Name</th>
                                    <th className="p-2 text-center">
                                        {activeButton === 'seekers' ? 'Players Found' : 'Found in Minutes'}
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {(activeButton === 'seekers' ? seekerResults : hiderResults).map((stat, index) => (
                                    <tr key={index}>
                                        <td className="p-2 text-center">{stat["telegram_id"]}</td>
                                        <td className="p-2 text-center">{stat["name"]}</td>
                                        <td className="p-2 text-center">
                                            {activeButton === 'seekers' ? stat["found"] : (stat["found_time"] == null ? "Not found" : stat["found_time"])}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="sm:w-1/2 p-4 flex flex-col items-center justify-center">
                    <div className="relative w-1/2">
                        <img src={clock} alt="clock" className="w-full h-auto max-w-xs mx-auto"/>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <span className="text-2xl md:text-3xl">
                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                    <button className="mt-4 px-6 py-3 bg-[#FFCD7B] text-black font-bold rounded" onClick={finishGame}>
                        Finish game
                    </button>
                </div>
            </div>
        </section>
    );
}

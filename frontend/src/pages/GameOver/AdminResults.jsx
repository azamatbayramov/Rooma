import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import {useColor} from "@/components/layouts/ColorContext.jsx";
import {getHiderResults, getSeekerResults, getState} from "@/api/hideAndSeek.js";
import steps_1 from "@/assets/hideAndSeek/steps_1.svg";
import Trophy from "@/components/game/Trophy.jsx";
import HiderSeekerTable from "@/pages/GameOver/HiderSeekerTable.jsx";
import Feedback from "@/components/game/Feedback.jsx";
import * as XLSX from 'xlsx';

export default function AdminResults() {
    const [searchParams] = useSearchParams();
    const [winningTeam, setWinningTeam] = useState("");
    const [activeButton, setActiveButton] = useState('hiders');
    const [hiderResults, setHiderResults] = useState([]);
    const [seekerResults, setSeekerResults] = useState([]);

    const navigate = useNavigate();
    const gameId = searchParams.get("game_id");

    const {setHeaderColor, setFooterColor, setBackgroundColor} = useColor();

    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        setHeaderColor('#FF7F29');
        setFooterColor('#FF7F29');
        setBackgroundColor('#FF7F29');
    }, [setHeaderColor, setFooterColor, setBackgroundColor]);


    useEffect(() => {
        const fetchData = async () => {
            if (!gameId) {
                navigate("/");
                return;
            }

            const res = await getState(gameId);
            const currentWinningTeam = res["state"];
            setWinningTeam(currentWinningTeam);

            if (currentWinningTeam === "seekers_win") {
                setActiveButton("seekers");
            } else if (currentWinningTeam === "hiders_win") {
                setActiveButton("hiders");
            } else if (currentWinningTeam === "no_winners") {
                setActiveButton("hiders");
            } else {
                alert("Game has not ended!");
                navigate("/");
                return;
            }

            const seekerRes = await getSeekerResults(gameId);
            const hiderRes = await getHiderResults(gameId);

            setSeekerResults(seekerRes);
            setHiderResults(hiderRes);
        };

        fetchData();
    }, [gameId, navigate]);

    const handleDownload = () => {
        const hiderData = hiderResults.map(({ telegram_id, name, found_time }) => ({
            "Telegram ID": telegram_id,
            "Name": name,
            "Found in Minutes": found_time == null ? "Not found" : found_time
        }));

        const seekerData = seekerResults.map(({ telegram_id, name, found }) => ({
            "Telegram ID": telegram_id,
            "Name": name,
            "Players Found": found
        }));

        // Создаем листы Excel для каждой таблицы
        const hiderSheet = XLSX.utils.json_to_sheet(hiderData);
        const seekerSheet = XLSX.utils.json_to_sheet(seekerData);

        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, hiderSheet, "Hiders");
        XLSX.utils.book_append_sheet(wb, seekerSheet, "Seekers");

        // Генерируем файл Excel
        const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});

        // Функция для конвертации в бинарный формат
        const s2ab = s => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        };

        // Создаем и инициируем скачивание файла
        const blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hide_and_seek_results_${gameId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <section className="relative flex flex-col items-center justify-center bg-[#FF7F29]">
            <img src={steps_1} alt="steps" className="absolute top-24 right-0 h-96 z-0"/>
            <img src={steps_1} alt="steps" className="absolute bottom-0 left-0 h-96 z-0 rotate-90"/>

            <h1 className="text-4xl text-white font-bold mb-8 z-10">Hide and Seek</h1>
            <div className="flex flex-col sm:flex-row w-full sm:w-3/4 h-full sm:h-auto z-10">
                <div className="sm:w-1/2 p-4 flex flex-col items-center justify-center">
                    <div className="justify-center items-center">
                        <Trophy/>
                    </div>
                    <div
                        className="border-[4px] border-gray-400 p-2 rounded-[10px] bg-white">
                        <h2 className="text-2xl text-gray-800">
                            {winningTeam === 'seekers_win'
                                ? 'SEEKERS'
                                : (winningTeam === 'hiders_win' ? 'HIDERS' : 'NO WINNERS')}
                        </h2>
                    </div>

                    <button
                        className="mt-2 px-6 py-3 bg-[#FFCD7B] text-black font-bold rounded"
                        onClick={() => {
                            navigate("/admin_feedback?game_id=" + gameId);
                        }}
                    >
                        Finish game and check feedback
                    </button>

                    <button
                        className="mt-2 px-6 py-3 bg-[#FFCD7B] text-black font-bold rounded"
                        onClick={handleDownload}
                    >
                        Download Results
                    </button>

                </div>
                <HiderSeekerTable
                    activeButton={activeButton}
                    setActiveButton={setActiveButton}
                    hiderResults={hiderResults}
                    seekerResults={seekerResults}
                />
                <Feedback
                    name="Hide and Seek"
                    gameId={gameId}
                    showFeedback={showFeedback}
                    setShowFeedback={setShowFeedback}
                />
            </div>
        </section>
    );
}

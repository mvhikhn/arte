"use client";

import { useState, useEffect } from "react";
import LastFmWidget from "./LastFmWidget";

export default function Footer() {
    const [bgColor, setBgColor] = useState("#f5f5f5");
    const [dateTime, setDateTime] = useState<string>("");
    const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    useEffect(() => {
        // Random pastel color
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 20) + 70; // 70-90%
        const lightness = Math.floor(Math.random() * 10) + 85; // 85-95%
        setBgColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);

        // Last update date (dynamic - today's date for demo purposes or build time)
        // For a static site, this might be build time, but "dynamically updated" implies current time or recent deploy.
        // I'll use current date formatted nicely.
        const now = new Date();
        setLastUpdate(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

        // Time update interval
        const updateTime = () => {
            const dhakaTime = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Dhaka",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                weekday: "short",
                day: "numeric",
                month: "short",
            });
            setDateTime(dhakaTime);
        };
        updateTime();
        const timeInterval = setInterval(updateTime, 1000);

        // Weather fetch
        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true"
                );
                const data = await res.json();
                if (data.current_weather) {
                    // Map WMO codes to text
                    const code = data.current_weather.weathercode;
                    let condition = "Clear";
                    if (code >= 1 && code <= 3) condition = "Partly Cloudy";
                    if (code >= 45 && code <= 48) condition = "Foggy";
                    if (code >= 51 && code <= 67) condition = "Rainy";
                    if (code >= 71 && code <= 77) condition = "Snowy";
                    if (code >= 80 && code <= 82) condition = "Showers";
                    if (code >= 95) condition = "Thunderstorm";

                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        condition,
                    });
                }
            } catch (e) {
                console.error("Weather fetch error", e);
            }
        };
        fetchWeather();

        return () => clearInterval(timeInterval);
    }, []);

    return (
        <footer
            className="w-full min-h-[320px] p-8 md:p-12 flex flex-col justify-between transition-colors duration-1000 ease-in-out mt-auto relative"
            style={{ backgroundColor: bgColor }}
        >
            {/* Top Section */}
            <div className="flex justify-between items-start w-full">
                {/* Top Left: Social Links */}
                <div className="flex flex-col gap-2 text-sm">
                    <a href="https://github.com/mvhikhn" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 transition-colors">GitHub</a>
                    <a href="https://linkedin.com/in/mvhikhn" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 transition-colors">LinkedIn</a>
                    <a href="https://x.com/mvhikhn" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 transition-colors">X</a>
                    <a href="mailto:mvhikhn@gmail.com" className="text-zinc-600 hover:text-zinc-900 transition-colors">Email</a>
                </div>

                {/* Top Right: Last.fm Widget */}
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm max-w-[200px]">
                    <LastFmWidget />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-start w-full mt-12 gap-4">
                {/* Bottom Left: Date | Location | Weather */}
                <div className="text-sm font-light text-zinc-800 tracking-tight text-left">
                    {new Date().toLocaleDateString('en-GB').replace(/\//g, '.')} | 📍DHK | {weather ? `${weather.temp} C- ${weather.condition}` : 'Loading...'}
                </div>

                {/* Bottom Right: Last Updated */}
                <div className="text-[10px] text-zinc-500 tracking-wide font-mono text-left">
                    Last Updated On {new Date().toLocaleDateString('en-GB').replace(/\//g, '.')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} GMT+6
                </div>
            </div>
        </footer>
    );
}

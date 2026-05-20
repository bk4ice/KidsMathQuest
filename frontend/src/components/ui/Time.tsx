import React, { useState, useEffect } from 'react';

export interface TimeProps {
  className?: string;
}

export const Time: React.FC<TimeProps> = ({ className }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMonth = (date: Date) => {
    return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return { displayHours, displayMinutes, ampm };
  };

  const { displayHours, displayMinutes, ampm } = formatTime(time);

  return (
    <div className={`inline-flex items-center gap-5 px-9 py-4 bg-gradient-to-b from-white to-[#f8f8f0] border-3 border-[#d4cfc3] rounded-[18px] shadow-[0_4px_10px_rgba(107,92,67,0.15)] animate-animal-fade-up ${className}`}>
      <div className="pr-6 border-r-3 border-[#9f927d]/35 text-center">
        <div className="text-[#6fba2c] font-[900] text-sm tracking-[1.5px] leading-tight">
          {formatWeekday(time)}
        </div>
        <div className="text-[#8b7355] font-[800] text-[22px] leading-tight">
          {formatMonth(time)} {formatDay(time)}
        </div>
      </div>
      <div className="flex items-baseline gap-1 text-[#8b7355] font-[900]">
        <span className="text-5xl tracking-[2px]">{displayHours}</span>
        <span className="text-5xl animate-[blink_1s_step-end_infinite] relative -top-[0.08em]">:</span>
        <span className="text-5xl tracking-[2px]">{displayMinutes}</span>
        <span className="text-xl ml-2">{ampm}</span>
      </div>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

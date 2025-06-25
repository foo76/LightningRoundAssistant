
import React from 'react';
import { formatTime } from '../utils/helpers';
// PaceData import removed

interface TimerDisplayProps {
  currentTimeRemaining: number;
  timePerSpeaker: number;
  // paceData prop removed
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ currentTimeRemaining, timePerSpeaker }) => {
  const amberThreshold = timePerSpeaker * 0.2;
  const isAmberTime = currentTimeRemaining <= amberThreshold && currentTimeRemaining > 0;
  const isCriticalTime = currentTimeRemaining <= 5 && currentTimeRemaining > 0; // Last 5 seconds critical
  
  let bgColor = 'bg-green-500'; // Default green
  let textColor = 'text-green-50';
  
  if (isAmberTime) {
    bgColor = 'bg-amber-400';
    textColor = 'text-amber-900';
  }
  if (isCriticalTime) {
    bgColor = 'bg-red-500'; 
    textColor = 'text-red-50';
  }
   if (currentTimeRemaining === 0 && timePerSpeaker > 0) { // Only if time was allocated
    bgColor = 'bg-slate-600'; // Neutral when time is up
    textColor = 'text-slate-300';
  } else if (timePerSpeaker === 0) { // Handles case of 0 time per speaker
    bgColor = 'bg-slate-600';
    textColor = 'text-slate-300';
  }


  const percentage = timePerSpeaker > 0 ? (currentTimeRemaining / timePerSpeaker) * 100 : 0;

  return (
    <div className="my-8 text-center">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-slate-700" // Background track
            strokeWidth="3.8"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`${
              isCriticalTime ? 'text-red-500' : 
              isAmberTime ? 'text-amber-400' : 
              (currentTimeRemaining === 0 && timePerSpeaker > 0) ? 'text-slate-500' : // Color for time up
              'text-green-500' // Default green or if timePerSpeaker is 0
            } transition-all duration-300 ease-linear`}
            strokeWidth="3.8"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 18 18)"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full ${bgColor} ${textColor} transition-colors duration-300`}>
          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight">
            {formatTime(currentTimeRemaining)}
          </div>
        </div>
      </div>
      {/* PaceData display elements removed */}
    </div>
  );
};

export default TimerDisplay;

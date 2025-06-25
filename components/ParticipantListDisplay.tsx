
import React from 'react';
import { Participant } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface ParticipantListDisplayProps {
  participants: Participant[];
  currentSpeakerId?: string;
}

const ParticipantListDisplay: React.FC<ParticipantListDisplayProps> = ({ participants, currentSpeakerId }) => {
  if (!participants.length) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">Turn Order</h3>
      <ul className="space-y-2">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className={`p-3 rounded-lg flex items-center justify-between transition-all duration-300
              ${participant.status === 'spoken' ? 'bg-slate-700 opacity-60' : 'bg-slate-700/80'}
              ${participant.id === currentSpeakerId ? 'ring-2 ring-sky-400 shadow-lg scale-105' : ''}
            `}
          >
            <span 
              className={`font-medium ${participant.status === 'spoken' ? 'text-slate-500 line-through' : 'text-slate-100'}
                         ${participant.id === currentSpeakerId ? 'text-sky-300' : ''}`}
            >
              {participant.name}
            </span>
            {participant.status === 'spoken' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
            {participant.status === 'speaking' && <span className="text-xs font-semibold text-sky-400 uppercase">Speaking</span>}
            {participant.status === 'pending' && <span className="text-xs text-slate-400">Waiting</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantListDisplay;
    
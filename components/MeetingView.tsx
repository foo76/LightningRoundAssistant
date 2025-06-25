
import React from 'react';
import { Participant, MeetingState } from '../types';
import TimerDisplay from './TimerDisplay';
import ParticipantListDisplay from './ParticipantListDisplay';
import Button from './Button';
import Modal from './Modal';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import RefreshIcon from './icons/RefreshIcon';
import SkipNextIcon from './icons/SkipNextIcon';


interface MeetingViewProps {
  participants: Participant[];
  currentSpeakerIndex: number;
  currentTimeRemaining: number;
  timePerSpeaker: number;
  meetingState: MeetingState;
  onPause: () => void;
  onResume: () => void;
  onEndMeeting: () => void;
  onSkipSpeaker: () => void;
}

const MeetingView: React.FC<MeetingViewProps> = ({
  participants,
  currentSpeakerIndex,
  currentTimeRemaining,
  timePerSpeaker,
  meetingState,
  onPause,
  onResume,
  onEndMeeting,
  onSkipSpeaker,
}) => {
  const currentSpeaker = participants[currentSpeakerIndex];
  const nextSpeaker = participants[currentSpeakerIndex + 1];
  const isLastSpeaker = currentSpeakerIndex >= participants.length - 1;

  if (meetingState === MeetingState.FINISHED || !currentSpeaker && meetingState !== MeetingState.IDLE) {
    return (
      <div className="text-center p-8 max-w-lg mx-auto bg-slate-800 rounded-xl shadow-2xl">
        <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-sky-400 mb-4">Meeting Finished!</h2>
        <p className="text-slate-300 mb-8">All participants have had their turn.</p>
        <Button onClick={onEndMeeting} variant="primary" size="lg">
          Start New Round
        </Button>
      </div>
    );
  }

  if (!currentSpeaker) {
      return (
        <div className="text-center p-8">
          <p className="text-slate-400">Loading meeting data or an unexpected state occurred.</p>
          <Button onClick={onEndMeeting} variant="secondary" size="md" className="mt-4">
            Reset
          </Button>
        </div>
      );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col w-full">
      <div className="bg-slate-800 p-6 md:p-10 rounded-xl shadow-2xl mb-8">
        <p className="text-xl text-slate-400 mb-1 text-center">Currently Speaking:</p>
        <h2 className="text-4xl md:text-5xl font-bold text-sky-400 mb-2 truncate text-center" title={currentSpeaker.name}>
          {currentSpeaker.name}
        </h2>

        {nextSpeaker ? (
          <p className="text-md text-slate-300 mb-6 text-center">
            Next up: <span className="font-semibold text-slate-100">{nextSpeaker.name}</span>
          </p>
        ) : (
          <p className="text-md text-slate-300 mb-6 text-center">This is the last speaker!</p>
        )}

        <TimerDisplay 
            currentTimeRemaining={currentTimeRemaining} 
            timePerSpeaker={timePerSpeaker}
        />

        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 my-8">
          {meetingState === MeetingState.RUNNING && (
            <Button onClick={onPause} variant="secondary" size="lg" className="px-8 py-3 w-full sm:w-auto">
              <PauseIcon className="w-6 h-6" /> Pause - hit Spacebar
            </Button>
          )}
          {meetingState === MeetingState.PAUSED && (
            <Button onClick={onResume} variant="primary" size="lg" className="px-8 py-3 w-full sm:w-auto">
              <PlayIcon className="w-6 h-6" /> Resume
            </Button>
          )}
          {(meetingState === MeetingState.RUNNING || meetingState === MeetingState.PAUSED) && (
            <Button 
              onClick={onSkipSpeaker} 
              variant="secondary" 
              size="lg" 
              className="px-8 py-3 w-full sm:w-auto"
              disabled={isLastSpeaker}
              aria-label="Skip to next person"
            >
              <SkipNextIcon className="w-6 h-6" /> Skip Next
            </Button>
          )}
           {(meetingState === MeetingState.RUNNING || meetingState === MeetingState.PAUSED) && (
             <Button onClick={onEndMeeting} variant="secondary" size="lg" className="px-8 py-3 w-full sm:w-auto" aria-label="Reset Meeting">
                <RefreshIcon className="w-6 h-6" /> Reset
            </Button>
           )}
        </div>
      </div>

      {/* Scrollable Participant List Container */}
      <div className="w-full max-w-md mx-auto max-h-72 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar spacing */}
        <ParticipantListDisplay participants={participants} currentSpeakerId={currentSpeaker.id} />
      </div>
      
      <Modal isOpen={meetingState === MeetingState.PAUSED && currentTimeRemaining <=0 && timePerSpeaker > 0} title="Time's Up & Paused!" flashingText="Over running">
         <p className="text-slate-300 mb-2">The timer for {currentSpeaker.name} has finished.</p>
         <p className="text-slate-300">The meeting is currently paused. Press Resume to continue to the next speaker or manage time.</p>
      </Modal>
      <Modal isOpen={meetingState === MeetingState.PAUSED && (currentTimeRemaining > 0 || timePerSpeaker === 0) } title="Timer Paused">
        <p className="text-slate-300">The timer is currently paused. Press Spacebar to resume.</p>
      </Modal>
    </div>
  );
};

export default MeetingView;

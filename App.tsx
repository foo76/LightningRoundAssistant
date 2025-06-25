import React, { useState, useEffect, useCallback } from 'react';
import { Participant, MeetingState, ParticipantInput, TimeAllocationMode } from './types';
import SetupForm from './components/SetupForm';
import MeetingView from './components/MeetingView';
import { shuffleArray } from './utils/helpers';

const App: React.FC = () => {
  const [meetingState, setMeetingState] = useState<MeetingState>(MeetingState.IDLE);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState<number>(0);
  const [timePerSpeaker, setTimePerSpeaker] = useState<number>(0); // in seconds
  const [currentTimeRemaining, setCurrentTimeRemaining] = useState<number>(0); // in seconds
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  }, [timerIntervalId]);

  const advanceToNextSpeaker = useCallback(() => {
    setParticipants(prev =>
      prev.map((p, index) =>
        index === currentSpeakerIndex ? { ...p, status: 'spoken' } : p
      )
    );

    if (currentSpeakerIndex + 1 < participants.length) {
      const nextIndex = currentSpeakerIndex + 1;
      setCurrentSpeakerIndex(nextIndex);
      setCurrentTimeRemaining(timePerSpeaker); // Reset to full time for next speaker
      setParticipants(prev =>
        prev.map((p, index) =>
          index === nextIndex ? { ...p, status: 'speaking' } : p
        )
      );
    } else {
      setMeetingState(MeetingState.FINISHED);
      clearTimer();
    }
  }, [currentSpeakerIndex, participants.length, timePerSpeaker, clearTimer]);


  useEffect(() => {
    if (meetingState === MeetingState.RUNNING && currentTimeRemaining > 0) {
      if (!timerIntervalId) {
        const intervalId = setInterval(() => {
          setCurrentTimeRemaining(prevTime => {
            if (prevTime <= 1) {
              advanceToNextSpeaker();
              return 0; 
            }
            return prevTime - 1;
          });
        }, 1000);
        setTimerIntervalId(intervalId);
      }
    } else if (meetingState !== MeetingState.RUNNING || currentTimeRemaining <= 0) {
      if (timerIntervalId) {
        clearTimer();
      }
    }
    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingState, currentTimeRemaining, timerIntervalId, advanceToNextSpeaker, clearTimer]);

  const handleStartMeeting = useCallback((timeValue: number, allocationMode: TimeAllocationMode, participantInputs: ParticipantInput[]) => {
    clearTimer();
    const numParticipants = participantInputs.length;
    if (numParticipants === 0) return;

    let calculatedTimePerSpeaker: number;
    if (allocationMode === TimeAllocationMode.TOTAL_TIME) {
        const totalTimeSeconds = timeValue * 60;
        calculatedTimePerSpeaker = Math.floor(totalTimeSeconds / numParticipants);
    } else { // TimeAllocationMode.PER_MEMBER
        calculatedTimePerSpeaker = timeValue * 60;
    }
    
    // Ensure time per speaker is at least 1 second if there's any time and participants
    if (calculatedTimePerSpeaker < 1 && timeValue > 0) {
        calculatedTimePerSpeaker = 1;
    }


    setTimePerSpeaker(calculatedTimePerSpeaker);
    
    const shuffledParticipantInputs = shuffleArray(participantInputs);

    const initialParticipants: Participant[] = shuffledParticipantInputs.map((pInput, index) => ({
      id: `participant-${index}-${pInput.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`,
      name: pInput.name,
      status: 'pending',
      isCustom: pInput.isCustom,
    }));

    if (initialParticipants.length > 0) {
      initialParticipants[0].status = 'speaking';
    }
    setParticipants(initialParticipants);

    setCurrentSpeakerIndex(0);
    setCurrentTimeRemaining(calculatedTimePerSpeaker);
    setMeetingState(MeetingState.RUNNING);
  }, [clearTimer]);

  const handlePause = useCallback(() => {
    if (meetingState === MeetingState.RUNNING) {
      setMeetingState(MeetingState.PAUSED);
    }
  }, [meetingState]);

  const handleResume = useCallback(() => {
    if (meetingState === MeetingState.PAUSED) {
      setMeetingState(MeetingState.RUNNING);
    }
  }, [meetingState]);

  const handleSkipSpeaker = useCallback(() => {
    if (meetingState === MeetingState.RUNNING || meetingState === MeetingState.PAUSED) {
      advanceToNextSpeaker();
      if(meetingState === MeetingState.PAUSED && currentSpeakerIndex +1 < participants.length) {
         setMeetingState(MeetingState.RUNNING); 
      }
    }
  }, [meetingState, advanceToNextSpeaker, currentSpeakerIndex, participants.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        event.preventDefault(); // Prevent default spacebar action (e.g., scrolling)
        if (meetingState === MeetingState.RUNNING) {
          handlePause();
        } else if (meetingState === MeetingState.PAUSED) {
          handleResume();
        }
      }
    };

    if (meetingState === MeetingState.RUNNING || meetingState === MeetingState.PAUSED) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [meetingState, handlePause, handleResume]);

  const handleEndMeeting = useCallback(() => {
    clearTimer();
    setMeetingState(MeetingState.IDLE);
    setParticipants([]);
    setCurrentSpeakerIndex(0);
    setTimePerSpeaker(0);
    setCurrentTimeRemaining(0);
  }, [clearTimer]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 container mx-auto py-8 px-4 flex flex-col items-center justify-center">
      {meetingState === MeetingState.IDLE && (
        <SetupForm onStartMeeting={handleStartMeeting} />
      )}
      {(meetingState === MeetingState.RUNNING || meetingState === MeetingState.PAUSED || meetingState === MeetingState.FINISHED) && participants.length > 0 && (
        <MeetingView
          participants={participants}
          currentSpeakerIndex={currentSpeakerIndex}
          currentTimeRemaining={currentTimeRemaining}
          timePerSpeaker={timePerSpeaker}
          meetingState={meetingState}
          onPause={handlePause}
          onResume={handleResume}
          onEndMeeting={handleEndMeeting}
          onSkipSpeaker={handleSkipSpeaker}
        />
      )}
    </div>
  );
};

export default App;

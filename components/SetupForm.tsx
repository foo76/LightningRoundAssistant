import React, { useState, useCallback, useMemo } from 'react';
import Button from './Button';
import UserPlusIcon from './icons/UserPlusIcon';
import PlayIcon from './icons/PlayIcon';
import ClockIcon from './icons/ClockIcon';
import { formatTime } from '../utils/helpers';
import { ParticipantInput, TimeAllocationMode } from '../types';

interface SetupFormProps {
  onStartMeeting: (timeValue: number, allocationMode: TimeAllocationMode, participants: ParticipantInput[]) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStartMeeting }) => {
  const [timeAllocationMode, setTimeAllocationMode] = useState<TimeAllocationMode>(TimeAllocationMode.TOTAL_TIME);
  const [timeInput, setTimeInput] = useState<string>('30'); // Represents either total time or time per person
  const [customMemberInput, setCustomMemberInput] = useState<string>('');
  const [customMembers, setCustomMembers] = useState<string[]>([]);

  const handleAddCustomMember = useCallback(() => {
    const namesToAdd = customMemberInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name);

    if (namesToAdd.length === 0) {
      setCustomMemberInput('');
      return;
    }

    const newUniqueMembers: string[] = [];
    const currentCustomMembersSet = new Set(customMembers);

    for (const name of namesToAdd) {
      if (!currentCustomMembersSet.has(name)) {
        newUniqueMembers.push(name);
        currentCustomMembersSet.add(name);
      }
    }

    if (newUniqueMembers.length > 0) {
      setCustomMembers(prev => [...prev, ...newUniqueMembers]);
    }
    setCustomMemberInput('');
  }, [customMemberInput, customMembers]);

  const handleRemoveCustomMember = (nameToRemove: string) => {
    setCustomMembers(prev => prev.filter(name => name !== nameToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeValue = parseInt(timeInput, 10);
    const participantInputs: ParticipantInput[] = customMembers.map(name => ({ name, isCustom: true }));

    if (timeValue > 0 && participantInputs.length > 0) {
      onStartMeeting(timeValue, timeAllocationMode, participantInputs);
    } else {
      alert("Please enter a valid time and add at least one participant.");
    }
  };

  const totalParticipantsCount = customMembers.length;

  const timeInputLabel = useMemo(() => {
    return timeAllocationMode === TimeAllocationMode.TOTAL_TIME
      ? "Total meeting time (minutes)"
      : "Time per person (minutes)";
  }, [timeAllocationMode]);

  const calculatedTimePerPersonDisplay = useMemo(() => {
    const timeValue = parseInt(timeInput, 10);
    if (isNaN(timeValue) || timeValue <= 0 || totalParticipantsCount === 0) {
      return formatTime(0);
    }
    if (timeAllocationMode === TimeAllocationMode.TOTAL_TIME) {
      return formatTime(Math.floor((timeValue * 60) / totalParticipantsCount));
    }
    // TimeAllocationMode.PER_MEMBER
    return formatTime(timeValue * 60);
  }, [timeInput, timeAllocationMode, totalParticipantsCount]);

  const isFormValid = parseInt(timeInput, 10) > 0 && totalParticipantsCount > 0;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl space-y-8">
      <h1 className="text-4xl font-bold text-sky-400 text-center">Lightning Round Setup</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="block text-sm font-medium text-slate-300 mb-2">Time Allocation Method</legend>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                id="totalTimeMode"
                name="timeAllocationMode"
                type="radio"
                value={TimeAllocationMode.TOTAL_TIME}
                checked={timeAllocationMode === TimeAllocationMode.TOTAL_TIME}
                onChange={() => setTimeAllocationMode(TimeAllocationMode.TOTAL_TIME)}
                className="h-4 w-4 text-sky-500 border-slate-600 focus:ring-sky-400 bg-slate-700 custom-radio"
              />
              <label htmlFor="totalTimeMode" className="ml-2 block text-sm text-slate-200 cursor-pointer">
                Total Meeting Time
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="perMemberMode"
                name="timeAllocationMode"
                type="radio"
                value={TimeAllocationMode.PER_MEMBER}
                checked={timeAllocationMode === TimeAllocationMode.PER_MEMBER}
                onChange={() => setTimeAllocationMode(TimeAllocationMode.PER_MEMBER)}
                className="h-4 w-4 text-sky-500 border-slate-600 focus:ring-sky-400 bg-slate-700 custom-radio"
              />
              <label htmlFor="perMemberMode" className="ml-2 block text-sm text-slate-200 cursor-pointer">
                Time per Person
              </label>
            </div>
          </div>
        </fieldset>

        <div>
          <label htmlFor="timeValue" className="block text-sm font-medium text-slate-300 mb-1">
            {timeInputLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="number"
              id="timeValue"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              min="1"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400"
              placeholder="e.g., 30"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Add Team Members</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customMemberInput}
              onChange={(e) => setCustomMemberInput(e.target.value)}
              placeholder="Enter name(s), separated by commas"
              className="flex-grow p-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400"
              aria-describedby="custom-member-tooltip"
            />
            <Button type="button" onClick={handleAddCustomMember} variant="secondary" size="md" className="px-3">
              <UserPlusIcon className="w-5 h-5" /> Add
            </Button>
          </div>
          <p id="custom-member-tooltip" className="text-xs text-slate-400 mt-1 ml-1">
            Tip: Add individually or multiple names separated by commas.
          </p>
          {customMembers.length > 0 && (
            <ul className="mt-3 space-y-1">
              {customMembers.map(name => (
                <li key={name} className="flex justify-between items-center p-2 bg-slate-700 rounded-md text-sm">
                  <span className="text-slate-200">{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomMember(name)}
                    className="text-red-400 hover:text-red-300 text-xs"
                    aria-label={`Remove ${name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-700">
            {isFormValid && (
                 <p className="text-sm text-slate-400 mb-4 text-center">
                    Total Participants: {totalParticipantsCount}. Time per person: {calculatedTimePerPersonDisplay}.
                </p>
            )}
            <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full"
                disabled={!isFormValid}
            >
                <PlayIcon className="w-6 h-6" />
                Start & Randomize ({totalParticipantsCount} {totalParticipantsCount === 1 ? 'person' : 'people'})
            </Button>
        </div>
      </form>
    </div>
  );
};

export default SetupForm;

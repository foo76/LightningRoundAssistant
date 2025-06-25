
export interface Participant {
  id: string;
  name: string;
  status: 'pending' | 'speaking' | 'spoken';
  isCustom?: boolean; // Flag to identify custom-added members
}

export interface ParticipantInput {
  name: string;
  isCustom: boolean;
}

export enum MeetingState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export enum TimeAllocationMode {
  TOTAL_TIME = 'totalTime',
  PER_MEMBER = 'perMember',
}

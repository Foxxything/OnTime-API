export enum SecondarySource {
  Aux1 = 'aux1',
  Aux2 = 'aux2',
  Aux3 = 'aux3',
  Secondary = 'secondary',
  None = 'none',
}

export enum PlaybackState {
  Play = 'play',
  Pause = 'pause',
  Armed = 'armed',
  Stop = 'stop',
  Roll = 'roll',
}

export interface messageResponse {
  timer: {
    text: string;
    visible: boolean;
    blink: boolean;
    blackout: boolean;
    secondarySource: SecondarySource | null;
  },
  secondary: string;
}

export interface TimerResponse {
  addedTime: number;                       // time added / removed by user
  current: number | null;                  // running countdown
  duration: number | null;                 // duration of loaded event
  elapsed: number | null;                  // elapsed time in current timer 
  expectedFinish: number | null;           // time when current timer is expected to finish
  playback: PlaybackState;                 // playback state
  startedAt: number | null;                // time when current timer was started
}
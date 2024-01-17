export const BaseUrl = '/api';
export const LocalUrl = 'http://localhost:2233';

export interface IMsg {
  target: 'notification' | 'push';
  states: 'success' | 'fail' | 'wait';
  detail: string;
  timestamp: number;
}

export interface IResponse {
  result: 'success' | 'fail';
  timestamp: number;
}

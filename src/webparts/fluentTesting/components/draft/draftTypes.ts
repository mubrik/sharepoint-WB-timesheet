import { ISpUserPeriodData } from '../../controller/serverTypes';

// types
/* props for draft */
export interface IDraftProps {
  appData?: {};
}
/* state for draft component */
export interface IDraftState {
  [key: string]: ISpUserPeriodData[];
  full: ISpUserPeriodData[];
}

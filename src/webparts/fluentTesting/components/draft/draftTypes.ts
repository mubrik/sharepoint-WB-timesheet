import { IUserYear, IStoreYearWeekItem } from '../dataTypes';

// types
/* props for draft */
export interface IDraftProps {
  userData?: IUserYear;
}
/* state for draft component */
export interface IDraftState {
  [key: string]: IStoreYearWeekItem[];
  full: IStoreYearWeekItem[];
}

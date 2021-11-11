import { IStoreYearWeekItem } from '../dataTypes';

// types
/* props for draft */
export interface IDraftProps {

}
/* state for draft component */
export interface IDraftState {
  [key: string]: IStoreYearWeekItem[];
  full: IStoreYearWeekItem[];
}

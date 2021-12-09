import { IGroup } from "office-ui-fabric-react";
// types
import { ISpUserTaskData } from "../controller/serverTypes";

export interface IUserData {
  id: number;
  email: string;
  manager: string;
  displayName: string;
  jobTitle: string;
  isUserManager: boolean;
}


export type IStoreState = {
  data: IStoreMainData;
  status: string;
};

export interface IStoreMainData {
  yearList: string[];
  years: {
    [key: string]: IStoreYearWeekItem[];
  };
  items: {
    [key: number]: ISpUserTaskData;
  };
}

export interface IStoreYearWeekItem {
    itemIds: number[];
    status: string;
    week: string;
    year: string;
}

export interface ISingleTaskObject {
  ID?: number;
  periodReferenceId?: string;
  project: string;
  location: string;
  task: string;
  description: string;
  freshService: string;
  week: string;
  year: string;
  status: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

const group20: IGroup = {
  key: "2020",
  count: 53,
  name: "2020",
  startIndex: 0
};
const group21: IGroup = {
  key: "2021",
  count: 53,
  name: "2021",
  startIndex: 0
};
export const draftGroupList: IGroup[] = [group20, group21];

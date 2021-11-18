import { sp } from "@pnp/sp/presets/core";
import {IUserData} from "../components/dataTypes";


/* interface */
export interface IServer {
  fetch: typeof sp;
  getUser(): Promise<IUserData>;
}

export interface IServerReqObject {
  data: ISpUserTaskData[];
  week?: string;
  year?: string;
  status?: string;
}

export interface ISpUserPeriodData {
  ID: number;
  referenceId: string;
  username: string;
  status: string;
  year: number;
  week: number;
}

export interface ISpUserTaskData {
  ID?: number;
  periodReferenceId?: string;
  project: string;
  location: string;
  task: string;
  freshService: string;
  description: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

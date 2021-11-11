import { sp } from "@pnp/sp/presets/core";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISPJsFullItemsObj } from "../components/dataTypes";

/* interface */
export interface IServer {
  fetch: typeof sp;
  context: WebPartContext|null;
  getList: () => Promise<any[]>;
  getUserList: () => Promise<any[]| ISPFullItemsObj[]>;
  createDraft: (param: IServerReqObject) => Promise<void>;
}

export interface IServerReqObject {
  week: string;
  year: string;
  data: ISPJsFullItemsObj[];
  status: string;
}
/* user data object received after filter*/
export interface ISPFullItemsObj {
  Id: number;
  User: string;
  Projects: string;
  Description: string;
  FreshService: string;
  Location: string;
  Status: string;
  Task: string;
  Year: string;
  Week: string;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

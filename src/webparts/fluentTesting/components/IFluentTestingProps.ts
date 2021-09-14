import { WebPartContext } from "@microsoft/sp-webpart-base";


export interface IFluentTestingProps {
  description: string;
  context: WebPartContext;
}

export interface MainPageProps {
  description: string;
  context: WebPartContext;
}

export interface INavProps {
  pageState: string;
  setPageState(): any;
}
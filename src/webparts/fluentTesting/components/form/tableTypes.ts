import * as React from "react";
// grid imports
import {
  GridReadyEvent,
  GridApi,
  ColumnApi,
} from "@ag-grid-community/all-modules";
// ui
import { IDropdownOption } from "office-ui-fabric-react";
import { ISpUserTaskData, ISpUserPeriodData } from "../../controller/serverTypes";

export type ITablePageState = "idle" | "loaded" | "loading";
export type ITableFormMode = "new" | "edit";

/* interface for table form validation data */
export interface IFormValid  {
  formState: false;
  msg: string;
  tableState: { state: false; msg: string };
}
/* interface for table draft data */
export interface IDraft {
  state: boolean;
  draft: ISpUserPeriodData;
}
/* base interface for components imported by table  */

export interface IBaseTableProps {
  formMode: ITableFormMode;
  api: GridApi | null;
}

export interface ITableDate extends IBaseTableProps {
  totalHoursInSec: number;
  selectedYear: IDropdownOption;
  selectedWeek: IDropdownOption;
  setSelectedYear: React.Dispatch<React.SetStateAction<IDropdownOption>>;
  setSelectedWeek: React.Dispatch<React.SetStateAction<IDropdownOption>>;
}

export interface ITableDraft extends IBaseTableProps {
  selectedYear: IDropdownOption;
  selectedWeek: IDropdownOption;
  setFormMode: React.Dispatch<React.SetStateAction<ITableFormMode>>;
  setTablePageState: React.Dispatch<React.SetStateAction<ITablePageState>>;
  validateDataEntries: (api: GridApi) => boolean;
}

export interface ITableMainForm extends IBaseTableProps {
  formData: ISpUserTaskData[];
  totalHoursInSec?: number;
  onGridReady?: (event: GridReadyEvent) => void;
}

export interface ITableSave extends IBaseTableProps {
  formData: ISpUserTaskData[];
  selectedYear: IDropdownOption;
  selectedWeek: IDropdownOption;
  setTablePageState: React.Dispatch<React.SetStateAction<ITablePageState>>;
}

export interface ITableInput extends IBaseTableProps {
  column?: ColumnApi | null;
  rowSelected?: number[];
  setRowSelected?: React.Dispatch<React.SetStateAction<number[]>>;
  validateDataEntries?: (api: GridApi) => boolean;
  calculateTotalTime?: (api: GridApi) => boolean;
}

// export interface ITableControlProps {
//   formMode: ITableFormMode;
//   api: GridApi | null;
//   column?: ColumnApi | null;
//   rowSelected?: number[];
//   setRowSelected?: React.Dispatch<React.SetStateAction<number[]>>;
//   validateDataEntries?: (api: GridApi) => boolean;
//   calculateTotalTime?: (api: GridApi) => boolean;
//   setDraftPageState?: React.Dispatch<React.SetStateAction<string>>;
//   totalHoursInSec?: number;
//   onGridReady?: (event: GridReadyEvent) => void;
// }

// export interface ITableDraftControlProps {
//   hasDraft?: IDraft;
//   api: GridApi | null;
//   formMode: string;
//   setFormMode: React.Dispatch<React.SetStateAction<string>>;
//   validateDataEntries?: (api?: GridApi) => boolean;
// }

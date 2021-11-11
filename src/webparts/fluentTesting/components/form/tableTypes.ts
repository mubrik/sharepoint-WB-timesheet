import * as React from "react";
// grid imports
import {
  GridReadyEvent,
  GridApi,
  ColumnApi,
} from "@ag-grid-community/all-modules";
import { IStoreYearWeekItem } from "../dataTypes";

/* interface for table form validation data */
export interface IFormValid  {
  formState: false;
  msg: string;
  tableState: { state: false, msg: string };
}
/* interface for table draft data */
export interface IDraft {
  state: boolean;
  draft: IStoreYearWeekItem | {};
}
/* base interface for components imported by table  */

interface IBaseTableProps {
  formMode: string;
  api: GridApi | null;
}

export interface ITableDate extends IBaseTableProps {
  totalHoursInSec: number;
}

export interface ITableDraft extends IBaseTableProps {
  hasDraft: IDraft;
  setFormMode: React.Dispatch<React.SetStateAction<string>>;
  validateDataEntries: (api?: GridApi) => boolean;
}

export interface ITableMainForm extends IBaseTableProps {
  totalHoursInSec?: number;
  onGridReady?: (event: GridReadyEvent) => void;
}

export interface ITableSave extends IBaseTableProps {

}

export interface ITableInput extends IBaseTableProps {
  column?: ColumnApi | null;
  rowSelected?: number[];
  setRowSelected?: React.Dispatch<React.SetStateAction<number[]>>;
  validateDataEntries?: (api?: GridApi) => boolean;
  calculateTotalTime?: (api?: GridApi) => boolean;
}

export interface ITableControlProps {
  formMode: string;
  api: GridApi | null;
  column?: ColumnApi | null;
  rowSelected?: number[];
  setRowSelected?: React.Dispatch<React.SetStateAction<number[]>>;
  validateDataEntries?: (api?: GridApi) => boolean;
  calculateTotalTime?: (api?: GridApi) => boolean;
  setDraftPageState?: React.Dispatch<React.SetStateAction<string>>;
  totalHoursInSec?: number;
  onGridReady?: (event: GridReadyEvent) => void;
}

export interface ITableDraftControlProps {
  hasDraft: IDraft;
  api: GridApi | null;
  formMode: string;
  setFormMode: React.Dispatch<React.SetStateAction<string>>;
  validateDataEntries?: (api?: GridApi) => boolean;
}

import {IComboBoxOption} from 'office-ui-fabric-react';
import { GridApi, ColumnApi} from "@ag-grid-community/all-modules";

export interface INewFormProps {
  dateObj: Date;
}

export interface ITableControlProps {
  api:GridApi | null;
  column:ColumnApi | null;
  rowState?: number[]
}


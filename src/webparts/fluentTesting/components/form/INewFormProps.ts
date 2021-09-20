import { GridApi, ColumnApi} from "@ag-grid-community/all-modules";
import { IWeekData } from "../sampleData";

export interface INewFormProps {
  dateObj?: Date;
  id?: string
  setDataApi?: React.Dispatch<React.SetStateAction<GridApi|IListStore|null>>;
  editData?: IWeekData
}

export interface ITableControlProps {
  api:GridApi | null;
  column:ColumnApi | null;
  rowState?: number[]
}

export interface IListStore {
  list: React.ReactElement[];
  current: number|null;
  next: number|null;
  previous: number|null;
}


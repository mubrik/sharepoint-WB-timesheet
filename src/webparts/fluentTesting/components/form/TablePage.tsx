import * as React from "react";
// context data
import { DateContext, TableDataContext, RequestContext } from "../FluentTesting";
import { StoreData } from "../FluentTesting";
import {IStoreYearWeekItem} from "../dataTypes";
import { IServer } from "../../controller/serverTypes";
// UI
import {
  PrimaryButton,
  Stack,
  StackItem,
  Label,
  ProgressIndicator,
  MessageBarType,
  DatePicker,
  Text,
  DayOfWeek,
  FirstWeekOfYear,
} from "office-ui-fabric-react";
import { stylesDanger } from "../utils/utils";
// grid imports
import {
  GridReadyEvent,
  GridApi,
  ColumnApi,
  AllCommunityModules,
  RowSelectedEvent,
  CellValueChangedEvent,
  VirtualRowRemovedEvent,
  ComponentStateChangedEvent,
  RowDataChangedEvent
} from "@ag-grid-community/all-modules";
import { AgGridReact, AgGridColumn } from "@ag-grid-community/react";
import { useMediaQuery } from "react-responsive";
import "@ag-grid-community/client-side-row-model";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
// option tables
import { projectOptions, taskOptions, locationOptions } from "./optionSelect";
// sampleData and types
import {  IStoreState } from "../dataTypes";
// time column editor
import TimeEditor, { timeValueFormatter } from "./customCellEditor";
// hooks
import { useGetDatesHook, useGetTableDataFromStore } from "../utils/reactHooks";
// utils
import {
  valueToSeconds,
  objHasProperty,
  getWeekAndYear,
  getRandomInt,
  delay,
  weekToDate,
} from "../utils/utils";
import { secondsToHours } from "date-fns";
import NotificationBar from "../utils/NotificationBar";
import ResponsivePrimaryButton from "../utils/ResponsiveButton";
import * as XLSX from "xlsx";
// custom components
import TableMainForm from "./TableMainForm";
import TableDateControl from "./TableDateControl";
import TableDraftControl from "./TableDraftControl";
import TableInputControl from "./TableInputControl";

export interface IProps {
  mode: string;
  setDraftPage?: React.Dispatch<React.SetStateAction<string>>;
}

// validation context, available global
export const Validation = React.createContext(null);
// initial state
const initialValidState = {
  formState: false,
  msg: "",
  tableState: { state: false, msg: "" },
};
const initialDraftState: { state: boolean; draft: IStoreYearWeekItem | {} } = {
  state: false,
  draft: {},
};

const TablePage: React.FunctionComponent<IProps> = (props: IProps) => {
  // props to be used
  let _mode = props.mode;
  // date, tabledata and storedata context
  const {
    tableData,
    setTableData,
  }: {
    tableData: number[] | [];
    setTableData: React.Dispatch<React.SetStateAction<number[] | []>>;
  } = React.useContext(TableDataContext);
  const { data: storeData }: { data: IStoreState } = React.useContext(StoreData);
  const { date: dateValue }: { date: Date } = React.useContext(DateContext);
  // states
  const [formMode, setFormMode] = React.useState<string>(_mode || "new");
  const [totalHoursInSec, setTotalHoursInSec] = React.useState<number | null>(
    0
  );
  const [hasDraft, setHasDraft] = React.useState(initialDraftState);
  // validation state, memo validation value to ease rerender
  const [validState, setValidState] = React.useState(initialValidState);
  const validationValue = React.useMemo(
    () => ({ validState, setValidState }),
    [validState]
  );
  // exposing grid and column api
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState<null | ColumnApi>(
    null
  );
  // track row selection
  const [rowSelected, setRowSelected] = React.useState<number[]>([]);

  // effect to set mode
  React.useEffect(() => {
    if (_mode === "new") {
      // do something
      setTableData([]);
    } else if (_mode === "edit") {
      // do something else
      setFormMode("edit");
    }
  }, [_mode]);

  // if page is edit, calculate time. checking grid api to only run after table loads
  React.useEffect(() => {
    if (gridApi && formMode === "edit") {
      calculateTotalTime();
    }
  }, [gridApi, formMode]);

  // validation effect
  React.useEffect(() => {
    // check date is set
    if (dateValue === null) {
      setValidState((oldState) => {
        return {
          ...oldState,
          formState: false,
          msg: "Select a Date",
        };
      });

      return;
    }

    // if time over value
    if (totalHoursInSec > 259200) {
      setValidState((oldState) => {
        return {
          ...oldState,
          formState: false,
          msg: "Hours cant be over 72",
        };
      });

      return;
    }

    // table validation
    if (!validState.tableState.state) {
      setValidState((oldState) => {
        return {
          ...oldState,
          formState: false,
          msg: oldState.tableState.msg,
        };
      });

      return;
    }

    // default, only gets here if all validation checks successful
    setValidState((oldState) => {
      return {
        ...oldState,
        formState: true,
        msg: "",
      };
    });
  }, [dateValue, totalHoursInSec, validState.tableState]);

  // draft checker effect
  React.useEffect(() => {
    // checks if selected period has an available draft
    if (dateValue === null) return;
    // get week and year
    let [_week, _year] = getWeekAndYear(dateValue);
    console.log(_week, _year);
    // store has year
    if (storeData.status === "loaded") {
      if (storeData.data.yearList.includes(_year)) {
        // find if week exists
        let _draftItem = storeData.data.years[_year].find((weekData) => {
          return weekData.week === _week;
        });
        // doesnt exist
        if (typeof _draftItem === "undefined") {
          return;
        }
        // exist
        setHasDraft({
          state: true,
          draft: _draftItem,
        });
      }
    }
    /* if (_year in storeData.data && _week in storeData.data[_year]) {
      setHasDraft({
        state: false,
        draft: storeData[_year][_week]
      });
    } */
  }, [dateValue]);

  // just a list of stuff
  const weekDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const arrToValidate = ["project", "task"];

  // exposes grid api on grid ready event
  const handleGridReady = (event: GridReadyEvent) => {
    console.log("grid ready");
    setGridApi(event.api);
    setGridColumnApi(event.columnApi);
    // validation
    // if not edit data disable until row added
    if (tableData.length === 0) {
      setValidState((oldState) => {
        return {
          ...oldState,
          tableState: { state: false, msg: "Add a row" },
        };
      });
    } else {
      setValidState((oldState) => {
        return {
          ...oldState,
          tableState: { state: true, msg: "" },
        };
      });
    }
    // testing event listeners
    // use values from event/state dispatch as event listenrs handler function doesnt have access to current state values
    // when cell value changes
    event.api.addEventListener(
      "cellValueChanged",
      (_event: CellValueChangedEvent) => {
        let eventColumn = _event.colDef.field;
        // column a in week
        if (weekDays.includes(eventColumn)) {
          // calculate total time
          console.log("time cell chng");
          calculateTotalTime(_event.api);
        } else if (arrToValidate.includes(eventColumn)) {
          // validate entries
          console.log("proj/task cell chng");
          validateDataEntries(_event.api);
        }
      }
    );
    // when row removed
    event.api.addEventListener(
      "virtualRowRemoved",
      (_event: VirtualRowRemovedEvent) => {
        console.log("row removed");
        validateDataEntries(_event.api);
      }
    );
    // handle rowselected state
    event.api.addEventListener("rowSelected", (_event: RowSelectedEvent) => {
      // check if row is actually selected, event triggers for previousselect when switching select
      // get index
      let row = _event.rowIndex;
      // if row === null, row has been removed by table input control and set row already called
      if (row === null) {
        return;
      }
      // if ro in array, remove it, else add it
      setRowSelected((oldRows) => {
        if (oldRows.includes(row)) {
          let newArr = oldRows.filter((value) => value !== row);
          return newArr;
        } else {
          return [...oldRows, row];
        }
      });
    });
    event.api.addEventListener("componentStateChanged", (_event:ComponentStateChangedEvent) =>
      console.log(_event)
    );
    event.api.addEventListener("dataChanged", (_event: RowDataChangedEvent) => console.log(_event));
  };
  // utils
  // calculate  total time in time cells
  const calculateTotalTime = (api: GridApi = gridApi) => {
    // grid api
    let _gridApi = api ? api : gridApi;
    // if grid api valid
    if (_gridApi === null) return false;
    // total
    let totalTimeInSec = 0;

    _gridApi.forEachNode((rowNode, _) => {
      // get row data
      let rowdata = { ...rowNode.data };
      // loop over every column, if a weekday column, calculate time in secs and add it
      Object.keys(rowdata).forEach((colName) => {
        if (weekDays.includes(colName)) {
          let timeInSec = valueToSeconds(rowdata[colName]);
          totalTimeInSec += timeInSec;
        }
      });
    });

    setTotalHoursInSec(totalTimeInSec);
  };
  // validate data in table
  const validateDataEntries = (api: GridApi = gridApi): boolean => {

    console.log("validating");
    // grid api
    let _gridApi = api ? api : gridApi;
    // if grid api valid
    if (_gridApi === null) return false;
    // iteration control
    let isValid = true;
    // row number
    let rowsNumber = _gridApi.getDisplayedRowCount();

    if (rowsNumber === 0) {
      setValidState((oldState) => {
        return {
          ...oldState,
          tableState: { state: false, msg: "Add a row" },
        };
      });

      return;
    }

    _gridApi.forEachNode((rowNode, index) => {
      // if validation already hit an invalid entry, return
      if (!isValid) return;
      // get row data
      let rowdata = { ...rowNode.data };
      // row id
      let rowId = index;
      // check row data for missing fields
      let [valid, response] = objHasProperty(arrToValidate, rowdata);

      if (!valid) {
        // a column is missing a value
        setValidState((oldState) => {
          return {
            ...oldState,
            tableState: {
              state: false,
              msg: response + ` at row ${rowId + 1}`,
            },
          };
        });
        // set is valid to false so iteration halts
        isValid = false;
        return isValid;
        // set as valid only after last row checked, avoid changing states frequently
      } else if (valid && rowId === rowsNumber-1) {
        setValidState((oldState) => {
          return {
            ...oldState,
            tableState: { state: true, msg: "" },
          };
        });
        isValid = true;
        return isValid;
      }
    });

    return isValid;
  };

  return (
    <Validation.Provider value={validationValue}>
      <Stack tokens={{ childrenGap: 5, padding: 2 }}>
        <TableBackControl
          formMode={formMode}
          setDraftPageState={props.setDraftPage}
          api={gridApi}
        />
        <TableDateControl
          formMode={formMode}
          api={gridApi}
          totalHoursInSec={totalHoursInSec}
        />
        <TableDraftControl
          hasDraft={hasDraft}
          api={gridApi}
          formMode={formMode}
          setFormMode={setFormMode}
          validateDataEntries={validateDataEntries}
        />
        <TableMainForm
          formMode={formMode}
          api={gridApi}
          onGridReady={handleGridReady}
          totalHoursInSec={totalHoursInSec}
        />
        <TableInputControl
          formMode={formMode}
          api={gridApi}
          column={gridColumnApi}
          rowSelected={rowSelected}
          setRowSelected={setRowSelected}
          validateDataEntries={validateDataEntries}
          calculateTotalTime={calculateTotalTime}
        />
      </Stack>
    </Validation.Provider>
  );
};

interface ITableControlProps {
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

interface ITableDraftControlProps {
  hasDraft: typeof initialDraftState;
  api: GridApi | null;
  formMode: string;
  setFormMode: React.Dispatch<React.SetStateAction<string>>;
  validateDataEntries?: (api?: GridApi) => boolean;
}


const TableBackControl: React.FunctionComponent<ITableControlProps> = (
  props: ITableControlProps
) => {
  // context
  const {
    setDate,
  }: { setDate: React.Dispatch<React.SetStateAction<null | Date>> } =
    React.useContext(DateContext);
  // return button only if edit mode and a prop to set draft page is set
  let formMode = props.formMode;
  let setDraftPageState = props.setDraftPageState;

  // handlers
  const handleBackClicked = () => {
    setDraftPageState("list");
    // null date
    setDate(null);
  };

  return (
    <>
      {formMode === "edit" && setDraftPageState ? (
        <StackItem>
          <PrimaryButton
            text={"Back"}
            iconProps={{ iconName: "ChromeBack" }}
            onClick={handleBackClicked}
            styles={stylesDanger}
          />
        </StackItem>
      ) : null}
    </>
  );
};

export default TablePage;

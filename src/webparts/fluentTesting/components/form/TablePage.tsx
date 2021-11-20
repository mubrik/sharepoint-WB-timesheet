import * as React from "react";
// context data
import { TableDataContext } from "../FluentTesting";
// UI
import {
  PrimaryButton,
  Stack, Spinner,
  StackItem,
  IDropdownOption
} from "office-ui-fabric-react";
// server
import fetchServer from "../../controller/server";
import {ISpUserTaskData} from "../../controller/serverTypes";
// utils
import { stylesDanger } from "../utils/utils";
// grid imports
import {
  GridReadyEvent,
  GridApi,
  ColumnApi,
  RowSelectedEvent,
  CellValueChangedEvent,
  VirtualRowRemovedEvent,
  ComponentStateChangedEvent,
  RowDataChangedEvent
} from "@ag-grid-community/all-modules";
// utils
import {
  valueToSeconds,
  objHasProperty,
  getWeekAndYear,
} from "../utils/utils";
// custom components
import TableMainForm from "./TableMainForm";
import TableDateControl from "./TableDateControl";
import TableDraftControl from "./TableDraftControl";
import TableInputControl from "./TableInputControl";
import TableSaveControl from "./TableSaveControl";
import TableDatePeriodLabel from "./TableDatePeriodLabel";
// types
import {ITablePageState, ITableFormMode} from "./tableTypes";

export interface IProps {
  mode: ITableFormMode;
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
// const initialDraftState: { state: boolean; draft: ISpUserTaskData | null } = {
//   state: false,
//   draft: {},
// };

const TablePage: React.FunctionComponent<IProps> = (props: IProps) => {
  // props to be used
  const _mode = props.mode;
  // date, tabledata and storedata context
  const {
    tableData,
    setTableData,
  } = React.useContext(TableDataContext);
  // states
  const [formMode, setFormMode] = React.useState<ITableFormMode>(_mode || "new");
  const [tablePageState, setTablePageState] = React.useState<ITablePageState>("idle");
  const [formData, setFormData] = React.useState<ISpUserTaskData[]>([]);
  const [totalHoursInSec, setTotalHoursInSec] = React.useState<number | null>(0);
  // const [hasDraft, setHasDraft] = React.useState(initialDraftState);
  // validation state, memo validation value to ease rerender
  const [validState, setValidState] = React.useState(initialValidState);
  const validationValue = React.useMemo(
    () => ({ validState, setValidState }),
    [validState]
  );
  // exposing grid and column api
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState<null | ColumnApi>(null);
  // selected year and week
  const [selectedYear, setSelectedYear] = React.useState<IDropdownOption>(null);
  const [selectedWeek, setSelectedWeek] = React.useState<IDropdownOption>(null);
  // track row selection
  const [rowSelected, setRowSelected] = React.useState<number[]>([]);

  // effect to set mode
  React.useEffect(() => {
    setFormMode(_mode);
  }, []);

  // effect to fetch table data 
  React.useEffect(() => {

    const _tableData = [];
    // if idle
    if (formMode === "edit" && tablePageState === "idle") {
      console.log("loading table data");
      // memory leak if "virtualrowremoved" event triggers and reference to old gridapi
      setGridApi(null);
      // set loading
      setTablePageState("loading");
      // load data
      fetchServer.getUserTaskByReference(tableData.referenceId)
        .then(result => {
          console.log("table data loaded");
          setFormData(result);
          setTablePageState("loaded");
        })
        .catch(error => console.log(error));
    } else if (formMode === "new" && tablePageState === "idle") {
      setFormData([]);
      setTablePageState("loaded");
    }

  }, [formMode, tablePageState]);

  // if page is edit, calculate time. checking grid api to only run after table loads
  React.useEffect(() => {
    if (gridApi && formMode === "edit") {
      calculateTotalTime(gridApi);
    }
  }, [gridApi, formMode]);

  // validation effect
  React.useEffect(() => {
    // check date is set only if formpage === new
    if (formMode === "new" && selectedWeek === null) {
      setValidState((oldState) => {
        return {
          ...oldState,
          formState: false,
          msg: "Select a Time Period",
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
  }, [selectedWeek, totalHoursInSec, validState.tableState]);

  // draft checker effect
  // React.useEffect(() => {
  //   // checks if selected period has an available draft
  //   if (selectedYear === null || selectedWeek === null) return;

  //   // reference id
  //   const referenceId = `${selectedYear.key}${selectedWeek.key}`;
  //   // ask server if it exists
  //   fetchServer.getUserPeriodByReference(referenceId)
  //     .then(result => {
  //       if (result.length > 0) {
  //         // item exist
  //         setHasDraft()
  //       }
  //     })
  //     .catch(error => console.log(error));

  //   // response

  // }, [selectedWeek, selectedYear]);

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
  const handleGridReady = (event: GridReadyEvent): void => {
    console.log("grid ready");
    setGridApi(event.api);
    setGridColumnApi(event.columnApi);
    // validation
    // if not edit data disable until row added
    if (formMode === "new") {
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
    // event listeners
    // use values from event/state dispatch as event listenrs handler function doesnt have access to current state values
    // when cell value changes
    event.api.addEventListener(
      "cellValueChanged",
      (_event: CellValueChangedEvent) => {
        const eventColumn = _event.colDef.field;
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
      const row = _event.rowIndex;
      // if row === null, row has been removed by table input control and set row already called
      if (row === null) {
        return;
      }
      // if ro in array, remove it, else add it
      setRowSelected((oldRows) => {
        if (oldRows.includes(row)) {
          const newArr = oldRows.filter((value) => value !== row);
          return newArr;
        } else {
          return [...oldRows, row];
        }
      });
    });
    event.api.addEventListener("componentStateChanged", (_event: ComponentStateChangedEvent) => {
      // do something
    });
    event.api.addEventListener("dataChanged", (_event: RowDataChangedEvent) => console.log(_event));
  };
  // utils
  // calculate  total time in time cells
  const calculateTotalTime = (api: GridApi): boolean => {
 
    // if grid api valid
    if (api === null) return false;
    // total
    let totalTimeInSec = 0;

    api.forEachNode((rowNode, _) => {
      // get row data
      const rowdata = { ...rowNode.data };
      // loop over every column, if a weekday column, calculate time in secs and add it
      Object.keys(rowdata).forEach((colName) => {
        if (weekDays.includes(colName)) {
          const timeInSec = valueToSeconds(rowdata[colName]);
          totalTimeInSec += timeInSec;
        }
      });
    });

    setTotalHoursInSec(totalTimeInSec);
  };
  // validate data in table
  const validateDataEntries = (api: GridApi): boolean => {

    console.log("validating");
    // if grid api valid
    if (api === null) return false;
    // iteration control
    let isValid = true;
    // row number
    const rowsNumber = api.getDisplayedRowCount();

    if (rowsNumber === 0) {
      setValidState((oldState) => {
        return {
          ...oldState,
          tableState: { state: false, msg: "Add a row" },
        };
      });

      return;
    }

    api.forEachNode((rowNode, index) => {
      // if validation already hit an invalid entry, return
      if (!isValid) return;
      // get row data
      const rowdata = { ...rowNode.data };
      // row id
      const rowId = index;
      // check row data for missing fields
      const [valid, response] = objHasProperty(arrToValidate, rowdata);

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
        <Stack horizontal tokens={{childrenGap: 7}} verticalAlign="end">
          <TableDateControl
            formMode={formMode}
            api={gridApi}
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            setSelectedYear={setSelectedYear}
            totalHoursInSec={totalHoursInSec}
          />
          <TableDraftControl
            api={gridApi}
            formMode={formMode}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            setFormMode={setFormMode}
            setTablePageState={setTablePageState}
            validateDataEntries={validateDataEntries}
          />
        </Stack>
        {
          tablePageState === "loading" ?
          <>
            <Spinner label={"Loading table data"} ariaLive="assertive" labelPosition="top"></Spinner>
          </> :
          <>
            <TableSaveControl 
              formMode={formMode} 
              api={gridApi} 
              formData={formData}
              selectedYear={selectedYear}
              selectedWeek={selectedWeek}
              setTablePageState={setTablePageState}
            />
            <TableDatePeriodLabel
              api={gridApi}
              formMode={formMode}
            />
            <TableMainForm
              formMode={formMode}
              formData={formData}
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
          </>
        }
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

const TableBackControl: React.FunctionComponent<ITableControlProps> = (
  props: ITableControlProps
) => {
  // return button only if edit mode and a prop to set draft page is set
  const formMode = props.formMode;
  const setDraftPageState = props.setDraftPageState;

  // handlers
  const handleBackClicked = (): void => {
    setDraftPageState("list");
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

import * as React from "react";
// context data
import { DateContext, TableDataContext } from "../FluentTesting";
import { IAction, StoreData, IState } from "../FluentTesting";
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
import { IUserWeek, IUserWeekData } from "../sampleData";
// time column editor
import TimeEditor, { timeValueFormatter } from "./customCellEditor";
// hooks
import { useGetDatesHook } from "../utils/reactHooks";
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

export interface IProps {
  mode: string;
  setDraftPage?: React.Dispatch<React.SetStateAction<string>>;
}

// validation context, available global
const Validation = React.createContext(null);
const initialValidState = {
  formState: false,
  msg: "",
  tableState: { state: false, msg: "" },
};
const initialDraftState: { state: boolean; draft: IUserWeek | {} } = {
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
    tableData: IUserWeekData[] | [];
    setTableData: React.Dispatch<React.SetStateAction<IUserWeekData[] | []>>;
  } = React.useContext(TableDataContext);
  const { data: storeData }: { data: IState } = React.useContext(StoreData);
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
      if (_year in storeData.data && _week in storeData.data[_year]) {
        setHasDraft({
          state: true,
          draft: storeData.data[_year][_week],
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
  const arrToValidate = ["Project", "Task"];

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

const TableMainForm: React.FunctionComponent<ITableControlProps> = (
  props: ITableControlProps
) => {
  // media queries
  const small = useMediaQuery({ maxWidth: 320 });
  const medium = useMediaQuery({ minWidth: 320, maxWidth: 479 });
  const large = useMediaQuery({ minWidth: 480, maxWidth: 639 });
  const xlarge = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const xxlarge = useMediaQuery({ minWidth: 1024, maxWidth: 1365 });
  // const xxxlarge = useMediaQuery({ minWidth: 1366, maxWidth: 1920 });
  // props
  let _totalTimeInSec = props.totalHoursInSec;

  // date, tabledata and storedata context
  const { tableData }: { tableData: IUserWeekData[] | [] } =
    React.useContext(TableDataContext);
  const { date: dateValue }: { date: Date } = React.useContext(DateContext);
  // date list hook
  const selectedDates = useGetDatesHook(dateValue ? dateValue : null);
  // format date column labels
  const formatLabel = (day: string, index: number): string => {
    // if date is null for some reason
    if (selectedDates === null) {
      return `${day} - `;
    }

    return `${day}-${selectedDates[index].toLocaleDateString()}`;
  };
  // time column props
  const timeColProps = {
    width: small
      ? 42
      : medium
      ? 50
      : large
      ? 54
      : xlarge
      ? 58
      : xxlarge
      ? 64
      : 68,
    resizable: small ? false : true,
    editable: true,
    cellEditor: "timeEditor",
    valueFormatter: timeValueFormatter,
  };
  // column with choices props
  const choiceColProps = {
    width: small
      ? 86
      : medium
      ? 92
      : large
      ? 96
      : xlarge
      ? 100
      : xxlarge
      ? 118
      : 126,
    resizable: small ? false : true,
    editable: true,
    cellEditor: "agSelectCellEditor",
  };
  // column with choices props
  const activityColProps = {
    width: small
      ? 140
      : medium
      ? 160
      : large
      ? 172
      : xlarge
      ? 198
      : xxlarge
      ? 208
      : 212,
    resizable: small ? false : true,
    editable: true,
    field: "Activity Desription",
  };

  return (
    <>
      <Stack
        horizontal
        wrap
        tokens={{ childrenGap: 9, padding: 2 }}
        horizontalAlign={"space-between"}
        verticalAlign={"center"}
      >
        {selectedDates && (
          <span>
            <strong>Period: </strong>
            {selectedDates[0].toDateString()} to{" "}
            {selectedDates[6].toDateString()}
          </span>
        )}
        <span>
          <strong>Time Spent: </strong>
          {`${secondsToHours(_totalTimeInSec)} Hours`}
        </span>
        <TableSaveControl formMode={props.formMode} api={props.api} />
      </Stack>
      <div
        className={"ag-theme-balham"}
        style={{ minHeight: 400, height: "50vh", width: "100%" }}
      >
        <AgGridReact
          rowData={tableData}
          rowSelection="multiple"
          modules={AllCommunityModules}
          enableRangeSelection={true}
          frameworkComponents={{
            timeEditor: TimeEditor,
          }}
          onGridReady={props.onGridReady}
        >
          <AgGridColumn
            {...choiceColProps}
            field="Project"
            cellEditorParams={{ values: projectOptions }}
            checkboxSelection={true}
            headerCheckboxSelection={true}
          />
          <AgGridColumn
            {...choiceColProps}
            field="Location"
            cellEditorParams={{ cellHeight: 200, values: locationOptions }}
          />
          <AgGridColumn
            {...choiceColProps}
            field="Task"
            cellEditorParams={{ cellHeight: 200, values: taskOptions }}
          />
          <AgGridColumn
            {...choiceColProps}
            cellEditor={"agTextCellEditor"}
            field="FreshService ID"
          />
          <AgGridColumn {...activityColProps} />
          <AgGridColumn
            {...timeColProps}
            field="monday"
            headerName={formatLabel("Mon", 0)}
          />
          <AgGridColumn
            {...timeColProps}
            field="tuesday"
            headerName={formatLabel("Tue", 1)}
          />
          <AgGridColumn
            {...timeColProps}
            field="wednesday"
            headerName={formatLabel("Wed", 2)}
          />
          <AgGridColumn
            {...timeColProps}
            field="thursday"
            headerName={formatLabel("Thu", 3)}
          />
          <AgGridColumn
            {...timeColProps}
            field="friday"
            headerName={formatLabel("Fri", 4)}
          />
          <AgGridColumn
            {...timeColProps}
            field="saturday"
            headerName={formatLabel("Sat", 5)}
          />
          <AgGridColumn
            {...timeColProps}
            field="sunday"
            headerName={formatLabel("Sun", 6)}
          />
        </AgGridReact>
      </div>
    </>
  );
};

const TableInputControl: React.FunctionComponent<ITableControlProps> = (
  props: ITableControlProps
) => {
  // context
  const { validState }: { validState: typeof initialValidState } =
    React.useContext(Validation);
  // row number state
  const [addRowNum, setAddRowNum] = React.useState(1);
  const [rowsNum, setRowNum] = React.useState(0);
  const uploadRef: React.RefObject<HTMLInputElement> = React.createRef();
  // responsive query
  const medium = useMediaQuery({ maxWidth: 479 });

  // effect to set row numbers
  React.useEffect(() => {
    // get row number
    if (props.api !== null) {
      let _num = props.api.getDisplayedRowCount();

      setRowNum(_num);
    }
  }, []);

  const handleRowNum = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddRowNum(event.currentTarget.valueAsNumber);
    },
    []
  );

  const handleAddRowClick = (event: React.MouseEvent<any>) => {
    // prev default
    event.preventDefault();
    // rows array to add
    let rowArr = [];
    // push new obj into array
    for (let index = 0; index < addRowNum; index++) {
      rowArr.push(new Object());
    }
    // apply transaction
    try {
      // add rows
      props.api.applyTransaction({
        add: rowArr,
      });
      // validate data rows after adding
      props.validateDataEntries();
      // update rowsNum
      setRowNum((oldNum) => oldNum + addRowNum);
    } catch (error) {
      console.log(error);
    }
  };

  const removeRowClick = (event: React.MouseEvent<any>) => {
    // prev default
    event.preventDefault();
    // get selected nodes
    const selectedNodes = props.api.getSelectedNodes();
    // map data from nodes
    const selectedData = selectedNodes.map((node) => node.data);
    // apply transaction
    try {
      // remove selected nodes from form, validation handled by event handler
      props.api.applyTransaction({
        remove: selectedData,
      });
      // set selected arrays to empty list
      props.setRowSelected([]);
      // update rowsNum
      setRowNum((oldNum) => oldNum - selectedData.length);
    } catch (error) {
      console.log(error);
    }
  };

  // experimental, upload excel
  const handleFileUpload = () => {
    // get ref
    let fileElem: HTMLInputElement = uploadRef.current;
    // get file
    let xlDoc = fileElem.files[0];
    console.log(xlDoc);
    // mini validation
    let validTypes = [
      ".xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(xlDoc.type)) {
      // preferably notify user
      return;
    }
    // make a reader
    let reader = new FileReader();
    // set function on load of reader
    reader.onload = () => {
      var data = new Uint8Array(reader.result as ArrayBuffer);
      // xlsx read the data
      var workbook = XLSX.read(data, { type: "array" });

      console.log(workbook);
      // populate the form
      populateGridWithWorkbook(workbook);
    };
    // read the file
    reader.readAsArrayBuffer(xlDoc);
  };

  const populateGridWithWorkbook = (workbook: XLSX.WorkBook) => {
    // workbook name by sheet index
    let firstSheetName = workbook.SheetNames[0];
    // sheet by sheet name
    let worksheet = workbook.Sheets[firstSheetName];
    // columns
    let columns = {
      A: "Project",
      B: "Task",
      C: "Location",
      D: "Activity Desription",
      E: "monday",
      F: "tuesday",
      G: "wednesday",
      H: "thursday",
      I: "friday",
      J: "saturday",
      K: "sunday",
    };

    // row data
    let rowData = [];
    // start index at 2, first row headers
    let rowIndex = 2;
    // iterate over each row in sheet pulling out the columns we're expecting
    while (worksheet["A" + rowIndex]) {
      let row = {};
      Object.keys(columns).forEach((column) => {
        row[columns[column]] = worksheet[column + rowIndex].w;
      });
      // push into row data
      rowData.push(row);

      rowIndex++;
    }
    // set data
    props.api.setRowData(rowData);

    // validate data entries
    props.validateDataEntries();

    // calulate time
    props.calculateTotalTime();
  };
  // uppload click
  const handleUploadClick = () => {
    // get the actual input and click it
    uploadRef.current.click();
  };
  // testing, handle reset form
  const handleResetClick = () => {
    // simply set row data to empty obj
    props.api.setRowData([]);
    // set number of rows to 0
    setRowNum(0);
    // set selected arrays to empty list
    props.setRowSelected([]);
  };

  return (
    <>
      <Stack
        horizontal
        tokens={{ childrenGap: 7 }}
        wrap={true}
        horizontalAlign={medium ? "space-evenly" : "center"}
        verticalAlign={"center"}
      >
        <input
          type="number"
          onChange={handleRowNum}
          value={addRowNum}
          max={20}
          min={0}
          style={{ height: "auto" }}
        />
        <ResponsivePrimaryButton
          iconProps={{ iconName: "AddTo" }}
          title="Add Rows"
          ariaLabel="Add Rows"
          text="Add Rows"
          onClick={handleAddRowClick}
          disabled={rowsNum >= 15}
        />
        <ResponsivePrimaryButton
          iconProps={{ iconName: "SkypeCircleMinus" }}
          title="Remove Selected Rows"
          ariaLabel="Remove Selected Rows"
          text="Remove Selected Rows"
          onClick={removeRowClick}
          disabled={props.rowSelected.length === 0}
          styles={stylesDanger}
        />
        <ResponsivePrimaryButton
          title="Upload Excel"
          ariaLabel="Upload Excel"
          iconProps={{ iconName: "BulkUpload" }}
          text={"Upload Excel"}
          onClick={handleUploadClick}
        />
        <input
          type="file"
          name="testing"
          id="testxml"
          ref={uploadRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept={
            ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        />
        <ResponsivePrimaryButton
          text={"Reset Form"}
          onClick={handleResetClick}
          disabled={validState.msg === "Add a row"}
          styles={stylesDanger}
          iconProps={{ iconName: "Delete" }}
        />
      </Stack>
    </>
  );
};

const TableDateControl: React.FunctionComponent<ITableControlProps> = (
  props: ITableControlProps
) => {
  // date context
  const {
    date,
    setDate,
  }: {
    date: Date | null;
    setDate: React.Dispatch<React.SetStateAction<null | Date>>;
  } = React.useContext(DateContext);
  // state
  const [period, setPeriod] = React.useState({ week: "", year: "" });
  // props
  const _mainFormMode = props.formMode;

  // effect
  React.useEffect(() => {
    if (_mainFormMode === "new" || date === null) {
      let _date = new Date();
      // set new date
      setDate(_date);
    }
  }, [_mainFormMode]);

  // effect for period
  React.useEffect(() => {
    //get period
    let [_week, _year] = getWeekAndYear(date ? date : null);
    // set period
    setPeriod({
      week: _week,
      year: _year,
    });
  }, [date]);

  // handle date selected
  const handleDateSelected = (_date: Date | null | undefined) => {
    // do something
    setDate(_date);
  };

  // format label to show week
  const formatLabel = (_date: Date | null): string => {
    if (_date === null) {
      return "Select date";
    }
    // get week and year
    let [_week, _year] = getWeekAndYear(_date);
    return `Year: ${_year} Week: ${_week}`;
  };

  // date list hook
  /* let [_week, _year] = getWeekAndYear(date ? date : null); */

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 7, padding: 2 }}
      horizontalAlign={"center"}
    >
      {_mainFormMode === "new" && (
        <>
          <DatePicker
            value={date}
            initialPickerDate={date ? date : new Date()}
            label={formatLabel(date)}
            firstDayOfWeek={DayOfWeek.Monday}
            highlightSelectedMonth={true}
            showWeekNumbers={true}
            firstWeekOfYear={FirstWeekOfYear.FirstDay}
            showMonthPickerAsOverlay={true}
            placeholder="Select a date..."
            ariaLabel="Select a date"
            onSelectDate={handleDateSelected}
            minDate={new Date(2019, 11, 1)}
            maxDate={new Date()}
          />
        </>
      )}
      {_mainFormMode === "edit" && (
        <>
          {date && (
            <Label>
              Week {period.week} Year {period.year}
            </Label>
          )}
        </>
      )}
    </Stack>
  );
};

const TableSaveControl: React.FunctionComponent<ITableControlProps> = (
  props: ITableControlProps
) => {
  // date, validation and store context
  const { date: dateValue }: { date: Date } = React.useContext(DateContext);
  const { validState }: { validState: typeof initialValidState } =
    React.useContext(Validation);
  const { dispatchStore }: { dispatchStore: React.Dispatch<IAction> } =
    React.useContext(StoreData);
  // states
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState(false);
  // props
  const _mainFormMode = props.formMode;
  // variables
  let labelMsg = `${_mainFormMode === "new" ? "Creating" : "Updating"} Sheet`;
  let buttonMsg = `${_mainFormMode === "new" ? "Save" : "Update"} Sheet`;
  let notificationMsg = `Sheet ${
    _mainFormMode === "new" ? "Created" : "Updated"
  }`;

  // handle save clicked
  const handleSaveClick = () => {
    /* if (year === null || week === null) return; */
    if (dateValue === null) return;

    // butoon loading state
    setIsLoading(true);

    // prepare data
    /* let _week = Number(week.key);
    let _year = Number(year.text); */
    let [_week, _year] = getWeekAndYear(dateValue);
    let _weekData: IUserWeekData[] = [];

    // use grid api
    props.api.forEachNode((rowNode, _) => {
      // not decided if to remove empty node or to fill blank data, blank data for now
      _weekData.push({
        id: getRandomInt(8),
        Project: "",
        Location: "",
        Task: "",
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        ...rowNode.data,
      });
    });

    // data
    let _postData: IUserWeek = {
      week: Number(_week),
      year: Number(_year),
      data: _weekData,
      status: "draft",
    };

    // emulating a post request to a server  that returns successful instance
    let response = delay(3000, _postData);

    response.then((result) => {
      console.log(result);
      dispatchStore({
        type: "updateWeek",
        payload: { data: result },
      });

      // button state
      setIsLoading(false);
      setNotification(true);
    });
  };

  return (
    <StackItem align={"start"}>
      {isLoading && <ProgressIndicator label={labelMsg} />}
      {notification && (
        <NotificationBar
          barType={MessageBarType.success}
          show={notification}
          setShow={setNotification}
          msg={notificationMsg}
        />
      )}
      <Stack
        horizontal
        tokens={{ childrenGap: 9, padding: 3 }}
        verticalAlign={"center"}
      >
        <StackItem>
          <ResponsivePrimaryButton
            text={buttonMsg}
            onClick={handleSaveClick}
            disabled={!validState.formState || isLoading}
            iconProps={{ iconName: "Save" }}
          />
        </StackItem>
        {!validState.formState && (
          <StackItem>
            <Text
              style={{
                border: "1px solid #edbbbb",
                borderLeft: "none",
                borderRadius: "4px",
                padding: "3px",
              }}
              variant={"mediumPlus"}
            >
              {validState.msg}
            </Text>
          </StackItem>
        )}
      </Stack>
    </StackItem>
  );
};

const TableDraftControl: React.FunctionComponent<ITableDraftControlProps> = (
  props: ITableDraftControlProps
) => {
  // if draft avilable return button, else null
  // props to use
  let draftObj = { ...props.hasDraft };
  let formMode = props.formMode;
  // context to use
  const { setDate }: { setDate: React.Dispatch<React.SetStateAction<Date>> } =
    React.useContext(DateContext);

  const handleButtonClick = () => {
    // set date
    let _draft = draftObj.draft as IUserWeek;
    let _date = weekToDate(_draft.year, _draft.week);
    setDate(_date);
    // set table as edit
    props.setFormMode("edit");
    // set the row data
    props.api.setRowData(_draft.data);
    // run validation
    props.validateDataEntries();
  };

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 7, padding: 2 }}
      horizontalAlign={"center"}
    >
      {draftObj.state && formMode === "new" ? (
        <StackItem>
          <PrimaryButton text={"Draft Available"} onClick={handleButtonClick} />
        </StackItem>
      ) : null}
    </Stack>
  );
};

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

import * as React from 'react';
// UI
import { PrimaryButton, Stack, StackItem, DefaultButton, Label} from 'office-ui-fabric-react';
import {stylesDanger} from "../utils/utils";
// grid imports
import { 
  GridReadyEvent, GridApi,
  ColumnApi, AllCommunityModules, 
  RowSelectedEvent, CellValueChangedEvent,
  VirtualRowRemovedEvent,
} from "@ag-grid-community/all-modules";
import { AgGridReact, AgGridColumn} from "@ag-grid-community/react";
import { useMediaQuery } from 'react-responsive';
/* import "ag-grid-enterprise"; */
import "@ag-grid-community/client-side-row-model";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
// option tables
import {projectOptions, taskOptions,
   locationOptions
} from "./optionSelect";
// sampleData and types
import { IUserWeek, IUserWeekData  } from '../sampleData';
// time column editor
import TimeEditor, {timeValueFormatter} from './customCellEditor';
// hooks
import {useGetDatesHook} from "../utils/reactHooks";
// utils
import {valueToSeconds, objHasProperty} from "../utils/utils";
import { secondsToHours } from 'date-fns'
import NotificationBar from '../utils/NotificationBar';
import * as XLSX from "xlsx";

export interface IProps {
  dateObj?: Date;
  id?: string;
  setDataApi?: React.Dispatch<React.SetStateAction<GridApi|null>>;
  editData?: IUserWeek;
  timeHours: string;
  setTimeHours: React.Dispatch<React.SetStateAction<string>>
  tableState?: {};
  setTableState?:React.Dispatch<React.SetStateAction<{}>>
}

const TableForm: React.FunctionComponent<IProps> = (props: IProps)  => {

  // media queries
  const isTablet = useMediaQuery({ minWidth: 768 });
  const isMobile = useMediaQuery({ minWidth: 320, maxWidth: 767 });
  const smTab = useMediaQuery({ minWidth:768, maxWidth: 1023});
  const mdTab = useMediaQuery({ minWidth:1024, maxWidth: 1279});
  const lgTab = useMediaQuery({ minWidth:1280, maxWidth: 1365});
  const xlgTab = useMediaQuery({ minWidth:1366, maxWidth: 1440});

  // data to be used
  let tableData: IUserWeekData[] = props.editData ? props.editData.data : [];
  const [formData, setFormData] = React.useState<IUserWeekData[]|[]>(tableData);
  // exposing grid and column api
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState<null | ColumnApi>(null);
  // track row selection
  const [rowSelected, setRowSelected] = React.useState<number[]>([]);
  // date list hook
  const selectedDates = useGetDatesHook(props.dateObj);
  // just a list
  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // use effect for effects lol
  React.useEffect(() => {
    // if page is edit, calculate time. checking grid api to only run after table loads
    if (gridApi && formData) {
      calculateTotalTime();
    }
  },[gridApi])
  
  // check box 
  const checkboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
  };
  const headerCheckboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
  };
  // event handlers
  // handle processing when cell value changes
  const handleCellValueChanged = (event: CellValueChangedEvent) => {
    // get column of  change
    let column = event.column.getId();
    // calculate time if a weekday col
    if (weekDays.includes(column)) {
      calculateTotalTime();
    }

    validateDataEntries();
  };
  // handle rowselected state
  const handleselectionChange = (param: RowSelectedEvent) => {
    let row = param.rowIndex;
    // if ro in array, remove it, else add it
    if (rowSelected.includes(row)) {
      let newArr = rowSelected.filter((value) => value !== row)
      setRowSelected(newArr);

    } else {
      setRowSelected((value) => {
        return [...value, row]
      })
    }
  };
  // when a row is removed
  const handleRowRemoved = (event: VirtualRowRemovedEvent) => {
    // recalculate time, make this single line later
    calculateTotalTime();
    // check data
    validateDataEntries();
  };
  // exposes grid api on grid ready event
  const handleGridReady = (event:GridReadyEvent) => {
    setGridApi(event.api);
    props.setDataApi(event.api);
    setGridColumnApi(event.columnApi);
    // if not edit data disable until row added
    if (formData.length === 0) {
      props.setTableState((oldState) => {
        return {
          ...oldState,
          state: false,
          msg: "Add a row"
        }
      });
    } else {
      props.setTableState((oldState) => {
        return {
          ...oldState,
          state: true,
          msg: ""
        }
      });
    }
  };

  // utils
  // calculate  total time in time cells
  const calculateTotalTime = () => {

    // total
    let totalTimeInSec = 0;

    gridApi.forEachNode((rowNode, index) => {
      // get row data
      let rowdata = {...rowNode.data}

      Object.keys(rowdata).forEach(colName => {
        if (weekDays.includes(colName)) {
          let timeInSec = valueToSeconds(rowdata[colName]);
          totalTimeInSec += timeInSec;
        };
      });
    });

    props.setTimeHours(`${secondsToHours(totalTimeInSec)} Hours`);
  };
  // validate data in table
  const validateDataEntries = ():boolean => {
    const arrToValidate = ["Project", "Task"];
    let isValid = true;

    let rowsNumber = gridApi.getDisplayedRowCount();

    if (rowsNumber === 0 || rowsNumber === null) {
      props.setTableState((oldState) => {
        return {
          ...oldState,
          state: false,
          msg: "Add a row"
        }
      });

      return;
    };

    gridApi.forEachNode((rowNode, index) => {

      if (!isValid) return;
      // get row data
      let rowdata = {...rowNode.data};
      // row id
      let rowId = index;
      // check validity
      let [valid, response] = objHasProperty(arrToValidate, rowdata);

      if (!valid) {
        props.setTableState((oldState) => {
          return {
            ...oldState,
            state: false,
            msg: response + ` at row ${rowId + 1}`
          }
        });
        isValid = false;
        return isValid;

      } else {
        props.setTableState((oldState) => {
          return {
            ...oldState,
            state: true,
            msg: ""
          }
        });
        isValid = true;
        return isValid;
      }
    });

    return isValid;
  };

  // col props
  const timeColProps = {
    width: (smTab && 50) || (mdTab && 52) || (lgTab && 64) || (xlgTab && 90),
    resizable: true,
  };
  const highPriorityDetailProps = {
    minWidth: (smTab && 74) || (mdTab && 110) || (lgTab && 124) || (xlgTab && 134),
    resizable: true,
  };
  const lowPriorityDetailProps = {
    width: (smTab && 52) || (mdTab && 90) || (lgTab && 100) || (xlgTab && 110),
    resizable: true,
  };
  // format date column labels
  const formatLabel = (day: string, index: number):string => {
    // if date is null for some reason
    if (selectedDates === null) {
      return `${day} - `
    };

    return `${day}-${selectedDates[index].toLocaleDateString()}`
  };
  
  return (
    <Stack tokens={{ childrenGap: 7 }}>
      <div>
        {smTab && <div>small</div>}
        {mdTab && <div>medium</div>}
        {lgTab && <div>largeTablet</div>}
        {xlgTab && <div>xxlargeTablet</div>}
      </div>
      <Stack horizontal tokens={{ childrenGap: 9, padding: 4 }}>
        <TableControls
          api={gridApi}
          column={gridColumnApi}
          rowState={rowSelected}
          validateDataEntries={validateDataEntries}
        />
        <StackItem>
          <Label>
            Total Time Spent : {props.timeHours}
          </Label>          
        </StackItem>
      </Stack>
      <StackItem align="stretch">
        <div className="ag-theme-alpine" style={{height: 500, width: "100%"}}>
          <AgGridReact
            rowData={formData}
            rowSelection="multiple"
            modules={AllCommunityModules}
            enableRangeSelection={true}
            frameworkComponents={{
              "timeEditor" : TimeEditor
            }}
            onGridReady={handleGridReady}
            onRowSelected={handleselectionChange}
            onCellValueChanged={handleCellValueChanged}
            onVirtualRowRemoved={handleRowRemoved}
            >
            <AgGridColumn
              field="Project"
              cellEditor="agSelectCellEditor"
              cellEditorParams={{values: projectOptions}}
              editable={true}
              checkboxSelection={checkboxSelection}
              headerCheckboxSelection={headerCheckboxSelection}
              {...highPriorityDetailProps}
            />
            <AgGridColumn
              field="Location"
              cellEditor="agSelectCellEditor"
              cellEditorParams={{cellHeight: 200, values: locationOptions}}
              editable={true}
              {...lowPriorityDetailProps}
            />
            <AgGridColumn
              field="Task"
              cellEditor="agSelectCellEditor"
              cellEditorParams={{cellHeight: 200, values: taskOptions}}
              editable={true}
              {...lowPriorityDetailProps}
            />
            {/* <AgGridColumn editable {...detailColProps} field="FreshService"></AgGridColumn> */}
            <AgGridColumn editable {...highPriorityDetailProps} field="Activity Desription"></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="monday" headerName={formatLabel("Mon", 0)} valueFormatter={timeValueFormatter}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="tuesday" headerName={formatLabel("Tue", 1)} valueFormatter={timeValueFormatter}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="wednesday" headerName={formatLabel("Wed", 2)} valueFormatter={timeValueFormatter}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="thursday" headerName={formatLabel("Thu", 3)} valueFormatter={timeValueFormatter}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="friday" headerName={formatLabel("Fri", 4)} valueFormatter={timeValueFormatter}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="saturday" headerName={formatLabel("Sat", 5)} valueFormatter={timeValueFormatter}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="sunday" headerName={formatLabel("Sun", 6)} valueFormatter={timeValueFormatter}></AgGridColumn>
          </AgGridReact>
        </div>
      </StackItem>  
    </Stack>
  );
};

export interface ITableControlProps {
  api:GridApi | null;
  column:ColumnApi | null;
  rowState?: number[]
  validateDataEntries: Function
}

const TableControls: React.FunctionComponent<ITableControlProps> = (props:ITableControlProps) => {

  // row number state
  const [rowNum, setRowNum] = React.useState(1);
  const uploadRef: React.RefObject<HTMLInputElement> = React.createRef();

  const handleRowNum = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowNum(event.currentTarget.valueAsNumber);
    },
    [],
  );

  const handleAddRowClick = (event:React.MouseEvent<any>) => {
    // prev default
    event.preventDefault();
    // rows array to add
    let rowArr = []
    // push new obj into array
    for (let index = 0; index < rowNum; index++) {
      rowArr.push(new Object);
    };
    // aply transaction
    props.api.applyTransaction({
      add: rowArr
    });
    // validate data rows after adding
    props.validateDataEntries();
  };

  const removeRowClick = (event:React.MouseEvent<any>) => {
    // prev default
    event.preventDefault();
    // get selected nodes
    const selectedNodes = props.api.getSelectedNodes();
    // map data from node nodes
    const selectedData = selectedNodes.map( node => node.data );
    // apply transaction
    props.api.applyTransaction({
      remove:selectedData
    });
  };

  // experimental, upload excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // get ref
    let fileElem:HTMLInputElement = uploadRef.current;
    // get file
    let xlDoc = fileElem.files[0];
    console.log(xlDoc);
    // mini validation
    let validTypes = [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(xlDoc.type)) {
      // preferably notify user
      return;
    };
    // make a reader
    let reader = new FileReader();
    // set function on load of reader
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result as ArrayBuffer);
      // xlsx read the data
      var workbook = XLSX.read(data, {type: 'array'});
  
      console.log(workbook);
      // populate the form
      populateGridWithWorkbook(workbook);
    };
    // read the file
    reader.readAsArrayBuffer(xlDoc);
  };

  const populateGridWithWorkbook = (workbook:XLSX.WorkBook) => {

    // workbook name by sheet index
    let firstSheetName = workbook.SheetNames[0];
    // sheet by sheet name
    let worksheet = workbook.Sheets[firstSheetName];
    // columns
    let columns = {
      "A": "Project",
      "B": "Task",
      "C": "Location",
      "D": "Activity Desription",
      "E": "monday",
      "F": "tuesday",
      "G": "wednesday",
      "H": "thursday",
      "I": "friday",
      "J": "saturday",
      "K": "sunday",
    };

    // row data
    let rowData = [];
    // start index at 2, first row headers
    let rowIndex = 2;
    // iterate over each row in sheet pulling out the columns we're expecting
    while (worksheet['A' + rowIndex]) {
      let row = {};
      Object.keys(columns).forEach(function(column) {
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
  };

  return(
    <>
      <Stack horizontal tokens={{ childrenGap: 7 }} wrap={true} horizontalAlign={"start"}>
        <input
          type="number"
          onChange={handleRowNum}
          value={rowNum}
          max={20}
          min={0}
        />
        <PrimaryButton
          text="Add Rows"
          onClick={handleAddRowClick}
        />
        <PrimaryButton
          text="Remove Selected Rows"
          onClick={removeRowClick}
          disabled={(props.rowState.length === 0)}
          styles={stylesDanger}
        />
        <Stack verticalAlign={"center"}>
          <label htmlFor={"testxml"} style={{border: "1px solid blue"}}>Upload Excel</label>
          <input type="file" name="testing" id="testxml" ref={uploadRef} 
            onChange={handleFileUpload}
            style={{"display": "none"}}
            accept={".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
          />
        </Stack>
      </Stack>
    </>
  );
};



export default TableForm;
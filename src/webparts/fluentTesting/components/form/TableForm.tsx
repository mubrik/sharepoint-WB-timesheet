import * as React from 'react';
// UI
import { PrimaryButton, Stack, StackItem, DefaultButton} from 'office-ui-fabric-react';
import {stylesDanger} from "../utils/utils";
// grid imports
import { GridReadyEvent, GridApi, ColumnApi, AllCommunityModules, RowSelectedEvent} from "@ag-grid-community/all-modules";
import { AgGridReact, AgGridColumn} from "@ag-grid-community/react";
import { useMediaQuery } from 'react-responsive';
import "ag-grid-enterprise";
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
import TimeEditor from './customCellEditor';
// hooks
import {useGetDatesHook} from "../utils/reactHooks";

export interface IProps {
  dateObj?: Date;
  id?: string
  setDataApi?: React.Dispatch<React.SetStateAction<GridApi|null>>;
  editData?: IUserWeek
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

  // exposing grid and column api
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState<null | ColumnApi>(null);
  // track row selection
  const [rowSelected, setRowSelected] = React.useState<number[]>([]);
  // date list hook
  const selectedDates = useGetDatesHook(props.dateObj);
  // data
  const [formData, setFormData] = React.useState<IUserWeekData[]|[]>(tableData);

  // exposes grid api
  const handleGridReady = (event:GridReadyEvent) => {
    setGridApi(event.api);
    props.setDataApi(event.api);
    setGridColumnApi(event.columnApi);
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

  // col props
  const timeColProps = {
    width: (smTab && 50) || (mdTab && 52) || (lgTab && 64) || (xlgTab && 90),
    resizable: true,
  }
  const highPriorityDetailProps = {
    minWidth: (smTab && 74) || (mdTab && 110) || (lgTab && 124) || (xlgTab && 134),
    resizable: true,
  }
  const lowPriorityDetailProps = {
    width: (smTab && 52) || (mdTab && 90) || (lgTab && 100) || (xlgTab && 110),
    resizable: true,
  } 
  // format date column labels
  const formatLabel = (day: string, index: number):string => {
    // if date is null for some reason
    if (selectedDates === null) {
      return `${day} - `
    };

    return `${day}-${selectedDates[index].toLocaleDateString()}`
  };
  
  // context menu
  const getContextMenuItems = () => {
    return ["copy", "paste"]
  }

  // check box 
  const checkboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
  };
  const headerCheckboxSelection = function (params) {
    return params.columnApi.getRowGroupColumns().length === 0;
  };

  return (
    <Stack tokens={{ childrenGap: 7 }}>
      <div>
        {smTab && <div>small</div>}
        {mdTab && <div>medium</div>}
        {lgTab && <div>largeTablet</div>}
        {xlgTab && <div>xxlargeTablet</div>}
      </div>
      <StackItem align="start">
        <TableControls
          api={gridApi}
          column={gridColumnApi}
          rowState={rowSelected}
        />
      </StackItem>
      <StackItem align="stretch">
        <div className="ag-theme-alpine" style={{height: 500, width: "100%"}}>
          <AgGridReact
            rowData={formData}
            rowSelection="multiple"
            onGridReady={handleGridReady}
            getContextMenuItems={getContextMenuItems}
            modules={AllCommunityModules}
            enableRangeSelection={true}
            frameworkComponents={{
              "timeEditor" : TimeEditor
            }}
            onRowSelected={handleselectionChange}
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
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="monday" headerName={formatLabel("Mon", 0)}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="tuesday" headerName={formatLabel("Tue", 1)}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="wednesday" headerName={formatLabel("Wed", 2)}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="thursday" headerName={formatLabel("Thu", 3)}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="friday" headerName={formatLabel("Fri", 4)}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="saturday" headerName={formatLabel("Sat", 5)}></AgGridColumn>
            <AgGridColumn editable {...timeColProps} cellEditor={"timeEditor"} field="sunday" headerName={formatLabel("Sun", 6)}></AgGridColumn>
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
}

const TableControls: React.FunctionComponent<ITableControlProps> = (props:ITableControlProps) => {

  // row number state
  const [rowNum, setRowNum] = React.useState(0);

  const handleRowNum = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowNum(event.currentTarget.valueAsNumber);
    },
    [],
  );

  const handleAddRowClick = e => {
    e.preventDefault();
    let rowArr = []

    for (let index = 0; index < rowNum; index++) {
      rowArr.push(new Object);
    };

    props.api.applyTransaction({
      add: rowArr
    })
  };

  const removeRowClick = e => {
    e.preventDefault();
    const selectedNodes = props.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    console.log(selectedData)
    props.api.applyTransaction({
      remove:selectedData
    });
  };

  return(
    <>
      <Stack horizontal tokens={{ childrenGap: 7 }} wrap={true} horizontalAlign={"start"}>
        <input
          type="number"
          onChange={handleRowNum}
          max={20}
          min={0}
        />
        <PrimaryButton
          text="Add Rows"
          onClick={handleAddRowClick}
        />
        <DefaultButton
          text="Remove Selected Rows"
          onClick={removeRowClick}
          disabled={(props.rowState.length === 0)}
          styles={stylesDanger}
        />
      </Stack>
    </>
  );
}

export default TableForm;
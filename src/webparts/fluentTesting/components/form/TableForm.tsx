import * as React from 'react';
import { TextField, PrimaryButton, Stack } from 'office-ui-fabric-react';
import { GridReadyEvent, GridApi, ColumnApi, AllCommunityModules, RowSelectedEvent} from "@ag-grid-community/all-modules";
import { AgGridReact, AgGridColumn} from "@ag-grid-community/react";
import "ag-grid-enterprise";
import "@ag-grid-community/client-side-row-model";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
// option tables
import {projectOptions, taskOptions,
   locationOptions, rowData
} from "./optionSelect";
import TimeEditor, {numberParser} from './customCellEditor';
// types
import {ITableControlProps, INewFormProps} from "./INewFormProps"
// hooks
import {useGetDatesHook} from "./reactHooks";

const TableForm: React.FunctionComponent<INewFormProps> = (props: INewFormProps)  => {

  // exposing grid and column api
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState<null | ColumnApi>(null);
  // track row selection
  const [rowSelected, setRowSelected] = React.useState<number[]>([]);
  // date list hook
  const selectedDates = useGetDatesHook(props.dateObj);

  // exposes grid api
  const handleGridReady = (event:GridReadyEvent) => {
    setGridApi(event.api);
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
  const colProps = {
    width: 64,
    maxWidth: 120,
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
      <TableControls
        api={gridApi}
        column={gridColumnApi}
        rowState={rowSelected}
      />
    <div className="ag-theme-alpine" style={{height: 400, width: 1240}}>
      <AgGridReact
        rowData={rowData}
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
          cellEditorParams={{cellHeight: 200, values: projectOptions}}
          editable={true}
          checkboxSelection={checkboxSelection}
          headerCheckboxSelection={headerCheckboxSelection}
        />
        <AgGridColumn
          field="Location"
          cellEditor="agSelectCellEditor"
          cellEditorParams={{cellHeight: 200, values: locationOptions}}
          editable={true}
        />
        <AgGridColumn
          field="Task Type"
          cellEditor="agSelectCellEditor"
          cellEditorParams={{cellHeight: 200, values: taskOptions}}
          editable={true}
        />
        <AgGridColumn sortable={ true } editable field="FreshService"></AgGridColumn>
        <AgGridColumn sortable={ true } editable field="Activity Desription"></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="mon" headerName={formatLabel("mon", 0)}></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="tue" headerName={formatLabel("tue", 2)}></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="wed"></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="thu"></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="fri"></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="sat"></AgGridColumn>
        <AgGridColumn editable {...colProps} cellEditor={"timeEditor"} field="sun"></AgGridColumn>
      </AgGridReact>
    </div>
    </Stack>
  );
};

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

  const testingData = e => {
    e.preventDefault();
    props.api.forEachNode((rowNode, index) => {
      console.log(rowNode.data);
    })
  }



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
        <PrimaryButton
          text="Remove Selected Rows"
          onClick={removeRowClick}
          disabled={(props.rowState.length === 0)}
        />
        <PrimaryButton
          text="Test Data Access"
          onClick={testingData}
        />
      </Stack>
    </>
  );
}

export default TableForm;
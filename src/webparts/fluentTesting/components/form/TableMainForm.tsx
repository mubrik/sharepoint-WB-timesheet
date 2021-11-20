import * as React from "react";
// UI
import {
  Stack,
} from "office-ui-fabric-react";
// grid imports
import {
  AllCommunityModules,
} from "@ag-grid-community/all-modules";
import { AgGridReact, AgGridColumn } from "@ag-grid-community/react";
import { useMediaQuery } from "react-responsive";
import "@ag-grid-community/client-side-row-model";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
// option tables
import { projectOptions, taskOptions, locationOptions } from "./optionSelect";
// time column editor
import TimeEditor, { timeValueFormatter } from "./customCellEditor";
// validTypes
import {ITableMainForm} from "./tableTypes";


const TableMainForm = (
  {
    totalHoursInSec, formData,
    formMode, api,
    onGridReady
  }: ITableMainForm
): JSX.Element => {
  // media queries
  const small = useMediaQuery({ maxWidth: 320 });
  const medium = useMediaQuery({ minWidth: 320, maxWidth: 479 });
  const large = useMediaQuery({ minWidth: 480, maxWidth: 639 });
  const xlarge = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const xxlarge = useMediaQuery({ minWidth: 1024, maxWidth: 1365 });
  // const xxxlarge = useMediaQuery({ minWidth: 1366, maxWidth: 1920 });
  // props
  const _totalTimeInSec = totalHoursInSec;


  // format date column labels
  const formatLabel = (day: string, index: number): string => {
    // if date is null for some reason
    // if (selectedDates === null) {
    //   return `${day} - `;
    // }

    // return `${day}-${selectedDates[index].toLocaleDateString()}`;
    return day;
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
    field: "description",
    headerName: "Activity Desription",
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
        {/* {selectedDates && (
          <span>
            <strong>Period: </strong>
            {selectedDates[0].toDateString()} to{" "}
            {selectedDates[6].toDateString()}
          </span>
        )}
        <span>
          <strong>Time Spent: </strong>
          {`${secondsToHours(_totalTimeInSec)} Hours`}
        </span> */}
      </Stack>
      <div
        className={"ag-theme-balham"}
        style={{ minHeight: 400, height: "50vh", width: "100%" }}
      >
        <AgGridReact
          rowData={formData}
          rowSelection="multiple"
          modules={AllCommunityModules}
          enableRangeSelection={true}
          frameworkComponents={{
            timeEditor: TimeEditor,
          }}
          onGridReady={onGridReady}
        >
          <AgGridColumn
            {...choiceColProps}
            field="project"
            headerName="Project"
            cellEditorParams={{ values: projectOptions }}
            checkboxSelection={true}
            headerCheckboxSelection={true}
          />
          <AgGridColumn
            {...choiceColProps}
            field="location"
            headerName="Location"
            cellEditorParams={{ cellHeight: 200, values: locationOptions }}
          />
          <AgGridColumn
            {...choiceColProps}
            field="task"
            headerName="Task"
            cellEditorParams={{ cellHeight: 200, values: taskOptions }}
          />
          <AgGridColumn
            {...choiceColProps}
            cellEditor={"agTextCellEditor"}
            field="freshService"
            headerName= "FreshService ID"
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

export default TableMainForm;

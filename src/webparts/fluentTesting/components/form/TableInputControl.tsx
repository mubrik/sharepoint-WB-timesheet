import * as React from "react";
// context data
import {Validation} from "./TablePage";
// UI
import {
  Stack,
} from "office-ui-fabric-react";
// server
import fetchServer from "../../controller/server";
// styles
import { stylesDanger } from "../utils/utils";
import { useMediaQuery } from "react-responsive";
import ResponsivePrimaryButton from "../utils/ResponsiveButton";
import * as XLSX from "xlsx";
// validTypes
import {ITableInput, IFormValid} from "./tableTypes";

const TableInputControl: React.FunctionComponent<ITableInput> = (
  {
    formMode, api, rowSelected,
    validateDataEntries, setRowSelected,
    calculateTotalTime
  }: ITableInput
) => {
  // context
  const { validState }: { validState: IFormValid } =
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
    if (api !== null) {
      const _num = api.getDisplayedRowCount();

      setRowNum(_num);
    }
  }, []);

  const handleRowNum = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddRowNum(event.currentTarget.valueAsNumber);
    },
    []
  );

  const handleAddRowClick = (event: React.MouseEvent<any>): void => {
    // prev default
    event.preventDefault();
    // rows array to add
    const rowArr = [];
    // push new obj into array
    for (let index = 0; index < addRowNum; index++) {
      rowArr.push(new Object());
    }
    // apply transaction
    try {
      // add rows
      api.applyTransaction({
        add: rowArr,
      });
      // validate data rows after adding
      validateDataEntries();
      // update rowsNum
      setRowNum((oldNum) => oldNum + addRowNum);
    } catch (error) {
      console.log(error);
    }
  };

  const removeRowClick = (event: React.MouseEvent<any>): void => {
    // prev default
    event.preventDefault();
    // get selected nodes
    const selectedNodes = api.getSelectedNodes();
    // map data from nodes
    const selectedData = selectedNodes.map((node) => node.data);
    // if editing a draft
    if (formMode === "edit") {
      // delete on sharepoint as well
      fetchServer.deleteUserTasks(selectedData);
    }
    console.log(selectedData);
    // apply transaction
    try {
      // remove selected nodes from form, validation handled by event handler
      api.applyTransaction({
        remove: selectedData,
      });
      // set selected arrays to empty list
      setRowSelected([]);
      // update rowsNum
      setRowNum((oldNum) => oldNum - selectedData.length);
    } catch (error) {
      console.log(error);
    }
  };

  // experimental, upload excel
  const handleFileUpload = (): void => {
    // get ref
    const fileElem: HTMLInputElement = uploadRef.current;
    // get file
    const xlDoc = fileElem.files[0];
    // mini validation
    const validTypes = [
      ".xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(xlDoc.type)) {
      // preferably notify user
      return;
    }
    // make a reader
    const reader = new FileReader();
    // set function on load of reader
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      // xlsx read the data
      const workbook = XLSX.read(data, { type: "array" });

      console.log(workbook);
      // populate the form
      populateGridWithWorkbook(workbook);
    };
    // read the file
    reader.readAsArrayBuffer(xlDoc);
  };

  const populateGridWithWorkbook = (workbook: XLSX.WorkBook): void => {
    // workbook name by sheet index
    const firstSheetName = workbook.SheetNames[0];
    // sheet by sheet name
    const worksheet = workbook.Sheets[firstSheetName];
    // columns
    const columns = {
      A: "project",
      B: "task",
      C: "location",
      D: "freshService",
      E: "description",
      F: "monday",
      G: "tuesday",
      H: "wednesday",
      I: "thursday",
      J: "friday",
      K: "saturday",
      L: "sunday",
    };

    // row data
    const rowData = [];
    // start index at 2, first row headers
    let rowIndex = 2;
    // iterate over each row in sheet pulling out the columns we're expecting
    while (worksheet["A" + rowIndex]) {
      const row = {};
      Object.keys(columns).forEach((column) => {
        row[columns[column]] = worksheet[column + rowIndex].w;
      });
      // push into row data
      rowData.push(row);

      rowIndex++;
    }
    // set data
    api.setRowData(rowData);

    // validate data entries
    validateDataEntries(api);

    // calulate time
    calculateTotalTime(api);
  };
  // uppload click
  const handleUploadClick = (): void => {
    // get the actual input and click it
    uploadRef.current.click();
  };
  // testing, handle reset form
  const handleResetClick = (): void => {
    // simply set row data to empty obj
    api.setRowData([]);
    // set number of rows to 0
    setRowNum(0);
    // set selected arrays to empty list
    setRowSelected([]);
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
          disabled={rowSelected.length === 0}
          styles={stylesDanger}
        />
        {
          // upload disabled in edit mode
          formMode === "new" &&
          <>
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
          </>
        }
      </Stack>
    </>
  );
};

export default TableInputControl;

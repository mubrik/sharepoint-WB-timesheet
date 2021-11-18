import * as React from "react";
// context data
import { TableDataContext } from "../FluentTesting";
// UI
import {
  PrimaryButton,
  Stack,
  StackItem,
} from "office-ui-fabric-react";
// validTypes
import {ITableDraftControlProps} from "./tableTypes";

const TableDraftControl = (
  {
    formMode, hasDraft,
    setFormMode, validateDataEntries
  }: ITableDraftControlProps
): JSX.Element => {
  // if draft avilable return button, else null
  // props to use
  const draftObj = { ...hasDraft };
  // table data context
  const {
      tableData,
      setTableData,
    } = React.useContext(TableDataContext);
  // handlers
  const handleButtonClick = (): void => {
    // set date
    const _draft = draftObj.draft;
    // set table as edit
    setTableData(_draft);
    setFormMode("edit");
    // hook?
    // let tableD = useGetTableDataFromStore(_draft.itemIds);
    // context?
    // set the row data
    // props.api.setRowData(tableD);
    // run validation
    validateDataEntries();
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

export default TableDraftControl;

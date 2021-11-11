import * as React from "react";
// context data
import { DateContext, TableDataContext } from "../FluentTesting";

// UI
import {
  PrimaryButton,
  Stack,
  StackItem,
} from "office-ui-fabric-react";
// sampleData and types
import { IStoreYearWeekItem } from "../dataTypes";
// utils
import {
  weekToDate,
} from "../utils/utils";
import {useGetTableDataFromStore} from "../utils/reactHooks";
// validTypes
import {ITableDraft} from "./tableTypes";

const TableDraftControl: React.FunctionComponent<ITableDraft> = (
  props: ITableDraft
) => {
  // if draft avilable return button, else null
  // props to use
  let draftObj = { ...props.hasDraft };
  let formMode = props.formMode;
  // context to use
  const { setDate }: { setDate: React.Dispatch<React.SetStateAction<Date>> } =
    React.useContext(DateContext);
    // table data context
  const {
      tableData,
      setTableData,
    }: {
      tableData: number[] | [];
      setTableData: React.Dispatch<React.SetStateAction<number[] | []>>;
    } = React.useContext(TableDataContext);
  // handlers
  const handleButtonClick = () => {
    // set date
    let _draft = draftObj.draft as IStoreYearWeekItem;
    let _date = weekToDate(+_draft.year, +_draft.week);
    setDate(_date);
    // set table as edit
    setTableData(_draft.itemIds);
    props.setFormMode("edit");
    // hook?
    // let tableD = useGetTableDataFromStore(_draft.itemIds);
    // context?
    // set the row data
    // props.api.setRowData(tableD);
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

export default TableDraftControl;

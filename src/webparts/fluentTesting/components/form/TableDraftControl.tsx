import * as React from "react";
// context data
import { DateContext } from "../FluentTesting";

// UI
import {
  PrimaryButton,
  Stack,
  StackItem,
} from "office-ui-fabric-react";
// sampleData and types
import { IUserWeek } from "../dataTypes";
// utils
import {
  weekToDate,
} from "../utils/utils";
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
  // handlers
  const handleButtonClick = () => {
    // set date
    let _draft = draftObj.draft as IUserWeek;
    let _date = weekToDate(+_draft.year, +_draft.week);
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

export default TableDraftControl;

import * as React from "react";
// context data
import { TableDataContext, UserDataContext } from "../FluentTesting";
// UI
import {
  PrimaryButton,
  StackItem,
  Spinner, SpinnerSize,
  IconButton
} from "office-ui-fabric-react";
// server
import fetchServer from "../../controller/server";
import { ISpUserPeriodData } from "../../controller/serverTypes";

// types
import {ITableDraft} from "./tableTypes";
type IHasDraft = "true" | "false" | "loading";
type IDraftObj = ISpUserPeriodData;

const TableDraftControl = (
  {
    // props
    formMode, selectedWeek,
    selectedYear, setTablePageState,
    setFormMode,
  }: ITableDraft

): JSX.Element => {
  // if draft avilable return button, else check icon
  // table data context
  const { setTableData } = React.useContext(TableDataContext);
  const { id } = React.useContext(UserDataContext);
  // states
  const [hasDraft, setHasDraft] = React.useState<IHasDraft>("loading");
  const [draftPeriodObj, setDraftPeriodObj] = React.useState<IDraftObj>(null);

  // draft checker effect
  React.useEffect(() => {
    // checks if selected period has an available draft
    if (selectedYear === null || selectedWeek === null) return;
    setHasDraft("loading");
    // reference id
    const referenceId = `${selectedYear.key}${selectedWeek.key}${id}`;
    // ask server if it exists
    fetchServer.getUserPeriodByReference(referenceId)
      .then(result => {
        if (result.length > 0) {
          // item exist
          setHasDraft("true");
          setDraftPeriodObj(result[0]);
        } else {
          setHasDraft("false");
          setDraftPeriodObj(null);
        }
      })
      .catch(error => console.log(error));

  }, [selectedWeek, selectedYear]);

  // handlers
  const handleButtonClick = (): void => {

    // change table data context
    setTableData(draftPeriodObj);
    // set form mode
    setFormMode("edit");
    // reload page
    setTablePageState("idle");
  };

  return (
    <>
      {
        (formMode === "new" && selectedWeek) && 
        <>
          {
          hasDraft === "true" ? (
            <StackItem>
              <PrimaryButton text={"Draft Available"} onClick={handleButtonClick} />
            </StackItem>
          ) : 
          hasDraft === "loading" ? (
            <Spinner size={SpinnerSize.small}/>
          ) : (
            <IconButton iconProps={{iconName: "SkypeCheck"}}/>
          )
          }
        </>
      }
    </>
  );
};

export default TableDraftControl;

import * as React from "react";
// UI
import {
  Stack,
  StackItem,
  ProgressIndicator,
  MessageBarType,
  Text,
} from "office-ui-fabric-react";
// server
import fetchServer from "../../controller/server";
import {IServerReqObject, ISpUserTaskData } from "../../controller/serverTypes";
// context data
import {TableDataContext} from "../FluentTesting";
import {Validation} from "./TablePage";
// hooks
import {useGetUserData} from "../hooks";
import ResponsivePrimaryButton from "../utils/ResponsiveButton";
import useNotificationHook from "../notification/hook";
// validTypes
import {ITableSave, IFormValid} from "./tableTypes";
// error
import CustomError from "../error/errorTypes";

const TableSaveControl: React.FunctionComponent<ITableSave> = (
  {
    setTablePageState, formMode,
    api, selectedWeek, selectedYear
  }: ITableSave
) => {
  // date, validation and store context
  const { validState }: { validState: IFormValid } =
    React.useContext(Validation);
  const { tableData } = React.useContext(TableDataContext);
  // states
  const [isLoading, setIsLoading] = React.useState(false);
  // hooks
  const {email} = useGetUserData();
  const notify = useNotificationHook();
  // props
  const _mainFormMode = formMode;
  // variables
  const labelMsg = `${_mainFormMode === "new" ? "Creating" : "Updating"} Sheet`;
  const buttonMsg = `${_mainFormMode === "new" ? "Save" : "Update"} Sheet`;

  // handle save clicked
  const handleSaveClick = (): void => {

    // prepare data
    const _weekData: ISpUserTaskData[] = [];

    // use grid api
    api.forEachNode((rowNode, _) => {
      // not decided if to remove empty node or to fill blank data, blank data for now
      _weekData.push({
        project: "",
        location: "",
        task: "",
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
    // process save depending on formmode
    if (formMode === "new") {
      // return for now, throw error later
      if (selectedYear === null || selectedWeek === null) return;
  
      // data
      const _postData: IServerReqObject = {
        week: selectedWeek.text,
        year: selectedYear.text,
        data: _weekData,
        status: "draft",
      };
  
      console.log(_postData);
  
      // butoon loading state
      setIsLoading(true);
      // make request
      fetchServer.createDraft(email, _postData)
        .then(result => {
          if (result) {
            notify({isError: false, show: true, msg: "Draft created successfully"});
            setIsLoading(false);
          }
        })
        .catch(error => {
          // needed for typescript to catch type
          if (error instanceof CustomError) {
            // if custom error
            notify({isError: true, errorObj: error, msg: error.message, show: true});
          } else {
            // error i'm not throwing
            notify({isError: true, errorObj: error, msg: "Error occured", show: true});
          }
          setIsLoading(false);
        });

    } else if (formMode == "edit") {
      // butoon loading state
      setIsLoading(true);
      // make request
      fetchServer.updateDraft(tableData.referenceId, _weekData)
        .then(result => {
          if (result) {
            notify({isError: false, show: true, msg: "Draft updated successfully"});
            setIsLoading(false);
            // reload the page so new data fetch
            setTablePageState("idle");
          }
        })
        .catch(error => {
          // needed for typescript to catch type
          if (error instanceof CustomError) {
            // if custom error
            notify({isError: true, errorObj: error, msg: error.message, show: true});
          } else {
            // error i'm not throwing
            notify({isError: true, errorObj: error, msg: "Error occured", show: true});
          }
          setIsLoading(false);
        });
    }

  };

  return (
    <StackItem align={"start"}>
      {isLoading && <ProgressIndicator label={labelMsg} />}
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

export default TableSaveControl;

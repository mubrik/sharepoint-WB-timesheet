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
import NotificationBar from "../utils/NotificationBar";
import ResponsivePrimaryButton from "../utils/ResponsiveButton";
// validTypes
import {ITableSave, IFormValid} from "./tableTypes";

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
  const [notification, setNotification] = React.useState(false);
  // hooks
  const {email} = useGetUserData();
  // props
  const _mainFormMode = formMode;
  // variables
  const labelMsg = `${_mainFormMode === "new" ? "Creating" : "Updating"} Sheet`;
  const buttonMsg = `${_mainFormMode === "new" ? "Save" : "Update"} Sheet`;
  const notificationMsg = `Sheet ${
    _mainFormMode === "new" ? "Created" : "Updated"
  }`;

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
          setIsLoading(false);
          setNotification(true);
        })
        .catch(error => console.log(error));

    } else if (formMode == "edit") {
      console.log(_weekData);
      console.log(tableData.referenceId);
      // butoon loading state
      // setIsLoading(true);
      // make request
      fetchServer.updateDraft(tableData.referenceId, _weekData)
        .then(result => {
          setIsLoading(false);
          setNotification(true);
          // reload the page so new data fetch
          console.log("etting tab page");
          setTablePageState("idle");
        })
        .catch(error => console.log(error));
    }

  };

  return (
    <StackItem align={"start"}>
      {isLoading && <ProgressIndicator label={labelMsg} />}
      {notification && (
        <NotificationBar
          barType={MessageBarType.success}
          show={notification}
          setShow={setNotification}
          msg={notificationMsg}
        />
      )}
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

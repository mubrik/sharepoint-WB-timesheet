import * as React from "react";
// context data
import { DateContext, RequestContext } from "../FluentTesting";
import {Validation} from "./TablePage";
import { IAction, StoreData } from "../FluentTesting";
import { IServer } from "../../controller/server";
// UI
import {
  Stack,
  StackItem,
  ProgressIndicator,
  MessageBarType,
  Text,
} from "office-ui-fabric-react";
// sampleData and types
import { IUserWeek, IUserWeekData } from "../dataTypes";
// utils
import {
  getWeekAndYear,
  getRandomInt,
  delay
} from "../utils/utils";
import NotificationBar from "../utils/NotificationBar";
import ResponsivePrimaryButton from "../utils/ResponsiveButton";
// validTypes
import {ITableSave, IFormValid} from "./tableTypes";

const TableSaveControl: React.FunctionComponent<ITableSave> = (
  props: ITableSave
) => {
  // date, validation and store context
  const { date: dateValue }: { date: Date } = React.useContext(DateContext);
  const { validState }: { validState: IFormValid } =
    React.useContext(Validation);
  const { dispatchStore }: { dispatchStore: React.Dispatch<IAction> } =
    React.useContext(StoreData);
  const request:IServer = React.useContext(RequestContext);
  // states
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState(false);
  // props
  const _mainFormMode = props.formMode;
  // variables
  let labelMsg = `${_mainFormMode === "new" ? "Creating" : "Updating"} Sheet`;
  let buttonMsg = `${_mainFormMode === "new" ? "Save" : "Update"} Sheet`;
  let notificationMsg = `Sheet ${
    _mainFormMode === "new" ? "Created" : "Updated"
  }`;

  // handle save clicked
  const handleSaveClick = () => {
    /* if (year === null || week === null) return; */
    if (dateValue === null) return;

    // butoon loading state
    setIsLoading(true);

    // prepare data
    /* let _week = Number(week.key);
    let _year = Number(year.text); */
    let [_week, _year] = getWeekAndYear(dateValue);
    let _weekData: IUserWeekData[] = [];

    // use grid api
    props.api.forEachNode((rowNode, _) => {
      // not decided if to remove empty node or to fill blank data, blank data for now
      _weekData.push({
        id: getRandomInt(8),
        Project: "",
        Location: "",
        Task: "",
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

    // data
    let _postData: IUserWeek = {
      week: _week,
      year: _year,
      data: _weekData,
      status: "draft",
    };

    // emulating a post request to a server  that returns successful instance
    let response = delay(3000, _postData);
    // testing
    request.createDraft(_postData);

    response.then((result) => {
      console.log(result);
      dispatchStore({
        type: "updateWeek",
        payload: { data: result },
      });

      // button state
      setIsLoading(false);
      setNotification(true);
    });
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

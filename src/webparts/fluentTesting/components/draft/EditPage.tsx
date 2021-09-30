import * as React from 'react';
// react context
import {StoreData, IAction} from "../FluentTesting";
// ui
import { PrimaryButton, Stack, StackItem,
  Label, ProgressIndicator,
  MessageBarType,
} from 'office-ui-fabric-react';
import NotificationBar from '../utils/NotificationBar';
import TableForm from '../form/TableForm';
import {stylesDanger} from "../utils/utils";
// gridtable
import { GridApi} from "@ag-grid-community/all-modules";
//types
import { IUserWeek, IUserWeekData } from '../sampleData';
// utiliity
import {delay, weekToDate, objHasProperty} from "../utils/utils";
import {useGetDatesHook} from "../utils/reactHooks";

interface IProps {
  editData?: IUserWeek;
  setState?: React.Dispatch<React.SetStateAction<string>>;
}

const EditPage:React.FunctionComponent<IProps> = (props:IProps) => {
  // context data
  const {dispatchStore}:{dispatchStore:React.Dispatch<IAction>} = React.useContext(StoreData);
  // grid api/mobile data store to control saving data
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  // controlled states, lifted up from period input
  const [year, setYear] = React.useState<null | number>(null);
  const [week, setWeek] = React.useState<null | number>(null);
  const [selectedDays, setSelectedDays] = React.useState<null | Date[]>(null);
  // total time
  const [timeHours, setTimeHours] = React.useState<string>("0");
  // validation state
  const [validState, setValidState] = React.useState({state: false, msg: ""});
  const [tableState, setTableState] = React.useState({state: false, msg: ""});
  // button loading and feedback
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState(false);

  // use effect for prepping time data
  React.useEffect(() => {
    let _week = props.editData.week;
    let _year = props.editData.year;

    // prepare data
    setWeek(_week);
    setYear(_year);
    // get date
    let _newDate = weekToDate(_year, _week);
    // list of days
    setSelectedDays(useGetDatesHook(_newDate));

  },[]);

  // validation checker, will add more stuff to check as requested
  React.useEffect(() => {
    // if period not selected
    if (year === null || week === null) {
      setValidState((oldState) => {
        return {
          ...oldState,
          state: false,
          msg: "Select a Time period"
        }
      });

      return;
    }
    // if time over value
    if (Number(timeHours) > 72) {

      setValidState((oldState) => {
        return {
          state: false,
          msg: "Hours cant be over 72"
        }
      });

      return;
    }

    // form validation
    if (!tableState.state) {
      setValidState((oldState) => {
        return {
          state: false,
          msg: tableState.msg
        }
      });

      return;
    }

    // default
    setValidState((oldState) => {
      return {
        ...oldState,
        state: true,
        msg: ""
      }
    });
  }, [timeHours, tableState]);
  

  // handle save clicked
  const handleSaveClick = () => {
  
    // data valid
    if (year === null || week === null) return;

    // button loading state
    setIsLoading(true);

    let _weekData: IUserWeekData[] = [];

    // use grid api
    gridApi.forEachNode((rowNode, index) => {
      _weekData.push({
        ...rowNode.data
      });
    });

    // data
    let _postData: IUserWeek = {
      week: week,
      year: year,
      data: _weekData,
      status: "draft"
    };

    // emulating a post request to a server  that returns successful instance
    let response = delay(3000, _postData);

    response.then(result => {
      console.log(result);
      dispatchStore({
        type: "updateWeek",
        payload:{data: result}
      })
      // button and notification
      setIsLoading(false);
      setNotification(true);
    });
  };

  const handleBackClicked = () => {
    props.setState((oldValue) => {
      if (oldValue === "editDraft") {
        return "new"
      }
      return "list"
    })
  };

  return(
    <Stack tokens={{ childrenGap: 10, padding: 8 }}>
      <StackItem>
        <PrimaryButton text={"Back"} onClick={handleBackClicked} styles={stylesDanger}/>
        <Label>
          {selectedDays ? 
          `${selectedDays[0].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})} to 
          ${selectedDays[6].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})}` :
          "Select A Date"
          }
        </Label>
      </StackItem>
      <StackItem>
        <TableForm
          editData={props.editData}
          setDataApi={setGridApi}
          dateObj={weekToDate(year, week)}
          timeHours={timeHours}
          setTimeHours={setTimeHours}
          tableState={tableState}
          setTableState={setTableState}
        />
      </StackItem>
      <StackItem>
        {isLoading &&
          <ProgressIndicator label={"Updating Sheet"}/>
        }
        {notification && 
          <NotificationBar
            barType={MessageBarType.success}
            msg={"Sheet Updated Successfully"}
            show={notification}
          />
        }
        <PrimaryButton text={"Update Draft"} onClick={handleSaveClick} disabled={!validState.state || isLoading}/>
        <Label>
          {validState.msg}
        </Label>
      </StackItem>
    </Stack>
  )
};

export default EditPage;
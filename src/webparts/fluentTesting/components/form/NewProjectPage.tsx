import * as React from 'react';
// context, components
import {IAction, StoreData, IState, DateContext} from "../FluentTesting";
// UI
import {Label, Stack, StackItem,
  PrimaryButton, IDropdownOption,
  ProgressIndicator, MessageBar,
  MessageBarType,
  } from 'office-ui-fabric-react';
import { GridApi} from "@ag-grid-community/all-modules";
// forms
import TableForm from './TableForm';
import {DateInput} from './PeriodInput';
import EditPage from "../draft/EditPage";
import NotificationBar from '../utils/NotificationBar';
// types
import { IUserWeekData, IUserWeek} from "../sampleData";
// hooks
import {useGetDatesHook} from "../utils/reactHooks";
// utiliity
import {delay, getRandomInt, getWeekAndYear} from "../utils/utils";

//type
export interface IProps {
  dateObj?: Date;
  setDateApi?: React.Dispatch<React.SetStateAction<Date|null>>;
}

const NewProjectPage: React.FunctionComponent<IProps> = (props: IProps) => {
  // context data
  const {data:storeData, dispatchStore}:{data: IState, dispatchStore:React.Dispatch<IAction>} = React.useContext(StoreData);
  const {date: dateValue}: {date: Date} = React.useContext(DateContext);
  // page state
  const [pageState, setPageState] = React.useState<string>("new");
  const [editItem, setEditItem] = React.useState<IUserWeek|null>(null);
  // get week dates from selected date
  const selectedDates = useGetDatesHook(props.dateObj);
  // grid api/mobile data store to control saving data
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);
  // total time
  const [timeHours, setTimeHours] = React.useState<string>("0");
  // validation state
  const [validState, setValidState] = React.useState({state: false, msg: ""});
  const [tableState, setTableState] = React.useState({state: false, msg: ""});
  // button loading
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState(false);

  React.useEffect(() => {
    // logic to determine draft availabale, dumb logic for now
    // context version
    if (dateValue === null) return;
    // implemnt get date range and use last date for when week selected cuts different years
    let [_week, _year] = getWeekAndYear(dateValue);
    // null first
    setEditItem(null);

    // if condition matches, change
    if (_year in storeData.data) {
      if ( _week in storeData.data[_year]){
        // draft available
        setEditItem(storeData.data[_year][_week]);
      }
    }
    // period input
    /* if (year && week) {

      setEditItem(null);

      if (String(year.text) in storeData.data) {
        if ( String(week.key) in storeData.data[year.text]){
          // draft available
          setEditItem(storeData.data[year.text][String(week.key)]);
        }
      }
    }; */
  }, [/* year, week */dateValue])

  // validation checker, will add more stuff to check as requested
  React.useEffect(() => {
    // if period not selected
    /* if (year === null || week === null) {
      setValidState((oldState) => {
        return {
          ...oldState,
          state: false,
          msg: "Select a Time period"
        }
      });

      return;
    } */
    // if date not selected
    if (dateValue === null) {
      setValidState((oldState) => {
        return {
          ...oldState,
          state: false,
          msg: "Select a Date"
        }
      });

      return;
    }
    // if time over value
    if (Number(timeHours) > 72) {

      setValidState((oldState) => {
        return {
          ...oldState,
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
  }, [timeHours, /* year, week, */ tableState, dateValue]);

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
    let _weekData: IUserWeekData[] = []

    // use grid api
    gridApi.forEachNode((rowNode, index) => {
      // not decided if to remove empty node or to fill blank data, blank data for now
      _weekData.push({
        id: getRandomInt(8),
        Project: "",
        Location: "",
        Task:"",
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        ...rowNode.data
      });
    });

    // data
    let _postData: IUserWeek = {
      week: Number(_week),
      year: Number(_year),
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

      // button state
      setIsLoading(false);
      setNotification(true);
    });

  };

  const handleDraftClick = () => {
    // set page state
    setPageState("editDraft");
  };

  return(
    <>
    {pageState === "new" &&
      <>
      <Stack tokens={{ childrenGap: 10, padding: 8 }} horizontal verticalAlign={"center"}>
        <StackItem>
          <DateInput/>
          {/* <PeriodInput
            setDate={props.setDateApi}
            year={year}
            setYear={setYear}
            week={week}
            setWeek={setWeek}
          /> */}
        </StackItem>
        {
          editItem && 
          <StackItem align={"end"}>
            <PrimaryButton text={"Draft Available"} onClick={handleDraftClick}/>
          </StackItem>
        }
        <StackItem align={"end"}>
          <Label>
            {selectedDates ? 
            `${selectedDates[0].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})} to 
            ${selectedDates[6].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})}` :
            ""
            }
          </Label>
        </StackItem>
      </Stack>
      <Stack tokens={{ childrenGap: 7, padding: 5 }}>
        <StackItem align={"stretch"}>
          <TableForm
            dateObj={props.dateObj}
            setDataApi={setGridApi}
            timeHours={timeHours}
            setTimeHours={setTimeHours}
            tableState={tableState}
            setTableState={setTableState}
          />
        </StackItem>
        <StackItem align={"start"}>
          {isLoading &&
            <ProgressIndicator label={"Creating Sheet"}/>
          }
          {notification && 
            <NotificationBar
              barType={MessageBarType.success}
              show={notification}
              msg={"Sheet Updated Successfully"}
            />
          }
          <PrimaryButton text={"Save Sheet"} onClick={handleSaveClick} disabled={!validState.state || isLoading}/>
          <Label>
            {validState.msg}
          </Label>
        </StackItem>
      </Stack>
      </>
    }
    {
      pageState === "editDraft" &&
      <>
        <EditPage
          editData={editItem}
          setState={setPageState}
        />
      </>
    }
    </>
  );
};


export default NewProjectPage;
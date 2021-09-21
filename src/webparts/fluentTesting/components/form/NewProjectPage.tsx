import * as React from 'react';
// context
import {StoreDispatch, StoreData, IState} from "../FluentTesting";
// UI
import {Label, Stack, StackItem, PrimaryButton, IDropdownOption} from 'office-ui-fabric-react';
import { GridApi} from "@ag-grid-community/all-modules";
import { useMediaQuery } from 'react-responsive';
// forms
import TableForm from './TableForm';
import PeriodInput from './PeriodInput';
import EditPage from "../draft/EditPage";
// types
import { IUserWeekData, IUserWeek} from "../sampleData";
// hooks
import {useGetDatesHook} from "../utils/reactHooks";
// utiliity
import {delay, getRandomInt} from "../utils/utils";

//type
export interface IProps {
  dateObj?: Date;
  setDateApi?: React.Dispatch<React.SetStateAction<Date|null>>;
}

const NewProjectPage: React.FunctionComponent<IProps> = (props: IProps) => {

  // context data
  const dispatchStore = React.useContext(StoreDispatch);
  const storeData: IState = React.useContext(StoreData);
  // controlled states, lifted up from period input
  const [year, setYear] = React.useState<null | IDropdownOption>(null);
  const [week, setWeek] = React.useState<null | IDropdownOption>(null);
  // page state
  const [pageState, setPageState] = React.useState<string>("new");
  const [editItem, setEditItem] = React.useState<IUserWeek|null>(null);
  // get week dates from selected date
  const selectedDates = useGetDatesHook(props.dateObj);
  // grid api/mobile data store to control saving data
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);

  React.useEffect(() => {
    // logic to determine draft availabale, dumb logic for now
    if (year && week) {
      if (String(year.text) in storeData.data) {
        if ( String(week.key) in storeData.data[year.text]){
          // draft available
          setEditItem(storeData.data[year.text][String(week.key)]);
        }
      }
    };
  }, [year, week])

  // handle save clicked
  const handleSaveClick = () => {
    if (year === null || week === null) return;

    // prepare data
    let _week = Number(week.key);
    let _year = Number(year.text);
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
      week: _week,
      year: _year,
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
    })

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
          <PeriodInput
            setDate={props.setDateApi}
            year={year}
            setYear={setYear}
            week={week}
            setWeek={setWeek}
          />
        </StackItem>
        <StackItem align={"end"}>
          <Label>
            {selectedDates ? 
            `${selectedDates[0].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})} to 
            ${selectedDates[6].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})}` :
            "Select A Date"
            }
          </Label>
        </StackItem>
        <StackItem align={"end"}>
          {editItem && 
            <PrimaryButton text={"Draft Available"} onClick={handleDraftClick}/>
          }
        </StackItem>
      </Stack>
      <Stack tokens={{ childrenGap: 7, padding: 5 }}>
        <StackItem align={"stretch"}>
          <TableForm
            dateObj={props.dateObj}
            setDataApi={setGridApi}
          />
        </StackItem>
        <StackItem align={"start"}>
          <PrimaryButton text={"Save Sheet"} onClick={handleSaveClick} disabled={(year === null || week === null)}/>
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
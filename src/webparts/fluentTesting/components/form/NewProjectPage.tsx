import * as React from 'react';
// context
import {StoreDispatch} from "../FluentTesting";
// UI
import {Label, Stack, StackItem, PrimaryButton, IDropdownOption} from 'office-ui-fabric-react';
import { GridApi} from "@ag-grid-community/all-modules";
import { useMediaQuery } from 'react-responsive';
// forms
import MobileFormPage from './MobileForm';
import TableForm from './TableForm';
import PeriodInput from './PeriodInput';
// types
import {IMainDataProps, IUserWeekData, IUserWeek} from "../sampleData";
// hooks
import {useGetDatesHook} from "./reactHooks";

//type
export interface IProps {
  dateObj?: Date;
  setDateApi?: React.Dispatch<React.SetStateAction<Date|null>>;
  userData?: IMainDataProps;
}
// mini id geerator
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
};
// delay function, returns promise
function delay(t:number, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
}

const NewProjectPage: React.FunctionComponent<IProps> = (props: IProps) => {


  // store dispatch
  const dispatchStore = React.useContext(StoreDispatch);
  // controlled states, lifted up from period
  const [year, setYear] = React.useState<null | IDropdownOption>(null);
  const [week, setWeek] = React.useState<null | IDropdownOption>(null);
  // get week dates from selected date
  const selectedDates = useGetDatesHook(props.dateObj);
  // grid api/mobile data store to control saving data
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);

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

  }

  return(
    <>
    <Stack tokens={{ childrenGap: 7, padding: 5 }} horizontal>
      <StackItem align={"start"}>
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
  );
};


export default NewProjectPage;
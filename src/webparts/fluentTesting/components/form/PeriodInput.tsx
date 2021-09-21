import * as React from 'react';
// context
import {StoreDispatch, StoreData, IState} from "../FluentTesting";
// UI
import {
  Dropdown, IDropdownOption,
  Stack, PrimaryButton,
  StackItem, DatePicker
} from 'office-ui-fabric-react';
// utils
import {weekToDate} from "../utils/utils";

// types
export interface IProps {
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  year: null|IDropdownOption
  week: null|IDropdownOption
  setYear: React.Dispatch<React.SetStateAction<null|IDropdownOption>>
  setWeek: React.Dispatch<React.SetStateAction<null|IDropdownOption>>
}

const PeriodInput: React.FunctionComponent<IProps> = (props:IProps) => {

  // context
  const storeData: IState = React.useContext(StoreData);
  const storeDispatch = React.useContext(StoreDispatch);

  // handle item selected
  const handleYearChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
    props.setYear(item);
  };

  const handleWeekChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
    props.setWeek(item);
  };

  const handleDateSelected = () => {
    // if null dont run
    if (props.year === null || props.week === null) {
      return
    };
    // get the vales to work with
    let selectedYear = parseInt(props.year.text); 
    let selectedWeek = props.week.key;
    // get date
    let date = weekToDate(selectedYear, Number(selectedWeek));
    props.setDate(date);
  };

  // data
  const controlledYear = [
    {key: "2020", text: "2020"},
    {key: "2021", text: "2021"},
    {key: "2022", text: "2022"},
  ]

  // usnig a function to be able to exclude ater on
  const genWeekNumbers = ():IDropdownOption[] => {

    // empty arr
    let weekList = [];

    for (let index = 0; index < 53; index++) {
      let weekNum = `Week ${index+1}`
      weekList.push({
        key: index + 1, text: weekNum
      });
    };

    return weekList;

  };

  return(
    <Stack horizontal tokens={{ childrenGap: 7 }} verticalAlign={"baseline"} horizontalAlign={"baseline"}>
      <Dropdown
        selectedKey={props.year ? props.year.key : undefined}
        label="Select a Year"
        options={controlledYear}
        onChange={handleYearChange}
      />
      <Dropdown
        selectedKey={props.week ? props.week.key : undefined}
        label="Select Week Period"
        options={genWeekNumbers()}
        onChange={handleWeekChange}
      />
      <StackItem align={"end"}>
        <PrimaryButton
          text={"select"}
          onClick={handleDateSelected}
          disabled={(props.year === null || props.week === null)}
        />
      </StackItem>
    </Stack>
  );
};

/* const DateInput: React.FunctionComponent<IDateInputProps> = (props:IDateInputProps) => {


  // handle date selected
  const handleDateSelected = (date: Date | null | undefined) => {
    // do something
    props.setDate(date);
  };

  // format label to show week
  const formatLabel = (date:Date | null): string => {
    if (date === null) {
      return "Select date";
    };

    let weekstring = String(getWeek(date));
    return weekstring;
  };

  return(
    <div>
      <DatePicker
        value={props.dateObj ? props.dateObj : new Date()}
        initialPickerDate={props.dateObj}
        label={`Week: ${formatLabel(props.dateObj)}`}
        highlightSelectedMonth={true}
        showWeekNumbers={true}
        firstWeekOfYear={1}
        showMonthPickerAsOverlay={true}
        placeholder="Select a date..."
        ariaLabel="Select a date"
        onSelectDate={handleDateSelected}
      />
    </div>
  );
}; */


export default PeriodInput;
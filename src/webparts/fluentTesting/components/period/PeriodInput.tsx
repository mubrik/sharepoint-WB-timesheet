import * as React from 'react';
import {IDateInputProps} from "./IPeriodProps";
import {
  Dropdown, IDropdownOption,
  Stack, PrimaryButton,
  StackItem, DatePicker
} from 'office-ui-fabric-react';

/**
* get date by week number
* @param  {Number} year 
* @param  {Number} week 
* @param  {Number} day of week (optional; default = 0 (Sunday)) 
* @return {Date}      
*/

function weekToDate(year: number, week: number, weekDay = 1): Date {

  const getZeroBasedIsoWeekDay = date => (date.getDay() + 6) % 7;
  const getIsoWeekDay = date => getZeroBasedIsoWeekDay(date) + 1;
  const zeroBasedWeek = week - 1;
  const zeroBasedWeekDay = weekDay - 1;
  let days = (zeroBasedWeek * 7) + zeroBasedWeekDay;
      // Dates start at 2017-01-01 and not 2017-01-00
      days += 1;

  const firstDayOfYear = new Date(year, 0, 1);
  const firstIsoWeekDay = getIsoWeekDay(firstDayOfYear);
  const zeroBasedFirstIsoWeekDay = getZeroBasedIsoWeekDay(firstDayOfYear);

  // If year begins with W52 or W53
  if (firstIsoWeekDay > 4) {
    days += 8 - firstIsoWeekDay; 
  // Else begins with W01
  } else {
    days -= zeroBasedFirstIsoWeekDay;
  }
  
  return new Date(year, 0, days);
};

const PeriodInput: React.FunctionComponent<IDateInputProps> = (props:IDateInputProps) => {

  // controlled states
  const [year, setYear] = React.useState<null | IDropdownOption>(null);
  const [week, setWeek] = React.useState<null | IDropdownOption>(null);


  // handle item selected
  const handleYearChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
    setYear(item);
  };

  const handleWeekChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
    setWeek(item);
  };

  const handleDateSelected = () => {
    // if null dont run
    if (year === null || week === null) {
      return
    };
    // get the vales to work with
    let selectedYear = parseInt(year.text); 
    let selectedWeek = week.key;
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
        selectedKey={year ? year.key : undefined}
        label="Select a Year"
        options={controlledYear}
        onChange={handleYearChange}
      />
      <Dropdown
        selectedKey={week ? week.key : undefined}
        label="Select Week Period"
        options={genWeekNumbers()}
        onChange={handleWeekChange}
      />
      <StackItem align={"end"}>
        <PrimaryButton
          text={"select"}
          onClick={handleDateSelected}
          disabled={(year === null || week === null)}
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
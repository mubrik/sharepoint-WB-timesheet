import * as React from 'react';
// UI
import {
  Dropdown, IDropdownOption,
  Stack, PrimaryButton,
  StackItem, DatePicker,
  DayOfWeek, FirstWeekOfYear
} from 'office-ui-fabric-react';
// components
import {DateContext} from "../FluentTesting";
// utils
import {weekToDate, getWeekAndYear} from "../utils/utils";
import {useGetDatesHook} from "../utils/reactHooks";

// types
export interface IProps {
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  year: null|IDropdownOption
  week: null|IDropdownOption
  setYear: React.Dispatch<React.SetStateAction<null|IDropdownOption>>
  setWeek: React.Dispatch<React.SetStateAction<null|IDropdownOption>>
}

const PeriodInput: React.FunctionComponent<IProps> = (props:IProps) => {

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
        label="Select a Period"
        options={genWeekNumbers()}
        onChange={handleWeekChange}
      />
      <StackItem align={"end"}>
        <PrimaryButton
          text={"Select"}
          onClick={handleDateSelected}
          disabled={(props.year === null || props.week === null)}
        />
      </StackItem>
    </Stack>
  );
};

const DateInput: React.FunctionComponent = () => {

  // react context
  const {date, setDate}: {date: Date|null, setDate:React.Dispatch<React.SetStateAction<null|Date>> } = React.useContext(DateContext);

  // effect
  React.useEffect(() => {
    if (!date) {
      setDate(new Date());
    };
  }, []);

  // handle date selected
  const handleDateSelected = (date: Date | null | undefined) => {
    // do something
    setDate(date);
  };

  // format label to show week
  const formatLabel = (date:Date | null): string => {
    if (date === null) {
      return "Select date";
    };
    // get week and year
    let [_week, _year] = getWeekAndYear(date);
    // get dates in week
    let datesInWeek = useGetDatesHook(date);

    let firstDay = datesInWeek[0];
    let lastDay = datesInWeek[6];

    return `Year: ${_year} Week: ${_week}`
  };

  return(
    <StackItem>
      <DatePicker
        value={date}
        initialPickerDate={date ? date : new Date()}
        label={formatLabel(date)}
        firstDayOfWeek={DayOfWeek.Monday}
        highlightSelectedMonth={true}
        showWeekNumbers={true}
        firstWeekOfYear={FirstWeekOfYear.FirstDay}
        showMonthPickerAsOverlay={true}
        placeholder="Select a date..."
        ariaLabel="Select a date"
        onSelectDate={handleDateSelected}
        minDate={new Date(2019, 11, 1)}
        maxDate={new Date(2021, 12, 31)}
      />
    </StackItem>
  );
};


export default PeriodInput;
export {DateInput};
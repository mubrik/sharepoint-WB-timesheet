import * as React from "react";
// UI
import {
  Stack, IDropdownOption,
  Label, Dropdown,
  DatePicker,
  DayOfWeek,
  FirstWeekOfYear,
} from "office-ui-fabric-react";
// utils
import {
  getWeekAndYear,
} from "../utils/utils";
// validTypes
import {ITableDate} from "./tableTypes";
import getISOWeeksInYear from "date-fns/getISOWeeksInYear";
import { getWeek } from "date-fns";

const TablePeriodControl = (
  
  {
    formMode, selectedWeek, selectedYear,
    setSelectedWeek,setSelectedYear
  }: ITableDate

  ): JSX.Element => 

  {

  const [yearOptions, setYearOptions] = React.useState<IDropdownOption[]>(null);
  const [weekOptions, setWeekOptions] = React.useState(null);

  // effect for setting year
  React.useEffect(() => {

    if (formMode === "new") {
      // get curr year
      const currDate = new Date();
      const currYear = currDate.getFullYear();
      const prevYear = currDate.getFullYear() - 1;
      // mutate obj
      const _yearOptions: IDropdownOption[] = [
        {key: prevYear, text: `${prevYear}`},
        {key: currYear, text: `${currYear}`},
      ];
      // set
      setYearOptions(_yearOptions);
    }

  }, []);

  // effect for number of weeks
  React.useEffect(() => {
    // only if yar != null
    if (selectedYear) {
      // week arr
      const _weekOptions: IDropdownOption[] = [];
      let numberOfWeeks = 0;
      const _selectedYear = selectedYear.key;

      numberOfWeeks = getISOWeeksInYear(_selectedYear as number);

      if (_selectedYear === new Date().getFullYear()) {
        numberOfWeeks = getWeek(new Date(), {weekStartsOn: 1});
      }

      // loop
      for (let i = 1; i < numberOfWeeks; i++) {
        _weekOptions.push({
          key: i,
          text: `${i}`
        });
      }

      setWeekOptions(_weekOptions);
    }
  }, [selectedYear]);

  // handlers
  const handleYearSelect = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    setSelectedYear(item);
  };

  return(
    <Stack horizontal tokens={{childrenGap: 7}}>
      {
        yearOptions &&
        <Dropdown
          label="Select Year"
          selectedKey={selectedYear ? selectedYear.key : undefined}
          onChange={handleYearSelect}
          placeholder="Select a Year"
          options={yearOptions}
          disabled={!yearOptions}
        />
      }
      {
        weekOptions &&
        <Dropdown
          label="Select Week"
          selectedKey={selectedWeek ? selectedWeek.key : undefined}
          onChange={(_, item) => setSelectedWeek(item)}
          placeholder="Select a Week"
          options={weekOptions}
          disabled={!selectedYear}
        />
      }
    </Stack>
  );
};

// const TableDateControl: React.FunctionComponent<ITableDate> = (
//   props: ITableDate
// ) => {
//   // date context
//   const {
//     date,
//     setDate,
//   }: {
//     date: Date | null;
//     setDate: React.Dispatch<React.SetStateAction<null | Date>>;
//   } = React.useContext(DateContext);
//   // state
//   const [period, setPeriod] = React.useState({ week: "", year: "" });
//   // props
//   const _mainFormMode = props.formMode;

//   // effect
//   React.useEffect(() => {
//     if (_mainFormMode === "new" || date === null) {
//       let _date = new Date();
//       // set new date
//       setDate(_date);
//     }
//   }, [_mainFormMode]);

//   // effect for period
//   React.useEffect(() => {
//     //get period
//     let [_week, _year] = getWeekAndYear(date ? date : null);
//     // set period
//     setPeriod({
//       week: _week,
//       year: _year,
//     });
//   }, [date]);

//   // handle date selected
//   const handleDateSelected = (_date: Date | null | undefined) => {
//     // do something
//     setDate(_date);
//   };

//   // format label to show week
//   const formatLabel = (_date: Date | null): string => {
//     if (_date === null) {
//       return "Select date";
//     }
//     // get week and year
//     let [_week, _year] = getWeekAndYear(_date);
//     return `Year: ${_year} Week: ${_week}`;
//   };

//   // date list hook
//   /* let [_week, _year] = getWeekAndYear(date ? date : null); */

//   return (
//     <Stack
//       horizontal
//       tokens={{ childrenGap: 7, padding: 2 }}
//       horizontalAlign={"center"}
//     >
//       {_mainFormMode === "new" && (
//         <>
//           <DatePicker
//             value={date}
//             initialPickerDate={date ? date : new Date()}
//             label={formatLabel(date)}
//             firstDayOfWeek={DayOfWeek.Monday}
//             highlightSelectedMonth={true}
//             showWeekNumbers={true}
//             firstWeekOfYear={FirstWeekOfYear.FirstDay}
//             showMonthPickerAsOverlay={true}
//             placeholder="Select a date..."
//             ariaLabel="Select a date"
//             onSelectDate={handleDateSelected}
//             minDate={new Date(2019, 11, 1)}
//             maxDate={new Date()}
//           />
//         </>
//       )}
//       {_mainFormMode === "edit" && (
//         <>
//           {date && (
//             <Label>
//               Week {period.week} Year {period.year}
//             </Label>
//           )}
//         </>
//       )}
//     </Stack>
//   );
// };

export default TablePeriodControl;

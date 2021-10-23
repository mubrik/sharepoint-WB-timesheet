import * as React from "react";
// context data
import { DateContext } from "../FluentTesting";
// UI
import {
  Stack,
  Label,
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

const TableDateControl: React.FunctionComponent<ITableDate> = (
  props: ITableDate
) => {
  // date context
  const {
    date,
    setDate,
  }: {
    date: Date | null;
    setDate: React.Dispatch<React.SetStateAction<null | Date>>;
  } = React.useContext(DateContext);
  // state
  const [period, setPeriod] = React.useState({ week: "", year: "" });
  // props
  const _mainFormMode = props.formMode;

  // effect
  React.useEffect(() => {
    if (_mainFormMode === "new" || date === null) {
      let _date = new Date();
      // set new date
      setDate(_date);
    }
  }, [_mainFormMode]);

  // effect for period
  React.useEffect(() => {
    //get period
    let [_week, _year] = getWeekAndYear(date ? date : null);
    // set period
    setPeriod({
      week: _week,
      year: _year,
    });
  }, [date]);

  // handle date selected
  const handleDateSelected = (_date: Date | null | undefined) => {
    // do something
    setDate(_date);
  };

  // format label to show week
  const formatLabel = (_date: Date | null): string => {
    if (_date === null) {
      return "Select date";
    }
    // get week and year
    let [_week, _year] = getWeekAndYear(_date);
    return `Year: ${_year} Week: ${_week}`;
  };

  // date list hook
  /* let [_week, _year] = getWeekAndYear(date ? date : null); */

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 7, padding: 2 }}
      horizontalAlign={"center"}
    >
      {_mainFormMode === "new" && (
        <>
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
            maxDate={new Date()}
          />
        </>
      )}
      {_mainFormMode === "edit" && (
        <>
          {date && (
            <Label>
              Week {period.week} Year {period.year}
            </Label>
          )}
        </>
      )}
    </Stack>
  );
};

export default TableDateControl;

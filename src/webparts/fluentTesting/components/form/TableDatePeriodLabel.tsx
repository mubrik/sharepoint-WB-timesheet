import * as React from "react";
// context
import { TableDataContext } from "../FluentTesting";
// UI
import { Stack } from "office-ui-fabric-react";
import { IBaseTableProps } from "./tableTypes";
// utils
import { weekToDate } from "../utils/utils";
import { useGetDatesHook } from "../utils/reactHooks";


const TableDatePeriodLabel = ({formMode}: IBaseTableProps): JSX.Element => {

  // context
  const { tableData } = React.useContext(TableDataContext);
  // state
  const [date, setDate] = React.useState<Date>(null);
  // hook
  const selectedDates = useGetDatesHook(date);
  // effect for getting date
  React.useEffect(() => {

    if (tableData) {
      const _date = weekToDate(tableData.year, tableData.week);
      setDate(_date);
    }

  }, []);

  return(
    <>
      {
        (formMode === "edit" && selectedDates ) &&
        <Stack>
          <span>
          {selectedDates[0].toDateString()} to {selectedDates[6].toDateString()}
          </span>
        </Stack>
      }
    </>
  );
};

export default TableDatePeriodLabel;
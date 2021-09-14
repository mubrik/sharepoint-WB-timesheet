import * as React from 'react';
import { eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'


const useGetDatesHook = (dateObj: Date | null): Date[] | null => {
  // date state
  const [date, setDate] = React.useState(dateObj);

  if (date === null) {
    return null
  };
  // get start and end date
  let startWeek = startOfWeek(date, {weekStartsOn: 1});
  let endWeek = endOfWeek(date, {weekStartsOn: 1});

  // get array of dates
  let dateArray = eachDayOfInterval({
    start:startWeek,
    end: endWeek
  });

  return dateArray;

};

export {useGetDatesHook};
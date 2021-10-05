import * as React from 'react';
import { eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';


const useGetDatesHook = (dateObj: Date | null): Date[] | null => {

  if (dateObj === null) {
    return null;
  };

  // get start and end date
  let startWeek = startOfWeek(dateObj, { weekStartsOn: 1 });
  let endWeek = endOfWeek(dateObj, { weekStartsOn: 1 });

  // get array of dates
  let dateArray = eachDayOfInterval({
    start: startWeek,
    end: endWeek
  });

  return dateArray;

};

export { useGetDatesHook };
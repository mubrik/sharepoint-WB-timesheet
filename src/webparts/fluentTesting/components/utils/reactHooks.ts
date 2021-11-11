import * as React from 'react';
import { eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { StoreData } from "../FluentTesting";
import {ISPJsFullItemsObj, IStoreState} from "../dataTypes";


const useGetDatesHook = (dateObj: Date | null): Date[] | null => {

  if (dateObj === null) {
    return null;
  }

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

const useGetTableDataFromStore = (param: number[]): ISPJsFullItemsObj[] | [] => {

  // react context
  const { data: storeData }: { data: IStoreState } = React.useContext(StoreData);
  // var
  let arrToReturn: ISPJsFullItemsObj[]  = [];
  console.log(param);

  if (param === undefined || param.length === 0) {
    return arrToReturn;
  }
  // avoid mutate
  let propArray = param.slice();
  // loop
  propArray.forEach(itemProp => {
    arrToReturn.push(storeData.data.items[itemProp]);
  });

  return arrToReturn;

};

export { useGetDatesHook, useGetTableDataFromStore };

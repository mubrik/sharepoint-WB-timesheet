import { getWeek, getYear } from 'date-fns';
import { IStoreMainData, IStoreYearWeekItem } from '../dataTypes';
import { ISPFullItemsObj, IServerReqObject } from '../../controller/serverTypes';

export const stylesDanger = {
  root: [
    {
      background: "#b70e0e",
      border: "0px solid black",
      selectors: {
        ':hover': {
          background: "#b70e0e",
          border: "0px solid black",
        },
        ':disabled': {
          background: "#f3f2f1",
          color: "#a19f9d",
          border: "0px solid black"
        },
      }
    }
  ],
  rootHovered: [
    {
      background: "#b70e0e",
      border: "0px solid black",
    }
  ]
};

// mini id geerator
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}
// delay function, returns promise
function delay(t: number, v: IServerReqObject): Promise<IServerReqObject> {
  return new Promise((resolve) => {
    setTimeout(resolve.bind(null, v), t);
  });
}

/**
* get date by week number
* @param  {Number} year
* @param  {Number} week
* @param  {Number} firstDayofWeek of week (optional; default = 1 (Monday))
* @return {Date}
*/
function weekToDate(year: number, week: number, firstDayofWeek: number = 1): Date {
  // get the first day of the year by multiplying 7 by week -1
  let date = new Date(year, 0, (1 + (week - 1) * 7)); // Elle's method
  date.setDate(date.getDate() + (firstDayofWeek - date.getDay())); // 0 - Sunday, 1 - Monday etc
  return date;
}

/**
* get time in seconds from number
* @param  {number} value - value to get time details from
*
*/
const valueToSeconds = (value: number): number => {

  // if 0
  if (value === 0) {
    return 0;
  }

  let _stringValue = value.toString();

  if (_stringValue.length <= 2) {
    return value * 3600;
  }

  if (_stringValue.length === 3) {
    let [_hours, _minutes] = _stringValue.split(".");

    let _hoursInSec = Number(_hours) * 3600;
    let _minInSec = Number(_minutes) * 10 * 60;

    return _hoursInSec + _minInSec;
  }
};

/**
* checks if an object has a list of prop/keys
* @param  {[]} list - vlist of properties to loop
* @param  {Object} rowData - object to check property of
* @return {[]}
*/
const objHasProperty = (list: string[], rowData: object): [boolean, string] => {

  let _valid = true;
  let _msg = "";
  // iterate cols
  for (const columnIndex in list) {

    if (!(list[columnIndex] in rowData)) {
      _valid = false;
      _msg = `${list[columnIndex]} is missing`;
      break;
    }
  }

  return [_valid, _msg];
};

/**
* gets the week and year from a date object
* @param  {Date} param - value to get time details from
* @return {[string, string]} list, week and year
*/
const getWeekAndYear = (param: Date): [string, string] => {
  // basic checks
  if (param === null || param === undefined) return ["..", ".."];

  // var
  let _week = 0;
  let _year = 0;

  // get week
  _week = getWeek(param, { weekStartsOn: 1 });

  // get year
  _year = getYear(param);

  return [_week.toString(), _year.toString()];
};
/* compare for sort */
const compareWeekPeriod = (_weekA: IStoreYearWeekItem, _weekB: IStoreYearWeekItem) => {
  return +_weekA.week - +_weekB.week;
};

interface IStateData {
  years: {
    full: []
  };
  weeks: {};
  items: {};
}

interface IStateYearObj {
  weeksInYear: string[];
  [key: string]: {
    itemsIds: number[];
    status: string;
    week: string;
    year: string;
  } | any;
}

export interface IMainData {
  yearList: string[];
  years: {
    [key: string]: IStateYearObj;
  };
  items: {
    [key: number]: IStateItem;
  };
}

interface IStateItem {
  week: string;
  year: string;
  status: string;
  project: string;
  location: string;
  description: string;
  freshService: string;
  task: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

const prepareUserData = (param: ISPFullItemsObj[]) => {
  // new arr, no mutate
  let _sharepointArr = [...param];
  // main, mutate
  let _mainData: IMainData = {
    yearList: [],
    years: {},
    items: {}
  };

  _sharepointArr.forEach(dataObj => {

    // vars
    let _year = dataObj.Year;
    let _week = dataObj.Week;
    let _status = dataObj.Status;

    // check if necessary properties are created first create if not
    // year not in
    if (!_mainData.yearList.includes(_year)) {
      // deep copy
      // add year property
      let yearObj = {
        ..._mainData.years,
        // year is an array of weeks
        [_year] : {
          weeksInYear: [],
        }
      };
      // push in curr year
      _mainData.yearList.push(_year);
      // mutate
      _mainData.years = {
        ...yearObj
      };

    }
    // sure year is in, deal with week.
    // deep copy
    let selectedYear = {..._mainData.years[_year]};
    // if week not in selected year, new week
    if (!selectedYear.weeksInYear.includes(_week)) {
      // push  week
      selectedYear.weeksInYear.push(_week);
      // add week property
      selectedYear[_week] = {
        itemIds: [],
        status: _status,
        week: _week,
        year: _year
      };
      // mutate
      _mainData.years[_year] = selectedYear;
    }

    // sure week is in, additonal data and items
    // shallow reference
    let currWeekInYear: {itemIds:number[], status:string} = _mainData.years[_year][_week];
    // just mutate most
    // add id
    currWeekInYear.itemIds.push(dataObj.Id);
    // add item
    _mainData.items = {
      ..._mainData.items,
      [dataObj.Id]: {
        week: dataObj.Week,
        year: dataObj.Year,
        status: dataObj.Status,
        project: dataObj.Projects,
        location: dataObj.Location,
        description: dataObj.Description,
        freshService: dataObj.FreshService,
        task:dataObj.Task,
        monday: dataObj.Monday,
        tuesday: dataObj.Tuesday,
        wednesday: dataObj.Wednesday,
        thursday: dataObj.Thursday,
        friday: dataObj.Friday,
        saturday: dataObj.Saturday,
        sunday: dataObj.Sunday,
      }
    };

  });

  console.log(_mainData);
  return _mainData;
};

const createStateDataFromSharepoint = (param: ISPFullItemsObj[]):IStoreMainData => {
  // new arr, no mutate
  let _sharepointArr = [...param];
  // main, mutate
  let _mainData: IStoreMainData = {
    yearList: [],
    years: {},
    items: {}
  };
  // loop
  _sharepointArr.forEach(dataObj => {
    // vars
    let _year = dataObj.Year;
    let _week = dataObj.Week;
    let _status = dataObj.Status;

    // check if necessary properties are created first in main data
    // year not in
    if (!_mainData.yearList.includes(_year)) {
      // year is an array of week objects
      _mainData.years[_year] = [];
      // push in curr year to year list
      _mainData.yearList.push(_year);
    }

    // sure year is in, deal with week.
    // current year
    let currYear = _mainData.years[_year];
    // if year is empty
    if (currYear.length === 0) {
      currYear.push({
        itemIds: [dataObj.Id],
        status: _status,
        week: _week,
        year: _year
      });
    } else {
      // check if current week is in
      let currWeek: IStoreYearWeekItem|undefined  = currYear.find((weekData) => {
        return weekData.week === _week;
      });
      // undefined, no week
      if (typeof currWeek === "undefined") {
        // new week, push new into year array
        currYear.push({
          itemIds: [dataObj.Id],
          status: _status,
          week: _week,
          year: _year
        });
      } else {
        // week exists, update items id
        currWeek.itemIds.push(dataObj.Id);
      }
    }

    // add item to all items list
    _mainData.items[dataObj.Id] = {
      id: dataObj.Id,
      week: dataObj.Week,
      year: dataObj.Year,
      status: dataObj.Status,
      project: dataObj.Projects,
      location: dataObj.Location,
      description: dataObj.Description,
      freshService: dataObj.FreshService,
      task:dataObj.Task,
      monday: dataObj.Monday,
      tuesday: dataObj.Tuesday,
      wednesday: dataObj.Wednesday,
      thursday: dataObj.Thursday,
      friday: dataObj.Friday,
      saturday: dataObj.Saturday,
      sunday: dataObj.Sunday,
    };

    });
    console.log(_mainData);
    return _mainData;
  };

export { getRandomInt, delay,
  weekToDate, valueToSeconds,
  objHasProperty, getWeekAndYear,
  compareWeekPeriod, prepareUserData,
  IStateData, createStateDataFromSharepoint
};

import * as React from 'react';
import { getWeek, getYear } from 'date-fns';
import { IUserWeek } from '../sampleData';
import { ISPFilteredObj } from '../../controller/server';
import { FullWidthKeys } from 'ag-grid-community/dist/lib/rendering/row/rowCtrl';

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
function delay(t: number, v: IUserWeek): Promise<IUserWeek> {
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
const compareWeekPeriod = (_weekA: IUserWeek, _weekB: IUserWeek) => {
  return _weekA.week - _weekB.week;
};

interface IStateData {
  years: {
    full: []
  };
  weeks: {};
  items: {};
}
const prepareUserData2 = (param: ISPFilteredObj[]) => {
  // new arr, no mutate
  let _spArr = [...param];
  // main, mutate
  let _mainData = {
    years: {
      full: []
    },
    weeks: {},
    items: {}
  };

  _spArr.forEach(dataObj => {

    // vars
    let _year = dataObj.Year;
    let _week = dataObj.Week;

    // check if year property is not present
    if (!(_year in _mainData.years)) {
      // add year property = an array of weeks
      _mainData.years = {
        ..._mainData.years,
        // year is an array of weeks
        [_year]: [_week],
        // add year to full year array
        full: [
          ..._mainData.years.full,
          _year
        ]
      }
    } else {
      // weeks in current year
      let arrWeeksInYear: string[] = [..._mainData.years[_year]];
      // check if week doesnt exist
      if (!arrWeeksInYear.includes(_week)){
        _mainData.years[_year] = [
          ...arrWeeksInYear,
          _week
        ]
      }
    }

    // if week property doesnt exist in weeks
    if (!(_week in _mainData.weeks)) {
      // create obj
      _mainData.weeks = {
        ..._mainData.weeks,
        // week is array of ids
        [_week]: [
          {
            id: dataObj.Id,
            year: dataObj.Year,
            status: dataObj.Status
          }
        ] 
      }
    } else {
      // mutate
      _mainData.weeks[_week] = [
        ..._mainData.weeks[_week],
        {
          id: dataObj.Id,
          year: dataObj.Year,
          status: dataObj.Status
        }
      ]
    }

    // items, just add in, id is uniq
    _mainData.items = {
      ..._mainData.items,
      [dataObj.Id]: {
        week: +dataObj.Week,
        year: +dataObj.Year,
        status: dataObj.Status,
        Project: dataObj.Projects, 
        Location: dataObj.Location,
        Description: dataObj.Description, 
        FreshService: dataObj.FreshService, 
        Task:dataObj.Task,
        monday: dataObj.Monday,
        tuesday: dataObj.Tuesday,
        wednesday: dataObj.Wednesday,
        thursday: dataObj.Thursday,
        friday: dataObj.Friday,
        saturday: dataObj.Saturday,
        sunday: dataObj.Sunday,
      }
    }
  });

  let sampleData = {
    fullYears: _mainData.years.full,
  }
  
  // iterate years
  _mainData.years.full.forEach(year => {
    // empty arr
    let blank = [];
    // make yera property
    sampleData[year] = {};
    // iterate over weeks
    Object.keys(_mainData.weeks).forEach(weekKey => {
      if (_mainData.weeks[weekKey][year] === year) {

      }
    });
  });

  console.log(_mainData)
  return _mainData;
};

const prepareUserData = (param: ISPFilteredObj[]) => {
  // new arr, no mutate
  let _spArr = [...param];
  // main, mutate
  let _mainData = {
    years: {
    },
    weeks: {},
    items: {}
  };

  _spArr.forEach(dataObj => {

    // vars
    let _year = dataObj.Year;
    let _week = dataObj.Week;

    // check if necessary properties are created first create if not
    // year not in
    if (!(_year in _mainData.years)) {
      _mainData.years = {
        // year is an array of weeks
        [_year] : {
          weeksInYear: [],
          // week is anarray containing ids of week item
          [_week]: []
        }
      }
    } else {
      // year can be in and no week in
      // year in, check if week isn't in
      if (!(_week in _mainData.years[_year])) {
        _mainData.years[_year] = {
          ..._mainData.years[_year],
          // week is anarray containing ids of week item
          [_week]: []
        }
      }
    }

    // variable setting
    let _weeksInYr: string[] = [..._mainData.years[_year]["weekInYears"]];
    let _arrOfWeekIds: string[] = [..._mainData.years[_year][_week]];

    // mutating
    if (!_weeksInYr.includes(_week)) {
      _mainData.years[_year]["weekInYears"] = [
        ..._weeksInYr,
        _week
      ]
    }
    // add id of current obj to year, week array
    _mainData.years[_year][_week] = [

    ]

    // check if year property is not present
    if (!(_year in _mainData.years)) {
      // add year property = an array of weeks
      _mainData.years = {
        ..._mainData.years,
        // year is an array of weeks
        [_year] : [_week]
      }
    } else {
      // weeks in current year
      let arrWeeksInYear: string[] = [..._mainData.years[_year]];
      // check if week doesnt exist
      if (!arrWeeksInYear.includes(_week)){
        _mainData.years[_year] = [
          ...arrWeeksInYear,
          _week
        ]
      }
    }

    // if week property doesnt exist in weeks
    if (!(_week in _mainData.weeks)) {
      // create obj
      _mainData.weeks = {
        ..._mainData.weeks,
        // week is array of ids
        [_week]: [
          dataObj.Id
        ] 
      }
    } else {
      // mutate
      _mainData.weeks[_week] = [
        ..._mainData.weeks[_week],
        dataObj.Id
      ]
    }

    // items, just add in
    _mainData.items = {
      ..._mainData.items,
      [dataObj.Id]: {
        week: +dataObj.Week,
        year: +dataObj.Year,
        status: dataObj.Status,
        Project: dataObj.Projects, 
        Location: dataObj.Location,
        Description: dataObj.Description, 
        FreshService: dataObj.FreshService, 
        Task:dataObj.Task,
        monday: dataObj.Monday,
        tuesday: dataObj.Tuesday,
        wednesday: dataObj.Wednesday,
        thursday: dataObj.Thursday,
        friday: dataObj.Friday,
        saturday: dataObj.Saturday,
        sunday: dataObj.Sunday,
      }
    }
  });

  console.log(_mainData)
  return _mainData;
};

export { getRandomInt, delay, 
  weekToDate, valueToSeconds, 
  objHasProperty, getWeekAndYear, 
  compareWeekPeriod, prepareUserData,
  prepareUserData2, IStateData
};

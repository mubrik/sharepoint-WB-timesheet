import * as React from 'react';
import { getWeek, getYear } from 'date-fns'
import { IUserWeek } from '../sampleData';

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
  ]
};

const styles = props => ({
  root: [
    {
      background: props.theme.palette.themePrimary,
      selectors: {
        ':hover': {
          background: props.theme.palette.themeSecondary,
        }
      }
    },
    props.isExpanded
      ? { display: 'block' }
      : { display: 'none' }
  ]
});

// mini id geerator
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
};
// delay function, returns promise
function delay(t:number, v:IUserWeek): Promise<IUserWeek> {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
};

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
};

/**
* get time in seconds from number
* @param  {number} value - value to get time details from
*     
*/
const valueToSeconds = (value:number):number => {
  
  // if 0
  if (value === 0) {
    return 0;
  };

  let _stringValue = value.toString();

  if (_stringValue.length <= 2) {
    return value * 3600;
  };
  
  if (_stringValue.length === 3) {
    let [_hours, _minutes] = _stringValue.split(".");

    let _hoursInSec = Number(_hours) * 3600;
    let _minInSec = Number(_minutes) * 10 * 60;

    return _hoursInSec + _minInSec;
  };
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
  };

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
  _week = getWeek(param, {weekStartsOn: 1});

  // get year
  _year = getYear(param);

  return [_week.toString(), _year.toString()];
}

export {getRandomInt, delay, weekToDate, valueToSeconds, objHasProperty, getWeekAndYear};
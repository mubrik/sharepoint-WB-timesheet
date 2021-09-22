import { IComponentStyles } from "@uifabric/foundation";

export const stylesDanger = {
  root: [
    {
      background: "#f12e2ebd",
      selectors: {
        ':hover': {
        },
        ':disabled': {
          background: "#f12e2e59",
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
function delay(t:number, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
};

/**
* get date by week number
* @param  {Number} year 
* @param  {Number} week 
* @param  {Number} day of week (optional; default = 0 (Sunday)) 
* @return {Date}      
*/

function weekToDate(year: number, week: number, weekDay = 1): Date {

  const getZeroBasedIsoWeekDay = date => (date.getDay() + 6) % 7;
  const getIsoWeekDay = date => getZeroBasedIsoWeekDay(date) + 1;
  const zeroBasedWeek = week - 1;
  const zeroBasedWeekDay = weekDay - 1;
  let days = (zeroBasedWeek * 7) + zeroBasedWeekDay;
      // Dates start at 2017-01-01 and not 2017-01-00
      days += 1;

  const firstDayOfYear = new Date(year, 0, 1);
  const firstIsoWeekDay = getIsoWeekDay(firstDayOfYear);
  const zeroBasedFirstIsoWeekDay = getZeroBasedIsoWeekDay(firstDayOfYear);

  // If year begins with W52 or W53
  if (firstIsoWeekDay > 4) {
    days += 8 - firstIsoWeekDay; 
  // Else begins with W01
  } else {
    days -= zeroBasedFirstIsoWeekDay;
  }
  
  return new Date(year, 0, days);
};

export {getRandomInt, delay, weekToDate};
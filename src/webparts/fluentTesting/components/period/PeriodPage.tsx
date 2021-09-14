import * as React from 'react';
import {periodPageProps} from "./IPeriodProps"
import PeriodInput from "./PeriodInput"

const WeekPeriodPage: React.FunctionComponent<periodPageProps> = (props: periodPageProps) => {


  return(
    <div>
      <div>
        <PeriodInput
          dateObj={props.dateObj}
          setDate={props.setDate}
        />
      </div>
    </div>
  );
};

export default WeekPeriodPage;
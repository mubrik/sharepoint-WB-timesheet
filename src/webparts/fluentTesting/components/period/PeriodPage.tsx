import * as React from 'react';
import {periodPageProps} from "./IPeriodProps"
import PeriodInput from "./PeriodInput"
import { useMediaQuery } from 'react-responsive'
import { Stack } from '@microsoft/office-ui-fabric-react-bundle';
/* import RenderProjectList from './ProjectList'; */


const WeekPeriodPage: React.FunctionComponent<periodPageProps> = (props: periodPageProps) => {

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)'
  });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const isMobile = useMediaQuery({ minWidth: 320, maxWidth: 450 });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });

  return(
    <Stack>
      <Stack>
        <PeriodInput
          dateObj={props.dateObj}
          setDate={props.setDate}
        />
      </Stack>
      <Stack>
        {/* <RenderProjectList/> */}
      </Stack>
      <div>
        <h1>Device Test!</h1>
        {isDesktopOrLaptop && <p>You are a desktop or laptop</p>}
        {isTablet && <p>You are a tablet</p>}
        {isMobile && <p>You are a mobile phone</p>}
        <p>Your are in {isPortrait ? 'portrait' : 'landscape'} orientation</p>
      </div>
    </Stack>
  );
};

export default WeekPeriodPage;
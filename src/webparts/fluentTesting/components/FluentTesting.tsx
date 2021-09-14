import * as React from 'react';
import { MainPageProps } from './IFluentTestingProps';
import { escape } from '@microsoft/sp-lodash-subset';
import {NavBar} from "./nav/Navbar";
import WeekPeriodPage from "./period/PeriodPage";
import NewProjectPage from "./form/NewProjectPage"
import DraftPage from './draft/DraftPage';

// main page for webpart, handles states for nav and others
const MainPage: React.FunctionComponent<MainPageProps> = () => {

  // useeffect for width
  React.useEffect(() => {
    try {
      document.getElementById("workbenchPageContent").style.maxWidth = "1660px";
    } catch (error) {

    }
  },[])
  
  // page state
  const [pageState, setPageState] = React.useState("period");
  // date selected
  const [date, setDate] = React.useState<Date | null>(null);

  return(
    <div>
      <nav><NavBar pageState={pageState} setPageState={setPageState}/></nav>
      <main>
        {pageState === "period" &&
          <WeekPeriodPage
            dateObj={date}
            setDate={setDate}
          />
        }
        {pageState === "new" &&
          <NewProjectPage
            dateObj={date}
          />
        }
        {pageState === "drafts" &&
          <DraftPage/>
        }
      </main>
    </div>
  );
};

export default MainPage;
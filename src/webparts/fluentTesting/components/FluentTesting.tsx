import * as React from 'react';
// UI
import { PrimaryButton, Stack } from 'office-ui-fabric-react';
import { ThemeProvider } from '@uifabric/foundation';
import { createTheme } from '@uifabric/styling';
/* import { escape } from '@microsoft/sp-lodash-subset'; */
// custom components
import { NavBar } from "./nav/Navbar";
import DraftPage from './draft/DraftPage';
import TablePage from "./form/TablePage";
// sample data and types
import { IUserData} from "./dataTypes";
import { WebPartContext } from "@microsoft/sp-webpart-base";
// server
import fetchServer from '../controller/server';
import { ISpUserPeriodData } from '../controller/serverTypes';
// error boundary
import ErrorBoundary from './error/ErrorBoundary';
// notification
import NotificationBar from './notification/NotificationBar';

export interface IMainProps {
  description: string;
  context: WebPartContext;
}

// context to pass down date and store data
export const TableDataContext = React.createContext<{
  tableData: ISpUserPeriodData; 
  setTableData: React.Dispatch<React.SetStateAction<ISpUserPeriodData>>;
}>(null);
export const UserDataContext = React.createContext<IUserData>(null);

// main page for webpart, handles states for nav and others
const MainPage: React.FunctionComponent<IMainProps> = () => {

  // page state
  const [pageState, setPageState] = React.useState("drafts");
  // userdata
  const [userData, setUserData] = React.useState(null);
  // table form data
  const [tableData, setTableData] = React.useState<ISpUserPeriodData>(null);

  // useeffect for width
  React.useEffect(() => {
    try {
      document.getElementById("workbenchPageContent").style.maxWidth = "1920px";
    } catch (error) {
      // pass
    }
  }, []);

  // useeffect to fetch user data
  React.useEffect(() => {
    fetchServer.getUser()
    .then(result => {
      console.log(result);
      setUserData(result);
    });

  }, []);

  // theme props
  const myTheme = createTheme({
    palette: {
      themePrimary: '#0d58d1',
      themeLighterAlt: '#f4f7fd',
      themeLighter: '#d2e1f8',
      themeLight: '#adc7f1',
      themeTertiary: '#6394e3',
      themeSecondary: '#2569d7',
      themeDarkAlt: '#0b4fbc',
      themeDark: '#0a439f',
      themeDarker: '#073175',
      neutralLighterAlt: '#faf9f8',
      neutralLighter: '#f3f2f1',
      neutralLight: '#edebe9',
      neutralQuaternaryAlt: '#e1dfdd',
      neutralQuaternary: '#d0d0d0',
      neutralTertiaryAlt: '#c8c6c4',
      neutralTertiary: '#a19f9d',
      neutralSecondary: '#605e5c',
      neutralPrimaryAlt: '#3b3a39',
      neutralPrimary: '#323130',
      neutralDark: '#201f1e',
      black: '#000000',
      white: '#ffffff',
    },
    semanticColors: {
      bodyBackground: "#c8c8c8",
      bodyText: "#000000",
    },
  });

  // handle testing click
  const handleTestClick = (): void => {
    fetchServer.testing();
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={myTheme}>
      <UserDataContext.Provider value={userData}>
        <Stack tokens={{ childrenGap: 8, padding: 2 }}>
          <Stack horizontal>
            <NavBar pageState={pageState} setPageState={setPageState} />
          </Stack>
          <NotificationBar>
            <TableDataContext.Provider value={{tableData, setTableData}}>
              <Stack>
                {pageState === "new" &&
                  <TablePage
                    mode={"new"}
                  />
                }
                {pageState === "drafts" &&
                  <DraftPage
                  />
                }
                {/* <PrimaryButton
                  text='test'
                  onClick={handleTestClick}
                /> */}
              </Stack>
            </TableDataContext.Provider>
          </NotificationBar>
        </Stack>
      </UserDataContext.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default MainPage;

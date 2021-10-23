import * as React from 'react';
// UI
import { Stack } from 'office-ui-fabric-react';
import { ThemeProvider } from '@uifabric/foundation';
import { createTheme } from '@uifabric/styling';
/* import { escape } from '@microsoft/sp-lodash-subset'; */
// custom components
import { NavBar } from "./nav/Navbar";
import DraftPage from './draft/DraftPage';
import TablePage from "./form/TablePage";
// sample data and types
import { IUserWeek, IStoreState} from "./dataTypes";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {IServer} from '../controller/server';
// test
import {prepareUserData, createStateDataFromSharepoint} from "./utils/utils";

export interface IMainProps {
  description: string;
  context: WebPartContext;
  request: IServer;
}

const initialData:IStoreState = {
  data: {
    yearList: [],
    years: {},
    items: {}
  },
  status: "idle"
};
// action types
export type IAction =
  | { type: "updateAll", payload: IStoreState }
  | { type: "updateLoading", payload: { status: string } }
  | { type: "updateWeek", payload: { data: IUserWeek } };

// reducer, leaving this here for readability, should move when bigger
const myReducer = (state: IStoreState, action: IAction): IStoreState => {
  switch (action.type) {
    case "updateAll":
      return {
        ...state,
        ...action.payload
      };

    case "updateLoading":
      return {
        ...state,
        status: action.payload.status
      };

    case "updateWeek":
      console.log(action);
      let _weekToUpdate = String(action.payload.data.week);
      let _yearToUpdate = String(action.payload.data.year);

      return {
        ...state,
        data: {
          ...state.data,
          [_yearToUpdate]: { ...state.data[_yearToUpdate], [_weekToUpdate]: action.payload.data }
        }
      };
    default:
      break;
  }
};
// context to pass down date and store data
export const StoreData = React.createContext(null);
export const DateContext = React.createContext(null);
export const RequestContext = React.createContext(null);
export const TableDataContext = React.createContext(null);

// main page for webpart, handles states for nav and others
const MainPage: React.FunctionComponent<IMainProps> = (props: IMainProps) => {

  // page state
  const [pageState, setPageState] = React.useState("drafts");
  // date selected
  const [date, setDate] = React.useState<Date | null>(null);
  // main data and dispatch store
  const [data, dispatchStore] = React.useReducer(myReducer, initialData);
  // table form data
  const [tableData, setTableData] = React.useState<number[] | []>([]);

  // useeffect for width
  React.useEffect(() => {
    try {
      document.getElementById("workbenchPageContent").style.maxWidth = "1920px";
    } catch (error) {

    }
  }, []);

  // useeffect to fetch working data, will be async in prod, simulate "loading"
  React.useEffect(() => {
    // dispatch loading status
    dispatchStore({
      type: "updateLoading",
      payload: { status: "loading" }
    });
    // 5sec delay for actual data
    setTimeout(() => {
      props.request.getUserList()
        .then(lst => {
          let sample = prepareUserData(lst);
          let sample2 = createStateDataFromSharepoint(lst);
          console.log(sample);
          console.log(sample2);
          dispatchStore({
            type: "updateAll",
            payload: {
              data: sample2,
              status: "loaded",
            }
          });
        });
    }, 5000);

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

  return (
    <ThemeProvider theme={myTheme}>
      <Stack tokens={{ childrenGap: 8, padding: 2 }}>
        <StoreData.Provider value={{ data, dispatchStore }}>
        <RequestContext.Provider value={props.request}>
          <DateContext.Provider value={{ date, setDate }}>
            <Stack horizontal>
              <NavBar pageState={pageState} setPageState={setPageState} />
            </Stack>
            <TableDataContext.Provider value={{ tableData, setTableData }}>
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
              </Stack>
            </TableDataContext.Provider>
          </DateContext.Provider>
        </RequestContext.Provider>
        </StoreData.Provider>
      </Stack>
    </ThemeProvider>
  );
};

export default MainPage;

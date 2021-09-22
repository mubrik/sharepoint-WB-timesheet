import * as React from 'react';
// UI
import { Stack, IconButton } from 'office-ui-fabric-react';
import { ThemeProvider } from '@uifabric/foundation';
import { createTheme } from '@uifabric/styling';
/* import { escape } from '@microsoft/sp-lodash-subset'; */
// custom components
import {NavBar} from "./nav/Navbar";
import NewProjectPage from "./form/NewProjectPage"
import DraftPage from './draft/DraftPage';
// sample data and types
import { IUserYear, IUserWeek, testData} from "./sampleData";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IMainProps {
  description: string;
  context: WebPartContext;
}
// state type
export type IState = {
  data: {}|IUserYear;
  status: string;
} 
// action types
type IAction =
 | { type: "updateAll", payload:IState }
 | { type: "updateLoading", payload: {status: string} }
 | { type: "updateWeek", payload: {data: IUserWeek} }

// reducer, leaving this here for readability, should move when bigger
const myReducer = (state:IState, action:IAction): IState => {
  switch (action.type) {
    case "updateAll":
      return {
        ...state,
        ...action.payload
      }
    
    case "updateLoading":
      return {
        ...state,
        status: action.payload.status
      }
      
    case "updateWeek":
      console.log(action);
      let _weekToUpdate = String(action.payload.data.week);
      let _yearToUpdate = String(action.payload.data.year);

      return {
        ...state,
        data: {
          ...state.data,
          [_yearToUpdate]:{...state.data[_yearToUpdate], [_weekToUpdate]: action.payload.data}
        }
      }
  
    default:
      break;
  }
};
// context for pass down store dispatch
export const StoreDispatch = React.createContext(null);
export const StoreData = React.createContext(null);

// main page for webpart, handles states for nav and others
const MainPage: React.FunctionComponent<IMainProps> = (props:IMainProps) => {

  // page state
  const [pageState, setPageState] = React.useState("drafts");
  // dark mode?
  const [isDark, setIsDark] = React.useState<boolean>(false);
  // date selected
  const [date, setDate] = React.useState<Date | null>(null);
  // main data and dispatch store
  const [data, dispatchStore] = React.useReducer(myReducer, {data: {}, status: "idle"});

  // useeffect for width
  React.useEffect(() => {
    try {
      document.getElementById("workbenchPageContent").style.maxWidth = "1660px";
    } catch (error) {

    }
  },[]);

  // useeffect to fetch working data, will be async in prod, simulate "loading"
  React.useEffect(() => {

    dispatchStore({
      type: "updateLoading",
      payload:{status: "loading"}
    })

    setTimeout(() => {
      dispatchStore({
        type: "updateAll",
        payload:{
          data: testData,
          status: "loaded"
        }
      })
    }, 5000);

  }, []);

  // theme props
  const myTheme = createTheme({
    palette: {
      themePrimary: '#9259d4',
      themeLighterAlt: '#060408',
      themeLighter: '#170e22',
      themeLight: '#2c1b3f',
      themeTertiary: '#58357f',
      themeSecondary: '#814eba',
      themeDarkAlt: '#9c67d8',
      themeDark: '#aa7cde',
      themeDarker: '#bf9ce7',
      neutralLighterAlt: '#f8f8f8',
      neutralLighter: '#f4f4f4',
      neutralLight: '#eaeaea',
      neutralQuaternaryAlt: '#dadada',
      neutralQuaternary: '#d0d0d0',
      neutralTertiaryAlt: '#c8c8c8',
      neutralTertiary: '#595959',
      neutralSecondary: '#373737',
      neutralPrimaryAlt: '#2f2f2f',
      neutralPrimary: '#000000',
      neutralDark: '#151515',
      black: '#0b0b0b',
      white: '#ffffff',
    },
    semanticColors: {
      bodyBackground: isDark ? "#000000" : "#c8c8c8",
      bodyText: isDark ? "#ffffff" : "#000000",
      bodyDivider: "#58357f"
    },
  });

  console.log( "main theme", myTheme)

  return(
    <ThemeProvider theme={myTheme}>
    <Stack>
      <StoreDispatch.Provider value={dispatchStore}>
        <StoreData.Provider value={data}>
            <Stack horizontal>
              <NavBar pageState={pageState} setPageState={setPageState}/>
              <IconButton iconProps={{ iconName: 'ToggleLeft' }} title="Dark Mode" aria-label={"toggle"} onClick={() => {setIsDark(old => !old)}}/>
            </Stack>
            <Stack>
              {pageState === "new" &&
                <NewProjectPage
                  dateObj={date}
                  setDateApi={setDate}
                />
              }
              {pageState === "drafts" &&
                <DraftPage
                />
              }
            </Stack>
        </StoreData.Provider>
      </StoreDispatch.Provider>
    </Stack>
    </ThemeProvider>
  );
};

export default MainPage;
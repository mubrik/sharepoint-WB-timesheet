import * as React from 'react';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Stack } from 'office-ui-fabric-react';
import { escape } from '@microsoft/sp-lodash-subset';
// custom components
import {NavBar} from "./nav/Navbar";
import NewProjectPage from "./form/NewProjectPage"
import DraftPage from './draft/DraftPage';
// sample data and type
import {IYearData, IUserYear, IUserWeek, testData} from "./sampleData";
// pnp
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/lists";

export interface IMainProps {
  description: string;
  context: WebPartContext;
}

export type IState = {
  data: {}|IUserYear;
  status: string;
} 

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
  const [pageState, setPageState] = React.useState("new");
  // date selected
  const [date, setDate] = React.useState<Date | null>(null);
  // data
  const [data, dispatchStore] = React.useReducer(myReducer, {data: {}, status: "idle"});
  
  console.log(data);


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

  return(
    <Stack>
      <StoreDispatch.Provider value={dispatchStore}>
        <StoreData.Provider value={data}>
          <nav><NavBar pageState={pageState} setPageState={setPageState}/></nav>
          <main>
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
          </main>
        </StoreData.Provider>
      </StoreDispatch.Provider>
    </Stack>
  );
};

export default MainPage;
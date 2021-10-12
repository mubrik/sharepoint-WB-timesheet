import * as React from 'react';
// react context
import { StoreData, IState } from "../FluentTesting";
// UI
import {
  FocusZone,
  FocusZoneDirection, TextField,
  List, mergeStyleSets,
  StackItem, Stack,
  Dropdown, IDropdownOption,
  Spinner,
  IPageProps
} from 'office-ui-fabric-react';
// components
import TablePage from '../form/TablePage';
import DraftDialog from "./DraftDialog";
// sample data types
import { IUserWeek, IUserWeeks, IUserYear } from '../sampleData';
import {compareWeekPeriod} from "../utils/utils";

// styles
const gridCLasses = mergeStyleSets({

  mainGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "auto",
    overflow: "hidden",
  },
  itemContainer: {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    margin: "4px",
    cursor: "pointer",
    boxShadow: "0px 0px 4px 0px #433f7e7d",
    overflow: "hidden",
  },
  itemLabel: {
    padding: "5px"
  }
});

// types
export interface IDraftProps {
  userData?: IUserYear;
}

interface IInitialState {
  2020: IUserWeek[];
  2021: IUserWeek[];
  full: IUserWeek[];
  status: string;
}
// initial draft list state
const initialState: IInitialState = {
  2020: [],
  2021: [],
  full: [],
  status: "idle"
};

const DraftPage: React.FunctionComponent<IDraftProps> = () => {

  // react context
  const { data: storeData }: { data: IState } = React.useContext(StoreData);
  // controlled input states
  const [yearFilter, setYearFilter] = React.useState<IDropdownOption>({ key: "full", text: "All" },);
  const [statusFilter, setStatusFilter] = React.useState<IDropdownOption>({ key: "full", text: "All" });
  const [sort, setSort] = React.useState<IDropdownOption>({ key: "up", text: "Ascending" });
  const [weekFilter, setweekFilter] = React.useState("");
  // page view state
  const [pageState, setPageState] = React.useState<string>("list");
  // list data, data list should be async set in production
  const [draftData, setDraftData] = React.useState<IInitialState>(initialState);
  const [shownItems, setShownItems] = React.useState<null | IUserWeek[]>(null);
  // modal dialog state and data
  const [draftDialog, setDraftDialog] = React.useState({ hidden: true, data: null });

  // year keys
  const controlledYear = [
    { key: "2020", text: "2020" },
    { key: "2021", text: "2021" },
    { key: "full", text: "All" },
  ];

  // status filter keys
  const controlledStatus = [
    { key: "draft", text: "Draft" },
    { key: "pending", text: "Pending" },
    { key: "approved", text: "Approved" },
    { key: "full", text: "All" },
  ];

  // sorting
  const controlledSort = [
    { key: "up", text: "Ascending" },
    { key: "down", text: "Decending" },
  ];

  // set data
  React.useEffect(() => {
    if (storeData.status === "loaded") {
      // get data from different year and make a list
      let weeksIn2020: IUserWeek[] = [];
      let weeksIn2021: IUserWeek[] = [];
      // objects with data
      let _data20: IUserWeeks = storeData.data["2020"];
      let _data21: IUserWeeks = storeData.data["2021"];
      // loop 2020 keys
      Object.keys(_data20).forEach((key) => {
        weeksIn2020.push(_data20[key]);
      });
      // loop 2021 keys
      Object.keys(_data21).forEach((key) => {
        weeksIn2021.push(_data21[key]);
      });
      // concat
      let fullWeeksArray: IUserWeek[] = weeksIn2020.concat(weeksIn2021);
      // set data
      setDraftData((oldData) => {
        return {
          ...oldData,
          2020: weeksIn2020,
          2021: weeksIn2021,
          full: fullWeeksArray,
          status: "loaded"
        };
      });
      // set shown list
      setShownItems(fullWeeksArray);

    }
  }, [storeData]);

  // use effect for handling filter states change
  React.useEffect(() => {
    const _year = yearFilter.key;
    const _status = statusFilter.key;
    const _sort = sort.key;

    // array year filtered
    let arrayToSet: Array<IUserWeek> = [...draftData[_year]];

    // check if data empty
    if (arrayToSet.length === 0) {
      setShownItems(null);
    } else {
      // filter by weeek
      let _filteredWeek = (weekFilter && weekFilter !== "0") ?
        arrayToSet.filter(weekItem => {
          return weekItem.week.toString().toLowerCase().indexOf(weekFilter.toLowerCase()) >= 0;
        }) :
        arrayToSet;

      // sort array
      let _sortedWeek = (_sort === "up") ? _filteredWeek.sort(compareWeekPeriod) :
        _filteredWeek.sort(compareWeekPeriod).reverse();

      // filter by status
      if (_status === "full") {
        // sh
        setShownItems(_sortedWeek);
      } else {
        // filtered status arr
        let _filteredArr = _sortedWeek.filter(weekData => weekData.status === _status);
        setShownItems(_filteredArr);
      }
    }

  },[yearFilter, statusFilter, weekFilter, draftData, sort]);

  // on item click, dialog handler
  const handleListItemClick = (weekData: IUserWeek) => {
    // set draft dialog
    setDraftDialog({
      hidden: false,
      data: weekData
    });
  };
  // how to render a page list
  const onRenderPage = React.useCallback((props:IPageProps) => {
    // get list item
    let _itemsList: IUserWeek[] = props.page.items;
    console.log(props);

    return (
      <div
        className={gridCLasses.mainGrid}
        key={props.key}
        role={props.role}
      >
        {_itemsList.map((weekData) => (
          <div
            className={gridCLasses.itemContainer}
            data-is-focusable
            key={weekData.status + weekData.week + weekData.year}
            onClick={() => handleListItemClick(weekData)}
          >
          <span className={gridCLasses.itemLabel}>Week: <strong>{weekData.week}</strong></span>
          <span className={gridCLasses.itemLabel}>Year: <strong>{weekData.year}</strong></span>
          <span className={gridCLasses.itemLabel}>Status: <strong>{weekData.status}</strong></span>
        </div>
        ))}
      </div>
    );

  }, []);

  /* const onRenderSurface = (props) => {
    console.log(props);
    return (
      <div>
        onRenderPage()
      </div>
    )
  } */

  return (
    <Stack tokens={{ childrenGap: 7, padding: 2 }}>
      {
        pageState === "list" &&
        <>
          {
            !draftDialog.hidden &&
            <DraftDialog
              hidden={draftDialog.hidden}
              setPageState={setPageState}
              setDraftDialog={setDraftDialog}
              weekData={draftDialog.data}
            />
          }
          <Stack horizontal tokens={{ childrenGap: 10, padding: 8 }}>
            <StackItem>
              <Dropdown
                selectedKey={yearFilter ? yearFilter.key : "full"}
                label="Filter Year"
                options={controlledYear}
                onChange={(_,item) => setYearFilter(item)}
              />
            </StackItem>
            <StackItem>
            <Dropdown
              selectedKey={statusFilter ? statusFilter.key : "full"}
              label={"Filter Status"}
              options={controlledStatus}
              onChange={(_,item) => setStatusFilter(item)}
            />
          </StackItem>
            <StackItem>
            <Dropdown
              selectedKey={sort ? sort.key : "up"}
              label={"Sort"}
              options={controlledSort}
              onChange={(_,item) => setSort(item)}
            />
          </StackItem>
            <StackItem>
              <TextField
                label={'Filter by Week'}
                onChange={(_, text) => setweekFilter(text)}
                type={"number"}
                min={0}
                max={53}
              />
            </StackItem>
          </Stack>
          <Stack>
            {shownItems &&
              <FocusZone direction={FocusZoneDirection.vertical}>
                <List items={shownItems}
                onRenderPage={onRenderPage}
                /* onRenderSurface={onRenderSurface} */
                getItemCountForPage={() => 53}
                />
              </FocusZone>
            }
            {
              !shownItems &&
              <>
                <Spinner label={"Loading User Data"} ariaLive="assertive" labelPosition="top"></Spinner>
              </>
            }
          </Stack>
        </>
      }
      {
        pageState === "edit" &&
        <>
          <TablePage
            mode={"edit"}
            setDraftPage={setPageState}
          />
        </>
      }
    </Stack>
  );
};

export default DraftPage;

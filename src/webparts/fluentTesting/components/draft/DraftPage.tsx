import * as React from 'react';
// react context
import { StoreData, IState, DateContext, TableDataContext } from "../FluentTesting";
// UI
import {
  Icon, FocusZone,
  FocusZoneDirection, TextField,
  List, IColumn,
  ITheme, mergeStyleSets,
  getTheme, getFocusStyle,
  StackItem, Stack,
  Dropdown, IDropdownOption,
  Spinner,
  GroupedList, IGroup, 
  IPageProps
} from 'office-ui-fabric-react';
// components
import EditPage from '../oldComps/EditPage';
import TablePage from '../form/TablePage';
import DraftDialog from "./DraftDialog";
// sample data types
import { IUserWeek, IUserWeeks, IUserYear, draftGroupList, IUserWeekData } from '../sampleData';
// theming
const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;
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

export interface IDraftProps {
  userData?: IUserYear;
}

interface IInitialState {
  2020: IUserWeek[];
  2021: IUserWeek[];
  full: IUserWeek[];
  status: string;
}

const initialState: IInitialState = {
  2020: [],
  2021: [],
  full: [],
  status: "idle"
}

const DraftPage: React.FunctionComponent<IDraftProps> = (props: IDraftProps) => {

  // react context
  const { data: storeData }: { data: IState } = React.useContext(StoreData);
  const { date, setDate }: { date: Date | null, setDate: React.Dispatch<React.SetStateAction<null | Date>> } = React.useContext(DateContext);
  const { setTableData }: { setTableData: React.Dispatch<React.SetStateAction<IUserWeekData[] | []>> } = React.useContext(TableDataContext);

  // controlled states
  const [year, setYear] = React.useState<null | IDropdownOption>(null);
  const [statusFilter, setStatusFilter] = React.useState<null | IDropdownOption>(null);
  const [pageState, setPageState] = React.useState<string>("list");
  const [editItem, setEditItem] = React.useState<IUserWeek | null>(null);
  // list data, data list should be async set in production
  const [draftData, setDraftData] = React.useState<IInitialState>(initialState);
  const [draftDialog, setDraftDialog] = React.useState({ hidden: true, data: null });
  const [shownItems, setShownItems] = React.useState<null | IUserWeek[]>(null);

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


  // set data
  React.useEffect(() => {
    if (year === null) {
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
          }
        });

        /* // set list 
        setDataList(fullWeeksArray); */
        // set shown list
        setShownItems(fullWeeksArray);

      }

    }
  }, [storeData]);

  // handle item selected
  const handleYearChanged = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {

    // set year
    setYear(item);
    // set items
    let arrayToSet: Array<IUserWeek> = draftData[item.key];

    if (arrayToSet.length === 0) {
      setShownItems(null);
    } else {
      setShownItems(arrayToSet);
    };
  };

  const handleStatusChanged = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
    // set status
    setStatusFilter(item);
    // status string
    let _status = item.key;
    // working data
    let _arrayToFilter: IUserWeek[] = year ? draftData[year.key] : draftData["full"];
    if (_status === "full") {
      setShownItems(draftData["full"]);
      return;
    }
    // filter by week
    setShownItems(_arrayToFilter.filter(weekItem => {
      return weekItem.status === _status;
    }));
  };

  // on item click
  const handleListItemClick = (weekData: IUserWeek) => {
    // set draft dialog
    setDraftDialog({
      hidden: false,
      data: weekData
    });
  };

  // filter
  const handleFilterChanged = (_: any, text: string): void => {

    // working data
    let _arrayToFilter: IUserWeek[] = year ? draftData[year.key] : draftData["full"];

    // filter by week
    setShownItems(_arrayToFilter.filter(weekItem => {
      return weekItem.week.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0;
    }));

  };

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

  }, [])

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
                selectedKey={year ? year.key : "full"}
                label="Select a Year"
                options={controlledYear}
                onChange={handleYearChanged}
              />
            </StackItem>
            <StackItem>
              <TextField
                label={'Filter by Week'}
                onChange={handleFilterChanged}
                type={"number"}
                min={0}
                max={53}
              />
            </StackItem>
            {/* <StackItem>
            <Dropdown
              selectedKey={statusFilter ? statusFilter.key : "full"}
              label={"Filter Status"}
              options={controlledStatus}
              onChange={handleStatusChanged}
            />
          </StackItem> */}
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
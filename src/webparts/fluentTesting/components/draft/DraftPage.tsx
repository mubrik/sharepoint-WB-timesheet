import * as React from 'react';
// react context
import { StoreData } from "../FluentTesting";
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
import {IDraftProps, IDraftState} from "./draftTypes";
import {IStoreState, IStoreYearWeekItem } from '../dataTypes';
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

// initial draft list state
const initialState: IDraftState = {
  full: [],
};

const DraftPage: React.FunctionComponent<IDraftProps> = () => {

  // react context
  const { data: storeData }: { data: IStoreState } = React.useContext(StoreData);
  // controlled input states
  const [yearFilter, setYearFilter] = React.useState<IDropdownOption>({ key: "full", text: "All" },);
  const [statusFilter, setStatusFilter] = React.useState<IDropdownOption>({ key: "full", text: "All" });
  const [sort, setSort] = React.useState<IDropdownOption>({ key: "up", text: "Ascending" });
  const [weekFilter, setweekFilter] = React.useState("");
  // page view state
  const [pageState, setPageState] = React.useState<string>("list");
  // list data, data list should be async set in production
  const [draftData, setDraftData] = React.useState<IDraftState>(initialState);
  const [shownItems, setShownItems] = React.useState<null | IStoreYearWeekItem[]>(null);
  // modal dialog state and data
  const [draftDialog, setDraftDialog] = React.useState({ hidden: true, data: null });
  // year options
  const [yearOptions, setYearOptions] = React.useState([{ key: "full", text: "All" }]);

  // year keys
  // let controlledYear = [
  //   // { key: "2020", text: "2020" },
  //   // { key: "2021", text: "2021" },
  //   { key: "full", text: "All" },
  // ];

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

  // online effect
  React.useEffect(() => {
    // sample
    // create case for empty obj later
    console.log(storeData.data);
    let data = {...storeData.data};

    let _draftData: IDraftState = {
      full: []
    };
    // years arr
    let _yearsList = data.yearList;
    // iterate
    _yearsList.forEach(year => {
      // create year
      _draftData[year] = [...data.years[year]];
      // add items to full list
      _draftData.full = [
        ..._draftData.full,
        ...data.years[year],
      ];
      // controlled year
      setYearOptions((prev) => {
        return [
          ...prev,
          { key: year, text: year }
        ];
      });
    });

    // set data
    setDraftData((oldData) => {
      return {
        ...oldData,
        ..._draftData,
      };
    });

    // set shown arr
    setShownItems(_draftData.full);

    console.log("statedate", _draftData);
  },[storeData]);

  // use effect for handling filter states change
  React.useEffect(() => {
    const _year = yearFilter.key;
    const _status = statusFilter.key;
    const _sort = sort.key;

    // array year filtered
    let arrayToSet: Array<IStoreYearWeekItem> = [...draftData[_year]];

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
  const handleListItemClick = (weekData: IStoreYearWeekItem) => {
    // set draft dialog
    setDraftDialog({
      hidden: false,
      data: weekData
    });
  };
  // how to render a page list
  const onRenderPage = React.useCallback((props:IPageProps) => {
    // get list item
    let _itemsList: IStoreYearWeekItem[] = props.page.items;
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
                options={yearOptions}
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

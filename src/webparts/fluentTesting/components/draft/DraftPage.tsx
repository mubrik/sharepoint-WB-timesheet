import * as React from 'react';
// UI
import {
  FocusZone,
  FocusZoneDirection, TextField,
  List, mergeStyleSets,
  StackItem, Stack,
  Dropdown, IDropdownOption,
  Spinner, DefaultButton,
  IPageProps, ContextualMenu,
  IContextualMenuProps
} from 'office-ui-fabric-react';
// server
import fetchServer from '../../controller/server';
import {ISpUserPeriodData} from '../../controller/serverTypes';
// user data
import {useGetUserData} from "../hooks";
// components
import TablePage from '../form/TablePage';
import DraftDialog from "./DraftDialog";
// sample data types
import {IDraftProps, IDraftState} from "./draftTypes";
import {compareWeekPeriod} from "../utils/utils";
// notification
import useNotificationHook from '../notification/hook';
// error
import CustomError from '../error/errorTypes';

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

  // list data, data list should be async set in production
  const [draftState, setDraftState] = React.useState<IDraftState>(initialState);
  // user data
  const userData = useGetUserData();
  // controlled input states
  const [yearFilter, setYearFilter] = React.useState<IDropdownOption>({ key: "full", text: "All" },);
  const [statusFilter, setStatusFilter] = React.useState<IDropdownOption>({ key: "full", text: "All" });
  const [weekFilter, setweekFilter] = React.useState("");
  const [sort, setSort] = React.useState<IDropdownOption>({ key: "up", text: "Ascending" });
  // page view state
  const [pageState, setPageState] = React.useState<string>("list");
  const [shownItems, setShownItems] = React.useState<null | ISpUserPeriodData[]>(null);
  // modal dialog state and data
  const [draftDialog, setDraftDialog] = React.useState({ hidden: true, data: null });
  // year options
  const [yearOptions, setYearOptions] = React.useState<IDropdownOption[]>([{ key: "full", text: "All" }]);
  // notification
  const notify = useNotificationHook();

  // status filter keys
  const controlledStatus = [
    { key: "Draft", text: "Draft" },
    { key: "Pending", text: "Pending" },
    { key: "Approved", text: "Approved" },
    { key: "full", text: "All" },
  ];

  // sorting
  const controlledSort = [
    { key: "up", text: "Ascending" },
    { key: "down", text: "Decending" },
  ];

  // effect for fetching data
  React.useEffect(() => {

    if (userData) {
      // initial object state
      const _draftData: IDraftState = {
        full: []
      };
      // fetch 
      fetchServer.getUserPeriodList(userData.email)
      .then(result => {
        // loop over periods
        result.forEach((timePeriod) => {
          // if time period doesnt exist in initial obj state create it
          if (!(timePeriod.year in _draftData)) {
            _draftData[timePeriod.year] = [];

            // aslo add year to options for sorting
            setYearOptions(prevValue => ([
              ...prevValue,
              {key: `${timePeriod.year}`, text: `${timePeriod.year}`}
            ]));
          }
          // add period
          _draftData[timePeriod.year].push(timePeriod);
          // full
          _draftData.full.push(timePeriod);
        });

        // set show
        setShownItems(result);
        // set state
        setDraftState(prevValue => ({
          ...prevValue,
          ..._draftData
        }));
      });
    }
  },[userData]);

  // use effect for handling filter states change
  React.useEffect(() => {
    const _year = yearFilter.key;
    const _status = statusFilter.key;
    const _sort = sort.key;

    // array year filtered
    const arrayToSet: Array<ISpUserPeriodData> = [...draftState[_year]];

    // check if data empty
    if (arrayToSet.length === 0) {
      setShownItems([]);
    } else {
      // filter by weeek
      const _filteredWeek = (weekFilter && weekFilter !== "0") ?
        arrayToSet.filter(weekItem => {
          return weekItem.week.toString().toLowerCase().indexOf(weekFilter.toLowerCase()) >= 0;
        }) :
        arrayToSet;

      // sort array
      const _sortedWeek = (_sort === "up") ? _filteredWeek.sort(compareWeekPeriod) :
        _filteredWeek.sort(compareWeekPeriod).reverse();

      // filter by status
      if (_status === "full") {
        // sh
        setShownItems(_sortedWeek);
      } else {
        // filtered status arr
        const _filteredArr = _sortedWeek.filter(weekData => weekData.status === _status);
        setShownItems(_filteredArr);
      }
    }

  },[yearFilter, statusFilter, weekFilter, draftState, sort]);

  // on item click, dialog handler
  const handleListItemClick = (weekData: ISpUserPeriodData): void => {
    // set draft dialog
    setDraftDialog({
      hidden: false,
      data: weekData
    });
  };

  const handleSendApprovalCLick = (id: number): void => {
    fetchServer.updatePeriodStatus(id)
      .then(result => {
        if (result) {
          notify({show: true, isError: false, msg:"Draft sent for approval"});
        }
      })
      .catch(error => {
        if (error instanceof CustomError) {
          // if custom error
          notify({isError: true, errorObj: error, msg: error.message, show: true});
        } else {
          // error i'm not throwing
          notify({isError: true, errorObj: error, msg: "Error occured", show: true});
        }
      });
  };
  // how to render a page list
  const onRenderPage = React.useCallback((props: IPageProps) => {
    // get list item
    const _itemsList: ISpUserPeriodData[] = props.page.items;

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
            onClick={(): void => handleListItemClick(weekData)}
          >
          <span className={gridCLasses.itemLabel}>Week: <strong>{weekData.week}</strong></span>
          <span className={gridCLasses.itemLabel}>Year: <strong>{weekData.year}</strong></span>
          <span className={gridCLasses.itemLabel}>Status: <strong>{weekData.status}</strong></span>
          <div className={gridCLasses.itemLabel}>
          <DefaultButton
            iconProps={{ iconName: 'Add' }}
            menuAs={_getMenu}
            menuProps={{
              items: [
                {
                  key: 'emailMessage',
                  text: 'Send Approval',
                  iconProps: { iconName: 'Accept' },
                  onClick: () => handleSendApprovalCLick(weekData.ID)
                },
                {
                  key: 'calendarEvent',
                  text: 'Cancel',
                  iconProps: { iconName: 'Cancel' }
                },
              ],
              directionalHintFixed: true
            }}
          />
          </div>
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
        // list of items
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
            <Dropdown
              selectedKey={yearFilter ? yearFilter.key : "full"}
              label="Filter Year"
              options={yearOptions}
              onChange={(_,item) => setYearFilter(item)}
            />
            <Dropdown
              selectedKey={statusFilter ? statusFilter.key : "full"}
              label={"Filter Status"}
              options={controlledStatus}
              onChange={(_,item) => setStatusFilter(item)}
            />
            <Dropdown
              selectedKey={sort ? sort.key : "up"}
              label={"Sort"}
              options={controlledSort}
              onChange={(_,item) => setSort(item)}
            />
            <TextField
              label={'Filter by Week'}
              onChange={(_, text) => setweekFilter(text)}
              type={"number"}
              min={0}
              max={53}
            />
          </Stack>
          <Stack tokens={{ childrenGap: 7, padding: 2 }}>
            {(shownItems && shownItems.length > 0) ?
              <FocusZone direction={FocusZoneDirection.vertical}>
                <List items={shownItems}
                  onRenderPage={onRenderPage}
                  /* onRenderSurface={onRenderSurface} */
                  // limited to 53, draft never shows more than 53 weeks. filter
                  getItemCountForPage={() => 53}
                />
              </FocusZone> :
              <StackItem>
                Empty list, create a new draft
              </StackItem>
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
        // editing a draft, load table page
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

// for list generation
const _getMenu = (menuProps: IContextualMenuProps): JSX.Element => {
  // Customize contextual menu with menuAs
  return <ContextualMenu {...menuProps} />;
};

export default DraftPage;

import * as React from 'react';
// react context
import {StoreData, IState} from "../FluentTesting";
// UI
import { Icon, FocusZone,
  FocusZoneDirection, TextField,
  List, IColumn, DetailsList,
  ITheme, mergeStyleSets,
  getTheme, getFocusStyle,
  StackItem, Stack, 
  Dropdown, IDropdownOption,
  Spinner, SelectionMode, DetailsRow,
  GroupedList, IGroup, DetailsListLayoutMode
} from 'office-ui-fabric-react';
// components
import EditPage from './EditPage';
// sample data types
import { IUserWeek, IUserWeeks, IUserYear, draftGroupList } from '../sampleData';
// theming
const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;
// styles
const classNames = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      cursor: 'pointer',
      borderBottom: `1px solid ${semanticColors.bodyDivider}`,
      display: 'flex',
      selectors: {
        '&:hover': { background: palette.neutralLight },
      },
    },
  ],
  itemImage: {
    flexShrink: 0,
  },
  itemContent: {
    marginLeft: 10,
    overflow: 'hidden',
    flexGrow: 1,
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 10,
    color: palette.neutralTertiary,
    fontSize: fonts.large.fontSize,
    flexShrink: 0,
  },
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

const initialState:IInitialState = {
  2020: [],
  2021: [],
  full: [],
  status: "idle"
}

const DraftPage: React.FunctionComponent<IDraftProps> = (props:IDraftProps) => {

  // context
  const {data:storeData}:{data: IState} = React.useContext(StoreData);

  // controlled states
  const [year, setYear] = React.useState<null | IDropdownOption>(null);
  const [statusFilter, setStatusFilter] = React.useState<null | IDropdownOption>(null);
  const [pageState, setPageState] = React.useState<string>("list");
  const [editItem, setEditItem] = React.useState<IUserWeek|null>(null);
  // list data, data list should be async set in production
  const [draftData, setDraftData] = React.useState<IInitialState>(initialState);
  const [shownItems, setShownItems] = React.useState<null | IUserWeek[]>(null);

  // year keys
  const controlledYear = [
    {key: "2020", text: "2020"},
    {key: "2021", text: "2021"},
    {key: "full", text: "All"},
  ];

  // status filter keys
  const controlledStatus = [
    {key: "draft", text: "Draft"},
    {key: "pending", text: "Pending"},
    {key: "approved", text: "Approved"},
    {key: "full", text: "All"},
  ];

  // column for list
  const columns: IColumn[] = [
    {
      key: 'column1',
      name: 'Year',
      fieldName: 'Year',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IUserWeek) => {
        return <span>{item.year}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column2',
      name: 'Week',
      fieldName: 'Week',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IUserWeek) => {
        return <span>{item.week}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Status',
      fieldName: 'Status',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      onRender: (item: IUserWeek) => {
        return <span>{item.status}</span>;
      },
      isPadded: true,
    }
  ];

  // render row in group
  const onRenderGroupRow = React.useCallback(
    (nestingDepth?: number, item?: IUserWeek, itemIndex?: number, group?: IGroup): React.ReactNode => {
      /* console.log(group, item) */
      return (
        <div/>
      )
    },
    [columns],
  );

  // set data
  React.useEffect(() => {
    if (year === null) {
      if (storeData.status === "loaded") {
        // get data from different year and make a list
        let weeksIn2020:IUserWeek[] = [];
        let weeksIn2021:IUserWeek[] = [];
        // objects with data
        let _data20:IUserWeeks = storeData.data["2020"];
        let _data21:IUserWeeks = storeData.data["2021"];
        // loop 2020 keys
        Object.keys(_data20).forEach((key) => {
          weeksIn2020.push(_data20[key]);
        });
        // loop 2021 keys
        Object.keys(_data21).forEach((key) => {
          weeksIn2021.push(_data21[key]);
        });
        // concat
        let fullWeeksArray:IUserWeek[] = weeksIn2020.concat(weeksIn2021);

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
    let arrayToSet:Array<IUserWeek> = draftData[item.key];

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
    let _arrayToFilter:IUserWeek[] = year ? draftData[year.key] : draftData["full"];
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
    setEditItem(weekData);

    setPageState("edit");
  };
  
  // filter
  const handleFilterChanged = (_: any, text: string): void => {

    // working data
    let _arrayToFilter:IUserWeek[] = year ? draftData[year.key] : draftData["full"];

    // filter by week
    setShownItems(_arrayToFilter.filter(weekItem => {
      return weekItem.week.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0;
    }));

  };

  // function to render a single list item
  const onRenderCell = (item: IUserWeek, index: number | undefined): JSX.Element => {

    return(
      <div className={classNames.itemCell} data-is-focusable={true} onClick={() => handleListItemClick(item)}>
        <div className={classNames.itemContent}>
          <div className={classNames.itemName}>{`Week: ${item.week}`}</div>
          <div className={classNames.itemIndex}>{`Year: ${item.year}`}</div>
          <div>{`Status: ${item.status}`}</div>
        </div>
        <Icon className={classNames.chevron} iconName={'ChevronRight'} />
      </div>
    );
  };

  return(
    <Stack>
      {
        pageState === "list" &&
        <>
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
            <List items={shownItems} onRenderCell={onRenderCell} />
            {/* <GroupedList
              items={shownItems}
              onRenderCell={onRenderGroupRow}
              groups={draftGroupList}
            /> */}
            {/* <DetailsList
              items={shownItems}
              columns={columns}
              isHeaderVisible={true}
              selectionMode={SelectionMode.none}
              layoutMode={DetailsListLayoutMode.justified}
              onRenderRow={(props) => {
                console.log(props);
                return (
                <div onClick={() => handleListItemClick(props.item)}>
                  <DetailsRow {...props}/>
                </div>)
              }}
            /> */}
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
          <EditPage
            editData={editItem}
            setState={setPageState}
          />
        </>
      }
    </Stack>
  )
};

export default DraftPage;
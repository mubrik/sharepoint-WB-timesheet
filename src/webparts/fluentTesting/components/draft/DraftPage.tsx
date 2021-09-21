import * as React from 'react';
// react context
import {StoreDispatch, StoreData, IState} from "../FluentTesting";
// UI
import { StackItem, Stack, 
  Dropdown, IDropdownOption,
  Spinner, Label
} from 'office-ui-fabric-react';
import { Icon, FocusZone, FocusZoneDirection, TextField, List } from 'office-ui-fabric-react';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react';
import EditPage from './EditPage';
// sample data types
import { IUserWeekData, IUserWeek, IUserWeeks, IUserYear } from '../sampleData';
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

const DraftPage: React.FunctionComponent<IDraftProps> = (props:IDraftProps) => {

  // context
  const storeData: IState = React.useContext(StoreData);
  const storeDispatch = React.useContext(StoreDispatch);
  console.log(storeData);

  // controlled states
  const [year, setYear] = React.useState<null | IDropdownOption>(null);
  const [pageState, setPageState] = React.useState<string>("list");
  const [editItem, setEditItem] = React.useState<IUserWeek|null>(null);
  // list data, data list should be async set in production
  const [dataList, setDataList] = React.useState<null | IUserWeek[]>(null);
  const [shownItems, setShownItems] = React.useState<null | IUserWeek[]>(null);

  // set data
  React.useEffect(() => {
    if (year === null) {
      if (storeData.status === "loaded") {
        // get data from different year and make a list
        let fullWeeksArray:IUserWeek[] = [];

        let _data20: IUserWeeks = storeData.data["2020"];
        let _data21: IUserWeeks = storeData.data["2021"];


        Object.keys(_data20).forEach((key) => {
          fullWeeksArray.push(_data20[key]);
        });
        
        Object.keys(_data21).forEach((key) => {
          fullWeeksArray.push(_data21[key]);
        });

        // set list 
        setDataList(fullWeeksArray);
        // set shown list
        setShownItems(fullWeeksArray);

      }

    }
  }, [storeData]);

  // year keys
  const controlledYear = [
    {key: "2020", text: "2020"},
    {key: "2021", text: "2021"},
  ];

  // handle item selected
  const handleYearChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
    // if no datat to work on
    if (dataList === null) return;

    setYear(item);
    let filteredYear:IUserWeek[] = [];

    dataList.forEach((weekItem) => {
      if (weekItem.year === Number(item.key)) {
        filteredYear.push(weekItem);
      }
    })

    setShownItems(filteredYear);
  };

  const handleListItemClick = (weekData: IUserWeek) => {
    setEditItem(weekData);

    setPageState("edit");
  };
  
  // filter
  const onFilterChanged = (_: any, text: string): void => {
    if (dataList === null) return;

    if (year) {
      // work with year filtered array
      setShownItems(dataList.filter(weekItem => {
        if (weekItem.year === Number(year.key)) {
          return weekItem.week.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }
        return false;
      }));
    } else {
      setShownItems(dataList.filter(weekItem => weekItem.week.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0));
    }
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
        <StackItem>
          <Dropdown
            selectedKey={year ? year.key : undefined}
            label="Select a Year"
            options={controlledYear}
            onChange={handleYearChange}
          />
        </StackItem>
        <StackItem>
          {shownItems && 
          <FocusZone direction={FocusZoneDirection.vertical}>
            <TextField
              label={'Filter by Week'}
              onChange={onFilterChanged}
              type={"number"}
            />
            <List items={shownItems} onRenderCell={onRenderCell} />
          </FocusZone>
          }

          {
            !shownItems && 
            <>
              <Spinner label={"Loading User Data"} ariaLive="assertive" labelPosition="top"></Spinner>
            </>
          }
        </StackItem>
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
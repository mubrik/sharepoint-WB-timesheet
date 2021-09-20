/* import * as React from 'react';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react';
import { Icon, FocusZone, FocusZoneDirection, TextField, List } from 'office-ui-fabric-react';
// types
import {ISampleList} from "./IPeriodProps";
// data
import {listData} from "./sampleData";

// theming
const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;

const classNames = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
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

// function to render a single list item
const onRenderCell = (item: ISampleList, index: number | undefined): JSX.Element => {

  return(
    <div className={classNames.itemCell} data-is-focusable={true}>
      <div className={classNames.itemContent}>
        <div className={classNames.itemName}>{item.Week}</div>
        <div className={classNames.itemIndex}>{item.Year}</div>
        <div>{item.Status}</div>
      </div>
      <Icon className={classNames.chevron} iconName={'ChevronRight'} />
    </div>
  );
};

const RenderProjectList: React.FunctionComponent = () => {

  // list data
  const [items, setItems] = React.useState(listData);
  // filter
  const onFilterChanged = (_: any, text: string): void => {
    setItems(listData.filter(item => item.Week.toLowerCase().indexOf(text.toLowerCase()) >= 0));
  };


  return(
    <FocusZone direction={FocusZoneDirection.vertical}>
      <TextField
        label={'Filter by Week'}
        onChange={onFilterChanged}
      />
      <List items={items} onRenderCell={onRenderCell} />
    </FocusZone>
  );
};

export default RenderProjectList; */
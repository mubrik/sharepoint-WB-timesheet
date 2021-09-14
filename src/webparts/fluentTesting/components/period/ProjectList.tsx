import * as React from 'react';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react';
import { Icon, FocusZone, FocusZoneDirection, TextField, List } from 'office-ui-fabric-react';

// types
interface ISampleList {
  project: string;
  location: string;
  task: string;
  description: string;
  freshservice: string;
}

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

// mock data for item
const samples: ISampleList[] = [
  {
    project: "testing filter word eggs",
    location: "testing blah blah",
    task: "testing blah blah",
    description: "testing blah blah",
    freshservice: "testing blah blah",
  },{
    project: "testing filter word yam",
    location: "testing blah blah",
    task: "testing blah blah",
    description: "testing blah blah",
    freshservice: "testing blah blah",
  },{
    project: "testing filter word eba",
    location: "testing blah blah",
    task: "testing blah blah",
    description: "testing blah blah",
    freshservice: "testing blah blah",
  },{
    project: "testing filter word food",
    location: "testing blah blah",
    task: "testing blah blah",
    description: "testing blah blah",
    freshservice: "testing blah blah",
  },{
    project: "testing filter word why",
    location: "testing blah blah",
    task: "testing blah blah",
    description: "testing blah blah",
    freshservice: "testing blah blah",
  },
]

// function to render a single list item
const onRenderCell = (item: ISampleList, index: number | undefined): JSX.Element => {

  return(
    <div className={classNames.itemCell} data-is-focusable={true}>
      <div className={classNames.itemContent}>
        <div className={classNames.itemName}>{item.project}</div>
        <div className={classNames.itemIndex}>{`Item ${index}`}</div>
        <div>{item.description}</div>
      </div>
      <Icon className={classNames.chevron} iconName={'ChevronRight'} />
    </div>
  );
};

const RenderProjectList: React.FunctionComponent = () => {

  const [items, setItems] = React.useState(samples);

  const onFilterChanged = (_: any, text: string): void => {
    setItems(samples.filter(item => item.project.toLowerCase().indexOf(text.toLowerCase()) >= 0));
  };


  return(
    <FocusZone direction={FocusZoneDirection.vertical}>
      <TextField
        label={'Filter by name'}
        onChange={onFilterChanged}
      />
      <List items={items} onRenderCell={onRenderCell} />
    </FocusZone>
  );
};

export default RenderProjectList;
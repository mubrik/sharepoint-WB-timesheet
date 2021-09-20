import { Stack, StackItem, IconButton } from '@microsoft/office-ui-fabric-react-bundle';
import * as React from 'react';
import ControlledFormPage from './NewForm';
import {INewFormProps, IListStore} from "./INewFormProps";

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
};

const MobileFormPage: React.FunctionComponent<INewFormProps> = (props:INewFormProps) => {

  // states [<ControlledFormPage key={0}/>]
  const [pageStore, setPageStore] = React.useState<IListStore>({list: [], current: null, next:null, previous:null});
  const [shownPage, setShownPage] = React.useState<React.ReactElement| null>(null);

  console.log(pageStore)
  // use effect to lift pageStore
  React.useEffect(() => {
    props.setDataApi(pageStore);
  },[pageStore])

  const handleNewClicked = () => {
    // copy array
    let storeArr = [...pageStore.list];
    // limit for now
    if (storeArr.length === 10) return;

    // generate key for react instance
    let newKey = getRandomInt(5000);
    // mutate array
    storeArr.push(<ControlledFormPage key={newKey} id={String(newKey)}/>);
    // if new
    if (storeArr.length === 1) {
      setPageStore(oldStore => {
        return {
          ...oldStore,
          list: storeArr,
          current: 0,
        };
      });

      setShownPage(storeArr[0]);
    } else {
      // calculate indexes of new list
      let [curr, next, prev] = calculateIndexes(storeArr);
  
      // update the store
      setPageStore(oldStore => {
        return {
          ...oldStore,
          list: storeArr,
          current: curr,
          next: next,
          previous: prev
        };
      });
    }

  };

  const handleNavigationClick = (param: string): void => {
    if (param === "next") {
      // change shown page
      if (pageStore.next === null) return;
      setShownPage(pageStore.list[pageStore.next]);

      // update store index
      let [curr, next, prev] = calculateIndexes(undefined, pageStore.list[pageStore.next]);
      setPageStore(oldStore => {
        return {
          ...oldStore,
          current: curr,
          next: next,
          previous: prev
        }
      });

    } else if (param === "prev") {
      // change shown page
      if (pageStore.previous === null) return;
      setShownPage(pageStore.list[pageStore.previous]);

      // update store index
      let [curr, next, prev] = calculateIndexes(undefined, pageStore.list[pageStore.previous]);
      setPageStore(oldStore => {
        return {
          ...oldStore,
          current: curr,
          next: next,
          previous: prev
        }
      });

    }
  };

  const handleDeleteClick = () => {

    if (shownPage === null) return;

    // copy current list and shown
    let _shownPageKey = shownPage.key;
    let _pageList = [...pageStore.list];
    // type number because 0 is falsy
    let _nextPageIndex = typeof pageStore.previous === "number" ? pageStore.previous : (pageStore.next || null);
    let _newShownPage = _nextPageIndex !== null ? _pageList[_nextPageIndex] : null;

    // mutate copied list
    let storArr = _pageList.filter((element) => element.key !== _shownPageKey);

    // show something else
    setShownPage(_newShownPage);

    // calculate new index from utated list and new show
    let [curr, next, prev] = calculateIndexes(storArr, _newShownPage);

    // store state
    setPageStore(oldStore => {
      return {
        ...oldStore,
        list: storArr,
        current: curr,
        next: next,
        previous: prev
      };
    });
  };

  const calculateIndexes = (pageList?: React.ReactElement[], currentPage?:React.ReactElement): null|number[] => {
    
    // list and elem to be used, if given or state
    let _pageListCopy = pageList ? pageList : [...pageStore.list];
    let _pageShown = currentPage ? currentPage : shownPage;

    // return if nothing is showing, list is empty
    if (_pageShown === null || _pageListCopy.length === 0) return [null, null, null];

    // variables 
    let nextIndex: null | number;
    let prevIndex: null | number;

    // get details
    let shownPageKey = _pageShown.key;
    let shownPageIndex = _pageListCopy.findIndex(elem => elem.key === shownPageKey);
    
    // logiccc  thic
    if (_pageListCopy.length === 1) {
      // if list only contains one item no next or foward
      prevIndex = null;
      nextIndex = null;
    } else if (_pageListCopy.length >= 2) {
      // if list >= 2 no previous is cur page index is 0,
      prevIndex = shownPageIndex === 0 ? null : shownPageIndex - 1;
      nextIndex =  (shownPageIndex + 1) === _pageListCopy.length ? null : shownPageIndex + 1;
    }

    return [shownPageIndex, nextIndex, prevIndex]
  };

  return(
    <Stack horizontalAlign={"stretch"} tokens={{ childrenGap: 7, padding: 4 }}>
      <StackItem>
        {shownPage}
      </StackItem>
      <Stack horizontal wrap={true} tokens={{ childrenGap: 4, padding: 4 }} horizontalAlign={"space-evenly"}>
        <IconButton disabled={pageStore.previous === null} iconProps={{ iconName: 'ChromeBack' }} onClick={() => handleNavigationClick("prev")}/>  
        <IconButton disabled={shownPage === null} iconProps={{ iconName: 'Delete' }} onClick={handleDeleteClick}/> 
        <IconButton iconProps={{ iconName: 'NewFolder' }} onClick={handleNewClicked}/> 
        <IconButton disabled={pageStore.next === null} iconProps={{ iconName: 'ChromeBackMirrored' }} onClick={() => handleNavigationClick("next")}/>  
      </Stack>
    </Stack>
  );
};

export default MobileFormPage;
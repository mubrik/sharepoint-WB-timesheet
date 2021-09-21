import * as React from 'react';
// react context
import {StoreDispatch} from "../FluentTesting";
// ui
import { PrimaryButton, Stack, StackItem, Label } from 'office-ui-fabric-react';
import TableForm from '../form/TableForm';
// gridtable
import { GridApi} from "@ag-grid-community/all-modules";
//types
import { IUserWeek, IUserWeekData } from '../sampleData';
// utiliity
import {delay, weekToDate} from "../utils/utils";
import {useGetDatesHook} from "../utils/reactHooks";

interface IProps {
  editData?: IUserWeek;
  setState?: React.Dispatch<React.SetStateAction<string>>;
}

const EditPage:React.FunctionComponent<IProps> = (props:IProps) => {
  // dispatch store
  const dispatchStore = React.useContext(StoreDispatch);
  // grid api/mobile data store to control saving data
  const [gridApi, setGridApi] = React.useState<null | GridApi>(null);

  // prepare data
  let _week = props.editData.week;
  let _year = props.editData.year;

  // get date obj
  let _newDate = weekToDate(_year, _week);
  let selectedDates = useGetDatesHook(_newDate);

  // handle save clicked
  const handleSaveClick = () => {
  
    // data valid
    if (_year === null || _week === null) return;

    let _weekData: IUserWeekData[] = [];

    // use grid api
    gridApi.forEachNode((rowNode, index) => {
      _weekData.push({
        ...rowNode.data
      });
    });

    // data
    let _postData: IUserWeek = {
      week: _week,
      year: _year,
      data: _weekData,
      status: "draft"
    };

    // emulating a post request to a server  that returns successful instance
    let response = delay(3000, _postData);

    response.then(result => {
      console.log(result);
      dispatchStore({
        type: "updateWeek",
        payload:{data: result}
      })
    })
  };

  const handleBackClicked = () => {
    props.setState((oldValue) => {
      if (oldValue === "editDraft") {
        return "new"
      }
      return "list"
    })
  };

  return(
    <Stack tokens={{ childrenGap: 10, padding: 8 }}>
      <StackItem>
        <PrimaryButton text={"Back"} onClick={handleBackClicked}/>
        <Label>
          {selectedDates ? 
          `${selectedDates[0].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})} to 
          ${selectedDates[6].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})}` :
          "Select A Date"
          }
        </Label>
      </StackItem>
      <StackItem>
        <TableForm
          editData={props.editData}
          setDataApi={setGridApi}
          dateObj={_newDate}
        />
      </StackItem>
      <StackItem>
        <PrimaryButton text={"Update Draft"} onClick={handleSaveClick} disabled={(_year === null || _week === null)}/>
      </StackItem>
    </Stack>
  )
};

export default EditPage;
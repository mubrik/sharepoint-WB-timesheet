import * as React from 'react';
// react context
import {StoreDispatch} from "../FluentTesting";
// ui
import { PrimaryButton, Stack, StackItem } from '@microsoft/office-ui-fabric-react-bundle';
import TableForm from '../form/TableForm';
// gridtable
import { GridApi} from "@ag-grid-community/all-modules";
//types
import { IUserWeek, IUserWeekData } from '../sampleData';
// utiliity
import {delay} from "../utils/utils";

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

  return(
    <Stack>
      <StackItem>
        <PrimaryButton text={"Back"} onClick={() => props.setState("list")}/>
      </StackItem>
      <StackItem>
        <TableForm
          editData={props.editData}
          setDataApi={setGridApi}
          dateObj={new Date()}
        />
      </StackItem>
      <StackItem>
        <PrimaryButton text={"Save Sheet"} onClick={handleSaveClick} disabled={(_year === null || _week === null)}/>
      </StackItem>
    </Stack>
  )
};

export default EditPage;
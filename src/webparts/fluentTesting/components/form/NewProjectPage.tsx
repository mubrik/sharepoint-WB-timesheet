import * as React from 'react';
import {Label, Stack, StackItem} from 'office-ui-fabric-react';
import ControlledFormPage from "./NewForm";

// types
import {INewFormProps} from "./INewFormProps";
// hooks
import {useGetDatesHook} from "./reactHooks";

const NewProjectPage: React.FunctionComponent<INewFormProps> = (props: INewFormProps) => {

  // get week dates from selected date
  const selectedDates = useGetDatesHook(props.dateObj);
  let options = {year: 'numeric', month: 'long', day: 'numeric' };

  return(
    <Stack tokens={{ childrenGap: 7 }}>
      <StackItem align={"center"}>
        <Label>
          {selectedDates ? 
          `${selectedDates[0].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})} to 
          ${selectedDates[6].toLocaleString('en-GB', {year: "numeric", weekday: "long", month: "long", day: "numeric"})}` :
          "Select A Date"
          }
        </Label>
      </StackItem>
      <StackItem align={"center"}>
        <ControlledFormPage
          dateObj={props.dateObj}
        />
      </StackItem>
    </Stack>
  );
};


export default NewProjectPage;
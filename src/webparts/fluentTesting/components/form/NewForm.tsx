import * as React from 'react';
import { TextField, MaskedTextField, Stack } from 'office-ui-fabric-react';
import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles } from 'office-ui-fabric-react';
import TableForm from './TableForm';
// types
import {INewFormProps} from "./INewFormProps";
// hooks
import {useGetDatesHook} from "./reactHooks";

const dropdownControlledExampleOptions = [
  { key: 'fruitsHeader', text: 'Fruits', itemType: DropdownMenuItemType.Header },
  { key: 'apple', text: 'Apple' },
  { key: 'banana', text: 'Banana' },
  { key: 'orange', text: 'Orange', disabled: true },
  { key: 'grape', text: 'Grape' },
  { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
  { key: 'vegetablesHeader', text: 'Vegetables', itemType: DropdownMenuItemType.Header },
  { key: 'broccoli', text: 'Broccoli' },
  { key: 'carrot', text: 'Carrot' },
  { key: 'lettuce', text: 'Lettuce' },
];

const ControlledFormPage: React.FunctionComponent<INewFormProps> = (props: INewFormProps) => {

  // states, should use a reducer instead later
  /* const [project, setProject] = React.useState<IDropdownOption>();
  const [location, setLocation] = React.useState<IDropdownOption>();
  const [task, setTask] = React.useState<IDropdownOption>();
  const [freshservice, setFreshservice] = React.useState('');
  const [description, setDescription] = React.useState(''); */

  return(
    <>
      {/* <form noValidate>
        <Stack horizontal tokens={{ childrenGap: 7 }} wrap={true} horizontalAlign={"space-evenly"}>
          <Dropdown
            label="Project"
            placeholder={"Select A Project"}
            selectedKey={project ? project.key : undefined}
            options={dropdownControlledExampleOptions}
            onChange={(event, item) => setProject(item)}
          />
          <Dropdown
            label="location"
            placeholder={"Select A location"}
            selectedKey={location ? location.key : undefined}
            options={dropdownControlledExampleOptions}
            onChange={(event, item) => setLocation(item)}
          />
          <Dropdown
            label="task"
            placeholder={"Select A task"}
            selectedKey={task ? task.key : undefined}
            options={dropdownControlledExampleOptions}
            onChange={(event, item) => setTask(item)}
          />
          <TextField
            label={"freshservice reference"}
            value={freshservice}
            onChange={(event, newValue) => {setFreshservice(newValue);}}
          />
        </Stack>
        <Stack horizontalAlign={"stretch"}>
          <TextField
            label={"description"}
            value={description}
            onChange={(event, newValue) => {setDescription(newValue);}}
          />
        </Stack>
        <ControlledDayForm
          dateObj={props.dateObj}
        />
      </form> */}
      <Stack>
        <TableForm
          dateObj={props.dateObj}
        />
      </Stack>
      </>
  );
};

const ControlledDayForm: React.FunctionComponent<INewFormProps> = (props: INewFormProps) => {

  // states, should use a reducer instead later
  const [mon, setMon] = React.useState(0);
  const [tue, setTue] = React.useState(0);
  const [wed, setWed] = React.useState(0);
  const [thu, setThu] = React.useState(0);
  const [fri, setFri] = React.useState(0);
  const [sat, setSat] = React.useState(0);
  const [sun, setSun] = React.useState(0);
  // array of dates in period
  let selecteddates = useGetDatesHook(props.dateObj);

  const formatLabel = (day: string, index: number):string => {
    // if date is null for some reason
    if (selecteddates === null) {
      return `${day} - `
    };

    return `${day}-${selecteddates[index].toLocaleDateString()}`
  };

  return(
    <Stack horizontal tokens={{ childrenGap: 2 }} wrap={true} horizontalAlign={"space-evenly"}>
      <MaskedTextField label={formatLabel("sun", 0)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setSun(Number(newValue))}/>
      <MaskedTextField label={formatLabel("mon", 1)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setMon(Number(newValue))}/>
      <MaskedTextField label={formatLabel("tue", 2)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setTue(Number(newValue))}/>
      <MaskedTextField label={formatLabel("wed", 3)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setWed(Number(newValue))}/>
      <MaskedTextField label={formatLabel("thu", 4)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setThu(Number(newValue))}/>
      <MaskedTextField label={formatLabel("fri", 5)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setFri(Number(newValue))}/>
      <MaskedTextField label={formatLabel("sat", 6)} mask="h\h-mm: (99).(99)" onChange={(event, newValue) => setSat(Number(newValue))}/>
    </Stack>
  );
};

export default ControlledFormPage;
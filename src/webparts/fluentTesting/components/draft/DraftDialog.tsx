import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
} from "office-ui-fabric-react";
import { IStoreYearWeekItem } from "../dataTypes";
// react context
import {
  DateContext,
  TableDataContext,
} from "../FluentTesting";
import { weekToDate } from "../utils/utils";

const dialogContentProps = {
  type: DialogType.largeHeader,
  title: "Missing Subject",
  closeButtonAriaLabel: "Close",
  subText: "Do you want to send this message without a subject?",
};

interface IDialogProps {
  hidden: boolean;
  weekData: IStoreYearWeekItem;
  setPageState: (value: React.SetStateAction<string>) => void;
  setDraftDialog: React.Dispatch<React.SetStateAction<any>>;
}

const DraftDialog: React.FunctionComponent<IDialogProps> = (
  props: IDialogProps
) => {
  // dialog state
  const [dialogData, setDialogData] = React.useState({
    title: "",
    subText: "",
    weekData: props.weekData,
    type: DialogType.largeHeader,
  });
  // context data
  const {
    setDate,
  }: { setDate: React.Dispatch<React.SetStateAction<null | Date>> } =
    React.useContext(DateContext);
  const {
    setTableData,
  }: {
    setTableData: React.Dispatch<React.SetStateAction<number[] | []>>;
  } = React.useContext(TableDataContext);

  //effect for setting data
  React.useEffect(() => {
    // data from props
    let _weekData = props.weekData;
    let _hidden = props.hidden;
    console.log(props);

    if (!_hidden) {
      // set data
      setDialogData((oldData) => {
        return {
          ...oldData,
          title: `Draft for week ${_weekData.week} year ${_weekData.year}`,
          subText: `Draft is currently ${_weekData.status}`,
          weekData: _weekData,
        };
      });
    }
  }, [props.hidden]);

  // handlers
  // handle open
  const handleDraftOpen = () => {
    // get date from week
    let _week = dialogData.weekData.week;
    let _year = dialogData.weekData.year;
    // date
    let _date = weekToDate(+_year, +_week);
    // set date
    setDate(_date);
    // set table data
    console.log(dialogData);
    setTableData(dialogData.weekData.itemIds);
    // change draft state
    props.setPageState("edit");
    // dismiss dialog
    props.setDraftDialog((oldData) => {
      return {
        ...oldData,
        hidden: true,
      };
    });
  };
  // handle dismiss
  const handleDismiss = () => {
    // update state to dismiss
    props.setDraftDialog({ hidden: true, data: null });
  };

  return (
    <>
      <Dialog
        hidden={props.hidden}
        onDismiss={handleDismiss}
        dialogContentProps={dialogData}
        minWidth={"320"}
      >
        <DialogFooter>
          <PrimaryButton text={"Open Draft"} onClick={handleDraftOpen} />
          <PrimaryButton text={"Send Approval"} />
          <DefaultButton text={"Cancel"} onClick={handleDismiss} />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default DraftDialog;

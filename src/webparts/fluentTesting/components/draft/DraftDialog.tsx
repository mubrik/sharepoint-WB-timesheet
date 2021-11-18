import * as React from "react";
// ui
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
} from "office-ui-fabric-react";
// types
import { ISpUserPeriodData } from "../../controller/serverTypes";
// react context
import {
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
  weekData: ISpUserPeriodData;
  setPageState: (value: React.SetStateAction<string>) => void;
  setDraftDialog: React.Dispatch<React.SetStateAction<any>>;
}

const DraftDialog: React.FunctionComponent<IDialogProps> = (
  {
    hidden, weekData,
    setDraftDialog, setPageState
  }: IDialogProps
) => {
  // dialog state
  const [dialogData, setDialogData] = React.useState({
    title: "",
    subText: "",
    weekData: weekData,
    type: DialogType.largeHeader,
  });
  // context data
  const {
    setTableData,
  } = React.useContext(TableDataContext);

  //effect for setting data
  React.useEffect(() => {
    // data from props
    const _weekData = {...weekData};

    if (!hidden) {
      // set data
      setDialogData((oldData) => {
        return {
          ...oldData,
          title: `Draft for Year ${_weekData.year} Week ${_weekData.week} `,
          subText: `This item status is currently ${_weekData.status}`,
          weekData: _weekData,
        };
      });
    }
  }, [hidden]);

  // handlers
  // handle open
  const handleDraftOpen = (): void => {
    // set table data
    console.log(dialogData);
    setTableData(dialogData.weekData);
    // change draft state
    setPageState("edit");
    // dismiss dialog
    setDraftDialog((oldData) => {
      return {
        ...oldData,
        hidden: true,
      };
    });
  };
  // handle dismiss
  const handleDismiss = (): void => {
    // update state to dismiss
    setDraftDialog({ hidden: true, data: null });
  };

  return (
    <>
      <Dialog
        hidden={hidden}
        onDismiss={handleDismiss}
        dialogContentProps={dialogData}
        minWidth={"320"}
      >
        <DialogFooter>
          <PrimaryButton text={"Open Draft"} onClick={handleDraftOpen} />
          <DefaultButton text={"Cancel"} onClick={handleDismiss} />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default DraftDialog;

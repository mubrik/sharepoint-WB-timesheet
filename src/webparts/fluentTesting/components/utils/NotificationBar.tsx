// depreceated
import * as React from "react";
import { MessageBar, MessageBarType } from "office-ui-fabric-react";

interface INotificationProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  msg: string;
  barType: MessageBarType;
}

const NotificationBar: React.FunctionComponent<INotificationProps> = (
  props: INotificationProps
) => {
  const { show, setShow, msg, barType } = props;

/*   // notification state
  const [visible, setVisible] = React.useState(show ? show : false); */
  // handle dismiss
  const onDismiss = () => {
    setShow(false);
  };

  return (
    <>
      {show && (
        <MessageBar
          messageBarType={barType}
          isMultiline={false}
          onDismiss={onDismiss}
          dismissButtonAriaLabel="Close"
        >
          {msg}
        </MessageBar>
      )}
    </>
  );
};

// export default NotificationBar;

import * as React from "react";
import {MessageBar,
  MessageBarType,
} from 'office-ui-fabric-react';

interface INotificationProps {
  show: boolean;
  msg: string;
  barType: MessageBarType;
}

const NotificationBar:React.FunctionComponent<INotificationProps> = (props:INotificationProps) => {

  let {show, msg, barType} = props;

  // notification state
  const [visible, setShow] = React.useState(show ? show : false);
  // handle dismiss
  const onDismiss = () => {
    setShow(false);
  }

  return(
    <>
    {
      visible &&
      <MessageBar
        messageBarType={barType}
        isMultiline={false}
        onDismiss={onDismiss}
        dismissButtonAriaLabel="Close"
      >
        {msg}
      </MessageBar>
    }
    </>
  )
};

export default NotificationBar;
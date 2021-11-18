import * as React from "react";
// context
import {NotificationContext} from "./NotificationBar";

// lazy but
// incase i have to tweak the context, so i wouldnt need to comb code to reimport
const useNotificationHook = () => {
  // context
  const setNotification = React.useContext(NotificationContext);

  if (!setNotification) {
    return null;
  }

  return setNotification;
};

export default useNotificationHook;

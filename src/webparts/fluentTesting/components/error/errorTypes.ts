// just a custom clas, not necessary
import useNotificationHook from "../notification/hook";

class CustomError extends Error {

  public name: string;
  public errorInfo: string;

  // constructor
  public constructor (message?: string, info?: string, name?: string) {
      // call super
      super(message);
      this.name = name? name : "CustomError";
      this.errorInfo = info ? info : "Base error";
      // Set the prototype explicitly.
      Object.setPrototypeOf(this, new.target.prototype);
  }
}
// any casue typescript doesnt specify error type, specified in func
// ignore for now, stupid me, cant use hook in normal func?
export const errorHandler = (error: any): void => {
  // notification
  const notify  = useNotificationHook();
  // needed for typescript to catch type
  if (error instanceof CustomError) {
  // if custom error
    notify({isError: true, errorObj: error, msg: error.message, show: true});
  } else {
  // error i'm not throwing
    notify({isError: true, errorObj: error, msg: "Error occured", show: true});
  }
};

export default CustomError;
import * as React from "react";

interface IErrorProps {
  children: React.ReactNode;
}

interface IErrorState {
  hasError: boolean;
  errorObj: Error|null;
  errorMsg: string;
}
// if webpart encounters error that can lead to crash
class ErrorBoundary extends React.Component<IErrorProps, IErrorState> {

  public state: IErrorState = {
    hasError: false,
    errorObj: null,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): IErrorState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      errorObj: error,
      errorMsg: error.message
    };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log("caught an err");

    console.error("Uncaught error:", error, info);
    // Display fallback UI
    this.setState({ hasError: true, errorMsg: error.message });
    // You can also log the error to an error reporting service
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h4> Something went wrong </h4>
          <details style={{ whiteSpace: "pre-wrap" }}>
              <summary style={{ cursor: "pointer", fontSize: "18px" }}> View error details 🐞 </summary>
              <pre>
                  {this.state.hasError && this.state.errorObj.toString()}
                  <br />
                  {this.state.errorMsg}
              </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

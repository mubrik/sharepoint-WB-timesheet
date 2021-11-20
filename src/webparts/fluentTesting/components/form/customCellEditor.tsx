import * as React from "react";
// aggrid
import { ValueFormatterParams } from "@ag-grid-community/core";

interface IEditorProps extends React.ComponentPropsWithoutRef<any> {
  children?: React.ReactNode;
}

const TimeEditor = React.forwardRef((props: IEditorProps, ref) => {
  // check for prop value
  const timeVal = props.value ? parseFloat(props.value) : 0;
  // states
  const [inputValue, setInputValue] = React.useState<number>(timeVal);
  const refInput = React.useRef(null);

  React.useEffect(() => {
    // focus on the input
    setTimeout(() => refInput.current.focus());
  }, []);

  /* Component Editor Lifecycle methods */
  React.useImperativeHandle(ref, () => {
    return {
      // the final value to send to the grid, on completion of editing
      getValue() {
        return inputValue;
      },

      // Gets called once before editing starts, to give editor a chance to
      // cancel the editing before it even starts.
      isCancelBeforeStart() {
        return false;
      },

      // Gets called once when editing is finished (eg if Enter is pressed).
      // If you return true, then the result of the edit will be ignored.
      isCancelAfterEnd() {
        // our editor will reject any value greater than 24
        if (inputValue > 24 || inputValue < 0) {
          return true;
        }

        const valueString = inputValue.toString();
        // anything not in 0.0, 10.0 is invalid
        if (valueString.length >= 4) {
          return true;
        }
        // a decimal is only way length === 3 if val 0 < 24
        if (valueString.length === 3) {
          // limited for now
          const [_hour, _minute] = valueString.split(".");

          if (Number(_minute) > 6) {
            return true;
          }
        }
        /* return false; */
      },
    };
  });

  const parseValue = (param: string): number => {
    if (Number.isNaN(Number.parseFloat(param))) {
      return 0;
    }

    return parseFloat(param);
  };

  return (
    <input
      type="number"
      min={0}
      max={24}
      placeholder="H.M"
      ref={refInput}
      value={inputValue}
      onChange={(event) => setInputValue(parseValue(event.target.value))}
      style={{ width: "100%" }}
    />
  );
});

TimeEditor.displayName = "Time Editor";

const timeValueFormatter = (event: ValueFormatterParams): string => {
  const _numberValue: number = event.value ? event.value : null;

  if (_numberValue === null) return "";

  const _numberString = _numberValue.toString();

  if (_numberString.length <= 2) {
    return `${_numberValue} Hrs`;
  }

  if (_numberString.length === 3) {
    // split
    const [_hour, _minute] = _numberString.split(".");

    if (Number(_hour) === 0) {
      return `${Number(_minute) * 10} Mins`;
    }

    return `${Number(_hour)}h ${Number(_minute) * 10}m`;
  }
};

export default TimeEditor;
export { timeValueFormatter };

import * as React from "react";
// aggrid
import { ValueFormatterParams } from "@ag-grid-community/core";
// utils
import { valueToSeconds } from "../utils/utils";

interface IEditorProps extends React.ComponentPropsWithoutRef<any> {
  children?: React.ReactNode;
}

const TimeEditor = React.forwardRef((props: IEditorProps, ref) => {
  // check for prop value
  let timeVal = props.value ? parseFloat(props.value) : 0;

  const [value, setValue] = React.useState<string>("");
  const [valuetest, setValueTest] = React.useState<number>(timeVal);
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
        return valuetest;
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
        if (valuetest > 24 || valuetest < 0) {
          return true;
        }

        let valueString = valuetest.toString();
        // anything not in 0.0, 10.0 is invalid
        if (valueString.length >= 4) {
          return true;
        }
        // a decimal is only way length === 3 if val 0 < 24
        if (valueString.length === 3) {
          // limited for now
          let [_hour, _minute] = valueString.split(".");

          if (Number(_minute) > 6) {
            return true;
          }
        }
        /* return false; */
      },
    };
  });

  const parseValue = (value: string): number => {
    if (Number.isNaN(Number.parseFloat(value))) {
      return 0;
    }

    return parseFloat(value);
  };

  return (
    <input
      type="number"
      min={0}
      max={24}
      placeholder="H.M"
      ref={refInput}
      value={valuetest}
      onChange={(event) => setValueTest(parseValue(event.target.value))}
      style={{ width: "100%" }}
    />
  );
});

const timeValueFormatter = (event: ValueFormatterParams) => {
  let _numberValue: number = event.value ? event.value : null;

  if (_numberValue === null) return "";

  let _numberString = _numberValue.toString();

  if (_numberString.length <= 2) {
    return `${_numberValue} Hrs`;
  }

  if (_numberString.length === 3) {
    // split
    let [_hour, _minute] = _numberString.split(".");

    if (Number(_hour) === 0) {
      return `${Number(_minute) * 10} Mins`;
    }

    return `${Number(_hour)}h ${Number(_minute) * 10}m`;
  }
};

export default TimeEditor;
export { timeValueFormatter };

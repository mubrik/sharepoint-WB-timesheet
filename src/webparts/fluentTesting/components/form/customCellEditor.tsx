import * as React from 'react';
// utils
import {valueToSeconds} from "../utils/utils";

interface IEditorProps extends React.ComponentPropsWithoutRef<any> {
  children?: React.ReactNode;
}

const TimeEditor = React.forwardRef((props: IEditorProps, ref) => {

  // check for prop value
  let timeVal = props.value ? parseFloat(props.value).toFixed(1) : "0";

  const [value, setValue] = React.useState<string>(timeVal);
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
            return value;
          },

          // Gets called once before editing starts, to give editor a chance to
          // cancel the editing before it even starts.
          isCancelBeforeStart() {
            return false;
          },

          // Gets called once when editing is finished (eg if Enter is pressed).
          // If you return true, then the result of the edit will be ignored.
          isCancelAfterEnd() {
            // our editor will reject any value greater than 1000
            /* return value > 24; */
            return false;
          }
      };
  });

  const parseValue = (value:string):string => {
    if (!value) return "0";

    if (Number.isNaN(Number.parseFloat(value))) {
      return "0";
    }

    let [hours, minutes, total] = valueToSeconds(value);
    // hours shouldnt exxceed day
    if (hours > 86000) {return "24.0"}

    return parseFloat(value).toFixed(1);
  };

  return (
      <input type="number"
        min={0}
        max={24}
        /* step={0.1} */
        placeholder="H.M"
        ref={refInput}
        value={value}
        onChange={event => setValue(parseValue(event.target.value))}
        style={{width: "100%"}}
      />
  );
});

const numberParser = (params): Number => {
  return Number(params.newValue);
};

export default TimeEditor;
export {numberParser}
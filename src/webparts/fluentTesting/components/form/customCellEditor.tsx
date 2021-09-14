import * as React from 'react';

interface IEditorProps extends React.ComponentPropsWithoutRef<any> {
  children?: React.ReactNode;
}

const TimeEditor = React.forwardRef((props: IEditorProps, ref) => {

  const [value, setValue] = React.useState(parseFloat(props.value));
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
            return value > 24;
          }
      };
  });

  const parseValue = (value:string):number => {
    return Number(parseFloat(value).toFixed(2));
  };

  return (
      <input type="number"
        min={0.0}
        max={24.0}
        step={0.1}
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
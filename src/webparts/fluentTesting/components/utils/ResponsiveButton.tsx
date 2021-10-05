import * as React from "react";
import {
  PrimaryButton,
  IconButton,
  IButtonProps,
} from "office-ui-fabric-react";
import { useMediaQuery } from "react-responsive";

const ResponsivePrimaryButton: React.FunctionComponent<IButtonProps> = (
  props: IButtonProps
) => {
  // responsive query
  const medium = useMediaQuery({ maxWidth: 479 });

  return (
    <>{medium ? <IconButton {...props} /> : <PrimaryButton {...props} />}</>
  );
};

export default ResponsivePrimaryButton;

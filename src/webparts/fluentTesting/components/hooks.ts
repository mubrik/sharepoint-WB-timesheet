// hook for importing nuser data
import * as React from "react";
import { UserDataContext } from "./FluentTesting";
import { IUserData } from "./dataTypes";

export const useGetUserData = (): IUserData  => {
  // context
  const data = React.useContext(UserDataContext);

  return data;
};
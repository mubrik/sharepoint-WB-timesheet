import * as React from 'react';
import { Label, IPivotItemProps, Pivot, PivotItem } from 'office-ui-fabric-react';
import {INavProps} from "./INavProps";

export const NavBar: React.FunctionComponent<INavProps> = (props:INavProps) => {

    return(
        <div>
          <Pivot
            aria-label={"pivot"}
            onLinkClick={(item) => {props.setPageState(item.props.itemKey)}}
          >
            <PivotItem headerText="Period" itemKey="period"/>
            <PivotItem headerText="New" itemKey="new"/>
            <PivotItem headerText="Draft" itemKey="drafts"/>
          </Pivot>
        </div>
    );
};


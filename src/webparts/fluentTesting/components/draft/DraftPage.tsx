import * as React from 'react';
import {
  DetailsList,
 Stack, DetailsListLayoutMode
} from 'office-ui-fabric-react';
import {listData, columnData} from "./dataList";

const DraftPage: React.FunctionComponent = () => {

  return(
    <Stack>
      <DetailsList
        items={listData}
        columns={columnData}
        setKey="id"
        layoutMode={DetailsListLayoutMode.justified}
      />
    </Stack>
  )
};

export default DraftPage;
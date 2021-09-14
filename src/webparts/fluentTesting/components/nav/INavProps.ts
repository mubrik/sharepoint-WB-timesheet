import * as React from 'react';

export interface INavProps {
    pageState: string;
    setPageState: React.Dispatch<React.SetStateAction<string>>
}
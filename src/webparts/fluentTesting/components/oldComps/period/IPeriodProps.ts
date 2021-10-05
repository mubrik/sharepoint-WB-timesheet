import {IComboBoxOption} from 'office-ui-fabric-react';

export interface periodInputProps {
    options: IComboBoxOption[];
    setOptions: React.Dispatch<React.SetStateAction<IComboBoxOption[]>>;
    selectedKey: string | number | undefined;
    setSelectedKey: React.Dispatch<React.SetStateAction<IComboBoxOption>>;
}

export interface periodPageProps {
    periodSelected?: IComboBoxOption;
    setPeriodSelected?: React.Dispatch<React.SetStateAction<IComboBoxOption>>;
    dateObj: Date;
    setDate: React.Dispatch<React.SetStateAction<Date>>;
}

export interface IDateInputProps {
    dateObj: Date;
    setDate: React.Dispatch<React.SetStateAction<Date>>;
}



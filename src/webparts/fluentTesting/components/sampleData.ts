// types
export interface IUserWeekData {
  id: number;
  Project: string;
  Location: string;
  Task: string;
  Description?: string;
  FreshService?: string;
}

export interface IUserYear {
  [index: string]: IUserWeeks;
}

export interface IUserWeeks {
  [index: string]: IUserWeek;
}

export interface IUserWeek {
    week: number;
    year: number;
    status: string;
    data: IUserWeekData[]
};

// data
const times = {
  "monday": 1,
  "tuesday": 1,
  "wednesday": 1,
  "thursday": 1,
  "friday": 1,
  "saturday": 1,
  "sunday": 1,
}

export const listData:IUserWeekData[] = [
  {id: 0, Project: "IT End User Support", Location: "Remote", Task:"SuccessFactors", ...times },
  {id: 1, Project: "IT End User Support", Location: "Obajana",  Task:"SuccessFactors", ...times },
  {id: 2, Project: "Troubleshooting", Location: "Ibese",  Task:"Weighbridge", ...times },
  {id: 3, Project: "IT End User Support", Location: "Ibese",  Task:"Weighbridge", ...times },
  {id: 4, Project: "IT End User Support", Location: "Obajana",  Task:"Weighbridge", ...times },
  {id: 5, Project: "Troubleshooting", Location: "Ibese",  Task:"Weighbridge", ...times },
  {id: 6, Project: "IT End User Support", Location: "Remote",  Task:"Weighbridge", ...times },
];

export const testData:IUserYear = {
  "2020": {
    "1": {
      week: 1,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "2": {
      week: 2,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "3": {
      week: 3,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    }
  },
  "2021": {
    "1": {
      week: 1,
      year: 2021,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "2": {
      week: 2,
      year: 2021,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "3": {
      week: 3,
      year: 2021,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "4": {
      week: 4,
      year: 2021,
      status: "draft",
      data: [
        ...listData
      ]
    }
  }
}
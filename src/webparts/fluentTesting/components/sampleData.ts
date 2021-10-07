import { IGroup } from "office-ui-fabric-react";
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
  "monday": "1.0",
  "tuesday": "1.0",
  "wednesday": "1.0",
  "thursday": "1.0",
  "friday": "1.0",
  "saturday": "1.0",
  "sunday": "1.0",
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
    },
    "4": {
      week: 4,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "5": {
      week: 5,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "6": {
      week: 6,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "7": {
      week: 7,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "8": {
      week: 8,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "9": {
      week: 9,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "10": {
      week: 10,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "12": {
      week: 12,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "13": {
      week: 13,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "14": {
      week: 14,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "17": {
      week: 17,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "18": {
      week: 18,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "19": {
      week: 19,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "20": {
      week: 20,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "22": {
      week: 22,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "23": {
      week: 23,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "24": {
      week: 24,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "25": {
      week: 25,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "30": {
      week: 30,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "31": {
      week: 31,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "41": {
      week: 41,
      year: 2020,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "42": {
      week: 42,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "43": {
      week: 43,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "44": {
      week: 44,
      year: 2020,
      status: "draft",
      data: [
        ...listData
      ]
    },
    "45": {
      week: 45,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "46": {
      week: 46,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "47": {
      week: 47,
      year: 2020,
      status: "pending",
      data: [
        ...listData
      ]
    },
    "48": {
      week: 48,
      year: 2020,
      status: "approved",
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
      status: "pending",
      data: [
        ...listData
      ]
    },
    "3": {
      week: 3,
      year: 2021,
      status: "pending",
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
    },
    "5": {
      week: 5,
      year: 2021,
      status: "approved",
      data: [
        ...listData
      ]
    },
    "6": {
      week: 6,
      year: 2021,
      status: "approved",
      data: [
        ...listData
      ]
    }
  }
}

const group20:IGroup = {
  key: "2020",
  count: 53,
  name: "2020",
  startIndex: 0
}
const group21:IGroup = {
  key: "2021",
  count: 53,
  name: "2021",
  startIndex: 0
}
export const draftGroupList: IGroup[] = [group20, group21]
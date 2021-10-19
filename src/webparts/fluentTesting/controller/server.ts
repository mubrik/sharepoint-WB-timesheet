import { sp, Lists, ILists } from "@pnp/sp/presets/core";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IUserWeek } from "../components/sampleData";

const LIST_COLUMNS = [
  "User", "Week", "Status", "Projects", "Description",
  "Task", "Location", "FreshService", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "Year", "Id"
];

/* interface */
export interface IServer {
  fetch: typeof sp;
  context: WebPartContext|null;
  getList: () => Promise<any[]>;
  getUserList: () => Promise<any[]| ISPFilteredObj[]>
  createDraft: (param: IUserWeek) => Promise<void>
}
/* user data object received after filter*/
export interface ISPFilteredObj {
  Id: number;
  User: string;
  Projects: string;
  Description: string;
  FreshService: string;
  Location: string;
  Status: string;
  Task: string;
  Year: string;
  Week: string;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

/* handler for CRUD REST requests */
class Server implements IServer {

  public fetch = sp;
  public context: WebPartContext|null;

  public constructor (context:WebPartContext ) {
    this.context = context ? context : null
  }

  public getList = () => {
    console.log(this.context.pageContext);
    this.getUserList();
    return this.fetch.web.lists.getByTitle("B4").items();
  }

  public getUserList = () => {
    if (!this.context) {
      return new Promise(res => {
        res([])
      }) as Promise<[]>;
    };

    return this.fetch.web.lists.getByTitle("B4").items.select(...LIST_COLUMNS).filter("User eq '" + this.context.pageContext.user.loginName + "'").get()
  };

  public createDraft = async (param: IUserWeek) => {
    // slice
    let _draft = {...param};
    // get list
    let list = this.fetch.web.lists.getByTitle("B4");

    const entityTypeFullName = await list.getListItemEntityTypeFullName()
    // batch
    let batch = sp.web.createBatch();
    // iterate 
    _draft.data.forEach((weekData => {
      list.items.inBatch(batch).add({
        User: this.context.pageContext.user.loginName,
        Projects: weekData.project,
        Description: weekData.description,
        FreshService: weekData.freshService,
        Location: weekData.location,
        Status: "draft",
        Task: weekData.task,
        Year: _draft.year.toString(),
        Week: _draft.week.toString(),
        Monday: weekData.monday,
        Tuesday: weekData.tuesday,
        Wednesday: weekData.wednesday,
        Thursday: weekData.thursday,
        Friday: weekData.friday,
        Saturday: weekData.saturday,
        Sunday: weekData.sunday,
      }, entityTypeFullName)
      .then(b => console.log(b))
    }))

    await batch.execute();

    console.log("Done");
  };

  public updateDraft = async (param: IUserWeek, id: number) => {
    // slice
    let _draft = {...param};
    // get list
    let list = this.fetch.web.lists.getByTitle("B4");

    const entityTypeFullName = await list.getListItemEntityTypeFullName()
    // batch
    let batch = sp.web.createBatch();
    // iterate 
    _draft.data.forEach((weekData => {
      list.items.getById(id).inBatch(batch).update({
        User: this.context.pageContext.user.loginName,
        Projects: weekData.project,
        Description: weekData.description,
        FreshService: weekData.freshService,
        Location: weekData.location,
        Status: "draft",
        Task: weekData.task,
        Year: _draft.year.toString(),
        Week: _draft.week.toString(),
        Monday: weekData.monday,
        Tuesday: weekData.tuesday,
        Wednesday: weekData.wednesday,
        Thursday: weekData.thursday,
        Friday: weekData.friday,
        Saturday: weekData.saturday,
        Sunday: weekData.sunday,
      }, entityTypeFullName)
      .then(b => console.log(b))
    }))

    await batch.execute();

    console.log("Done");
  };
}

export default Server;
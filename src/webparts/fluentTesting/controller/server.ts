import { IList, sp } from "@pnp/sp/presets/core";
import { IEmailProperties } from "@pnp/sp/sputilities";
import "@pnp/sp/webs";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/profiles";
import "@pnp/sp/site-groups";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/sputilities";
// types
import {IServer, ISpUserTaskData,
  ISpUserPeriodData,
  IServerReqObject
} from "./serverTypes";
import {IUserData} from "../components/dataTypes";
// error
import CustomError from "../components/error/errorTypes";

/* handler for CRUD REST requests */
class Server implements IServer {

  public fetch = sp;
  public taskList: IList;
  public periodList: IList;
  private userId: number = null;

  public constructor() {
    this.taskList = this.fetch.web.lists.getByTitle("Timesheet-Dev-Task");
    this.periodList = this.fetch.web.lists.getByTitle("Timesheet-Dev-Period");
    // this.fetch.web.currentUser()
    //   .then(result => {
    //     this.userId = result.Id;
    //   })
    //   .catch(error => {
    //     this.userId = null;
    //   });
  }

  public testing = async (): Promise<void> => {
    // gets list's folders
    const listFolders = await this.fetch.web.lists.getByTitle("Timesheet-Dev").rootFolder.folders.getByName("test").get();


    this.fetch.web.lists.getByTitle("Timesheet-Dev")
      .items.select()
      .filter("Title eq '" + "test" + "'").get()
      .then(result => console.log(result));

    this.fetch.web.lists.getByTitle("Timesheet-Dev").rootFolder.folders.add("test4")
    .then(result => console.log(result));

    console.log(listFolders);
  }

  public getUser = async (): Promise<IUserData> => {

    try {
      // get profile, user and groups
      const profile = await this.fetch.profiles.myProperties.get();
      const user = await this.fetch.web.currentUser();
      const groups = await this.fetch.web.currentUser.groups();
      
      // groups
      // arr
      const grpArr: string[] = [];
      // loop groups
      groups.forEach(grpObj => grpArr.push(grpObj.Title));
      // vars
      const isUserManager = grpArr.includes("LineManagers Approvers");
      // assign userId
      this.userId = user.Id;
      // return
      return {
        id: user.Id,
        email: profile.Email,
        displayName: profile.DisplayName,
        jobTitle: profile.Title,
        isUserManager,
      };

    } catch (error) {
      console.log(error);
      return error;
    }

  }

  public getUserPeriodList = (username: string): Promise<ISpUserPeriodData[]> => {
    
    return new Promise((resolve, reject) => {
      this.periodList
      .items.filter("username eq '" + username + "'")
      .get()
      .then(result => resolve(result))
      .catch(error => reject(error));
    });
  }

  public getUserPeriodById = (id: number): Promise<ISpUserPeriodData>  => {

    return new Promise((resolve, reject) => {
      this.periodList
      .items.getById(id).get()
      .then(result => resolve(result))
      .catch(error => reject(error));
    });
  }

  public getUserPeriodByReference = (reference: string): Promise<ISpUserPeriodData[]>  => {

    return new Promise((resolve, reject) => {
      this.periodList
      .items.filter("referenceId eq '" + reference + "'")
      .get()
      .then(result => resolve(result))
      .catch(error => reject(error));
    });
  }

  public getUserTaskByReference = (reference: string): Promise<ISpUserTaskData[]>  => {

    return new Promise((resolve, reject) => {
      this.taskList
      .items.filter("periodReferenceId eq '" + reference + "'")
      .get()
      .then(result => resolve(result))
      .catch(error => reject(error));
    });
  }

  public createDraft = async (username: string, request: IServerReqObject): Promise<boolean> => {

    // user id necessary
    if (this.userId === null) {
      throw new CustomError("Error getting user");
    }
    // first create a ref id
    // for now
    const _refId = `${request.year}${request.week}${this.userId}`;
    console.log("refid", _refId);
    // check if id exists
    const itemExistArray = await this.getUserPeriodByReference(_refId);
    // if it does
    if (itemExistArray.length > 0) {
      throw new CustomError("There's a Draft available already");
    }

    // create period obj
    const addItemPeriod = 
      await this.periodList.items.add({
        username: username,
        year: +request.year,
        week: +request.week,
        referenceId: _refId
      });
    // check it period wa created successfully
    if (addItemPeriod) {
      console.log(addItemPeriod);
      console.log("period created");
    } else {
      throw new CustomError("Error creating period item", "serverError");
    }
    
    // entity name needed for bacth update
    const entityName = await this.taskList.getListItemEntityTypeFullName();
    // create batch
    const batch = sp.web.createBatch();
    // loop tasks
    request.data.forEach(task => {
      // add task
      this.taskList.items.inBatch(batch).add({
        periodReferenceId: _refId,
        project: task.project,
        location: task.location,
        task: task.task,
        freshService: task.freshService,
        description: task.description,
        monday: task.monday,
        tuesday: task.tuesday,
        wednesday: task.wednesday,
        thursday: task.thursday,
        friday: task.friday,
        saturday: task.saturday,
        sunday: task.sunday,
      }, entityName).then(b => {
        console.log(b);
      });
    });
    // execute
    batch.execute()
    .then(_ => {
      console.log("tasks created");
    });
    return true;
  }

  public updateDraft = async (referenceId: string, request: ISpUserTaskData[]): Promise<boolean> => {

    // entity name needed for bacth update
    const entityName = await this.taskList.getListItemEntityTypeFullName();
    // work on later
    const updateItems: ISpUserTaskData[] = [];
    const newItems: ISpUserTaskData[] = [];
    // check if id present
    request.forEach(task => {
      if ("ID" in task) {
        updateItems.push(task);
      } else {
        newItems.push(task);
      }
    });

    // if no id, item is new and should be created
    if (newItems.length > 0) {
      // reference needed for update
      if (referenceId === "" || typeof referenceId === "undefined") {
        throw new CustomError("Reference Id is empty");
      }
      // create batch
      const newBatch = sp.web.createBatch();
      // loop array
      newItems.forEach(task => {
        // add task
        this.taskList.items.inBatch(newBatch).add({
          periodReferenceId: referenceId,
          project: task.project,
          location: task.location,
          task: task.task,
          freshService: task.freshService,
          description: task.description,
          monday: task.monday,
          tuesday: task.tuesday,
          wednesday: task.wednesday,
          thursday: task.thursday,
          friday: task.friday,
          saturday: task.saturday,
          sunday: task.sunday,
        }, entityName).then(b => {
          console.log(b);
        });
      });
      // execute
      newBatch.execute()
      .then(_ => {
        console.log("new tasks created");
      });
    }
    // update draft for items containing ids
    // create batch
    const updateBatch = sp.web.createBatch();
    // loop update array
    updateItems.forEach(task => {
      // add task to upddate
      this.taskList.items.getById(task.ID).inBatch(updateBatch).update({
        project: task.project,
        location: task.location,
        task: task.task,
        freshService: task.freshService,
        description: task.description,
        monday: task.monday,
        tuesday: task.tuesday,
        wednesday: task.wednesday,
        thursday: task.thursday,
        friday: task.friday,
        saturday: task.saturday,
        sunday: task.sunday,
        }, "*", entityName).then(b => {
        console.log(b);
      });
    });

    // execute
    await updateBatch.execute();
    return true;
  }

  public deleteUserTasks = async (tasks: ISpUserTaskData[]): Promise<boolean> => {

    // loop over array of tasks
    tasks.forEach(task => {
      // list can contain new items, so filter id
      if ("ID" in task) {
        this.taskList.items.getById(task.ID).delete();
      }
    });

    return true;
  }

  public updatePeriodStatus = async (id: number): Promise<boolean> => {

    await this.periodList.items.getById(id).update({status: "Pending" });

    return true;
  }

  public sendFeedback = (email: string, rating: number, feedback: string): Promise<boolean> => {

    return new Promise((resolve, reject) => {
      // split string
      const domain = email.split("@")[1];
      // construct mail
      const To = [`webpartfeedback@${domain}`];
      const Subject = `Feedback from ${email}`;
      const Body = `Rated: ${rating} stars, Feedback: ${feedback}`;
      // body
      const emailProps: IEmailProperties = {
        To,
        Subject,
        Body
      };
      console.log(emailProps);
      // send
      this.fetch.utility.sendEmail(emailProps)
        .then(_ => resolve(true))
        .catch(error => reject(error));
    });
  }

}

const fetchServer = new Server();

export default fetchServer;

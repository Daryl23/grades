import { Client, Account, Databases, Teams, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // or your custom endpoint
  .setProject("grading-system"); // from Appwrite console

export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);
export const IDHelper = ID;

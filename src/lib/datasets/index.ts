import { bankSql } from "./bank";
import { companySql } from "./company";
import { cricketSql } from "./cricket";
import { hospitalSql } from "./hospital";
import { moviesSql } from "./movies";
import { schoolSql } from "./school";
import { shopSql } from "./shop";

export type DatasetId = "company" | "shop" | "cricket" | "hospital" | "bank" | "movies" | "school";

export interface Dataset {
  id: DatasetId;
  name: string;
  emoji: string;
  description: string;
  sql: string;
}

export const datasets: Record<DatasetId, Dataset> = {
  company: {
    id: "company",
    name: "Company",
    emoji: "🏢",
    description: "Departments, employees, managers, projects and who works on what.",
    sql: companySql,
  },
  shop: {
    id: "shop",
    name: "Online Shop",
    emoji: "🛒",
    description: "Customers, products, orders and order line items.",
    sql: shopSql,
  },
  cricket: {
    id: "cricket",
    name: "Cricket League",
    emoji: "🏏",
    description: "A T20 league: teams, players, match results and season stats.",
    sql: cricketSql,
  },
  hospital: {
    id: "hospital",
    name: "Hospital",
    emoji: "🏥",
    description: "Doctors, patients, appointments and prescriptions.",
    sql: hospitalSql,
  },
  bank: {
    id: "bank",
    name: "Bank",
    emoji: "🏦",
    description: "Branches, customers, accounts, transactions and loans.",
    sql: bankSql,
  },
  movies: {
    id: "movies",
    name: "Movies",
    emoji: "🎬",
    description: "Films, directors, actors and cast lists.",
    sql: moviesSql,
  },
  school: {
    id: "school",
    name: "School",
    emoji: "🎓",
    description: "Students, teachers, courses and exam marks, including absentees.",
    sql: schoolSql,
  },
};

export const datasetList = Object.values(datasets);

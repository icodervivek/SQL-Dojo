import { companySql } from "./company";
import { shopSql } from "./shop";

export type DatasetId = "company" | "shop";

export interface Dataset {
  id: DatasetId;
  name: string;
  description: string;
  sql: string;
}

export const datasets: Record<DatasetId, Dataset> = {
  company: {
    id: "company",
    name: "Company",
    description: "Departments, employees, projects and who works on what.",
    sql: companySql,
  },
  shop: {
    id: "shop",
    name: "Online Shop",
    description: "Customers, products, orders and order line items.",
    sql: shopSql,
  },
};

export interface ISearchQuery {
  query: string;
  datasources: string[];
}

export interface ISearchQuerySec {
  query: string;
  form: string, 
  ticker: string,
  start_date: string,
  end_date: string
}

export interface ISearchFollowUpQuery {
  query: string;
}

export interface IChat {
  sender: "user" | "bot";
  content: string;
}
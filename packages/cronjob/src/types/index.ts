export type TiDBDataServiceResponse<T> = {
  data: {
    columns: string[];
    rows: T[];
  }
}

export type JSONData = Record<string, object | string | number | boolean | null>;

export type CommentItem = {
  id: number;
  content: string;
  post_id: string;
  translation?: string;
}

export type CommentTag = 'Greeting' | 'Bug report' | 'Question' | 'Suggestion' | 'Criticism';

export type TagItem = {
  id: number;
  content: string;
}

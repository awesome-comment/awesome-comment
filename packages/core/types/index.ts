export type ResponseBody<T> = {
  code: number;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
  };
}

export type Comment = {
  id: number;
  postId: string;
  content: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
    avatar: string;
  };
}

export type Paged<T> = {
  items: T[];           
  count?: number;      
  total?: number;       
};
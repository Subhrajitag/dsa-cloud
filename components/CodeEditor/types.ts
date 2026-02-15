export interface FileItem {
  id: string;
  name: string;
  code: string;
  question?: string;
  parent_id?: string | null;
  is_folder?: boolean;
}


export interface FolderItem {
  id: string;
  name: string;
  parent_id?: string | null;
}

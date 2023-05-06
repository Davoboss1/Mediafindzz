import { createContext } from "react";
import { Source, URLDATA } from "../Types";
import { webviewComponentProps } from "./Views";
export const LightThemeContext = createContext<boolean>(true);

export const SourceContext = createContext<Source>({} as Source);
export const SourcesContext = createContext<Source[]>([]);
export const CategoryContext = createContext<string>("");
export const webviewObjectsContext = createContext<{webviewObjects: webviewComponentProps[],setWebviewObjects: (arg:webviewComponentProps[])=>void}>({webviewObjects:[],setWebviewObjects:()=>{}});

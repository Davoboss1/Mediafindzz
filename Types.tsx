export type source = {
    name: string,
    logo: any,
    objects: sourceType
  }

export type sourceType = {
    HOST: string,
    fetchDataList: Function,
    searchDataList: Function,
    fetchDataInfo: Function
  }

export type URLDATA = { title: string, link: string, img: string, source?: string, sourceClass?: Source };

export interface Source {
    name: string,
    image_src: any,
    HOST: string,
    fetchDataList(setURLDATALIST: (arr: URLDATA[]) => void,page?:number,htmlstring?:string): void,
    searchDataList(setURLDATALIST: (arr: URLDATA[]) => void,query:string ,htmlstring?:string):  void,
    fetchDataInfo(link_or_html: string, setInformation : (plot:string,links:{}) => void):  void,
    fetchEpisodeList?(seasonUrl_or_html:string, setURLDATALIST: (arr: Seasontype[],plot:string) => void) : void,
    URL?: string,
    SEARCHURL? (query:string):string,
    PAGEURL?: string,
    renderInWebview?: boolean,
    fetchDataListInjectJavascript?: string,
    fetchDataInfoInjectJavascript?: string,
}


export type Seasontype = {
  index: number,
  season_title: string,
  episodes: {
    title: string,
    link: string
  }[]
}

export function newAbortSignal(timeoutMs:number) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);

  return abortController.signal;
};
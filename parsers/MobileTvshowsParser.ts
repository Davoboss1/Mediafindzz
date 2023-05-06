import axios from "axios";
const cheerio = require('react-native-cheerio');
import { Source , URLDATA, Seasontype, newAbortSignal} from "../Types"


export default class MobiletvshowsSource implements Source {
    get name() {
        return "MobileTvshows"
    }

    get image_src() {
        return require("../assets/source-fz-logo.png");
    }

    get HOST() {
        return "https://www.mobiletvshows.net"
    }
    requestHeaders = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "Cookie": ''
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {
        try {

            let response;
            if (page) {
                response = await axios.get(this.HOST + "/popular.php?&pg=" + page, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });

            } else {
                response = await axios.get(this.HOST + "/popular.php", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });

            }

            let cookies = response.headers["set-cookie"] as string[];
            if (cookies) {
                let sessionid = cookies[0].replace(" path=/", "") || "";
                this.requestHeaders["Cookie"] = sessionid;
            }


            //load to cheerio
            const $ = cheerio.load(response.data);

            let container = $("div.mainbox3 table tr");
            let links = container.find("td span a");
            let titles = container.find("td span a small b");
            let imgs = container.find("td a img");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles.length; index++) {
                datalist.push({
                    title: $(titles[index]).text(),
                    link: $(links[index]).attr("href") || '',
                    img: this.HOST + "/" + $(imgs[index]).attr("src") || '',
                });
            }

            setURLDATALIST(datalist);
            //fetchDataInfo(datalist[0].link);

        } catch (error) {
            setURLDATALIST(null as any);
        }
    }

    fetchEpisodeList = async (seasonUrl:string, setURLDATALIST: (arr: Seasontype[],plot:string) => void) => {
        try {
            
            
            
            let response;
            response = await axios.get(this.HOST + "/" + seasonUrl, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            let cookies = response.headers["set-cookie"] as string[];
            if (cookies) {
                let sessionid = cookies[0].replace(" path=/", "") || "";
                this.requestHeaders["Cookie"] = sessionid;
            }

            //load to cheerio
            let $ = cheerio.load(response.data);
            let plot = $("div.mainbox3 td span > small:last-child").text();
            let container = $("div[itemprop=containsSeason]");
            let links = container.find("a");
            let titles = container.find("a span");
            
            
            let datalist: Seasontype[] = [];
            for (let index = 0; index < titles.length; index++) {
                let season_title = $(titles[index]).text();
                let season_link = $(links[index]).attr("href") || '';
                let season:Seasontype = {} as Seasontype;
                
                
                
                response = axios.get(this.HOST + "/" + season_link, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) }).then((response)=>{
                    
                
                
                
                    $ = cheerio.load(response.data);

                    let episode_container = $("div.mainbox table tr td");
                    let episode_titles = episode_container.find("span b");
                    let episode_links = episode_container.find("span a:nth-child(2)");
                    let episodes: {title: string, link: string}[] = [];
                    for(let i = 0; i < episode_links.length; i++){
                        episodes.push({
                            title: $(episode_titles[i]).text(),
                            link: $(episode_links[i]).attr("href"),
                        });
                    }

                
                
                
                    season.season_title = season_title;
                    season.index = index;
                    season.episodes = episodes;
                    datalist = [...datalist,season];
                    setURLDATALIST(datalist,plot);

                });
            }
            

            //fetchDataInfo(datalist[0].link);

        } catch (error) {
            setURLDATALIST(null as any,null as any);
        }
    }


    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string) => {
        try {
            if (query.trim().length == 0) {
                return;
            }
            let response;
            
            response = await axios.get(this.HOST + "/search.php?search=" + query + "&beginsearch=Search&vsearch=&by=series", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            

            let cookies = response.headers["set-cookie"] as string[];
            if (cookies) {
                let sessionid = cookies[0].replace(" path=/", "") || "";
                this.requestHeaders["Cookie"] = sessionid;
            }

            //load to cheerio
            const $ = cheerio.load(response.data);

            let container = $("div.mainbox3 table tr");
            let links = container.find("td span a");
            let titles = container.find("td span a small b");
            let imgs = container.find("td a img");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles.length; index++) {
                datalist.push({
                    title: $(titles[index]).text(),
                    link: $(links[index]).attr("href") || '',
                    img: this.HOST + "/" + $(imgs[index]).attr("src") || '',
                    source: "Mobiletvshows"
                });
            }

            setURLDATALIST(datalist);

        } catch (error) {
            setURLDATALIST([]);
        }
    }

    fetchDataInfo = async (link: string, setInformation: (plot: string, links: {}) => void) => {
        try {
            const Host = this.HOST + "/";
            let response = await axios.get(Host + link, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });       
            let $ = cheerio.load(response.data);
            let plot: string = $("td span").text();
            plot = plot.replace(/.*Summary:\s?/g,"")
            plot = plot.replace(/Release\sDate:.+/g,"")
            let link_temp = $("div.mainbox3 > a#dlink2").attr("href");
            response = await axios.get(Host + link_temp, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            $ = cheerio.load(response.data);
            let links_container = $("div.downloadlinks2 input");
            let links: any = {};
            
            for(let i =  0; i < links_container.length; i++){
                links["Link " + (i+1)] = $(links_container[i]).val();
            }
            setInformation(plot, links);

        } catch (error: any) {
            setInformation(null as any, null as any);
        }
    }
}
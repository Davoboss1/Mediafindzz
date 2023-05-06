import axios from "axios";
const cheerio = require('react-native-cheerio');
import { Source, URLDATA, Seasontype, newAbortSignal } from "../Types"


export default class Tvshows4MobileSource implements Source {
    get name() {
        return "Tvshows4Mobile"
    }

    get image_src() {
        return require("../assets/mp4mania_or_tvshows4mobile.png");
    }

    get HOST() {
        return "https://tvshows4mobile.com"
    }
    requestHeaders = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "Cookie": ''
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if (page) {
                response = await axios.get(`${this.HOST}/a/page${page}.html`, {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });

            } else {
                response = await axios.get(this.HOST + "/a/", {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });
            }
            //temp code
            /*fs.writeFile("fzmovies.html",response.data,function (err) {
                if(err) 
            });*/

            const $ = cheerio.load(response.data);
            let titles_links = $(".data a");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles_links.length; index++) {
                let title = $(titles_links[index]).text();
                let link = $(titles_links[index]).attr("href");
                let img = "https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80";
                datalist.push({
                    title: title,
                    link: link || '',
                    img: img || ''
                });
            }
            setURLDATALIST(datalist);
            //fetchDataInfo(datalist[1].link);

        } catch (error) {
            setURLDATALIST(null as any);
        }
    }

    fetchEpisodeList = async (seasonUrl: string, setURLDATALIST: (arr: Seasontype[], plot: string) => void) => {
        try {
            let response;
            response = await axios.get(this.HOST + "/" + seasonUrl, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            

            //load to cheerio
            let $ = cheerio.load(response.data);
            let plot = $("div.serial_desc").text();
            let links_titles = $(".data a");
            
            let datalist: Seasontype[] = [];
            for (let index = 0; index < links_titles.length; index++) {
                let season_title = $(links_titles[index]).text();
                let season_link = $(links_titles[index]).attr("href") || '';
                let season: Seasontype = {} as Seasontype;
                
                response = axios.get(season_link, {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                }).then((response) => {
                    $ = cheerio.load(response.data);
                    let total_pages = parseInt($(".pagination a").last().text());
                    if(isNaN(total_pages)){
                        total_pages = 1;
                    }
                    
                    let episodes: { title: string, link: string }[] = [];
                    let requestCount = 0;
                    
                    for (let i = 0; i < total_pages; i++) {
                        let link = season_link;
                        if(i>0){
                            link = season_link.replace("index", "page" + (i + 1));
                        }
                        
                        axios.get(link, { headers: this.requestHeaders }).then((response) => {
                            $ = cheerio.load(response.data);

                            let episode_titles_links = $(".data a");
                            for (let i = 0; i < episode_titles_links.length; i++) {
                                episodes.push({
                                    title: $(episode_titles_links[i]).text(),
                                    link: $(episode_titles_links[i]).attr("href"),
                                });
                            };
                            requestCount++;
                            if (requestCount === total_pages) {
                                season.season_title = season_title;
                                season.index = index;
                                season.episodes = episodes;
                                datalist = [...datalist, season];
                                
                                setURLDATALIST(datalist, plot);
                            }
                        })
                    }
                });
            }
        } catch (error) {
            setURLDATALIST(null as any, null as any);
        }
    }

    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string) => {

        try {
            if (query.trim().length == 0) {
                return;
            }
            let response;

            response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyAZqse88drGHvwcmfWNI1SD3DrThIfOr-A&cx=e5265e62e2d96457f&q=${query}`, { headers: this.requestHeaders, timeout: 30000,
            signal: newAbortSignal(30000) });
            let response_text: string = response.data;
            const datalist: URLDATA[] = [];
            let data = response.data;
            for (let i = 0; i < data.items.length; i++) {
                if(!data.items[i].title.includes("Season")){
                datalist.push({
                    title: data.items[i].title,
                    link: data.items[i].formattedUrl.replace(`${this.HOST}/`, ""),
                    img: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
                    source: "Tvshows4Mobile"
                });
            }
            }

            setURLDATALIST(datalist);

            //fetchDataInfo(datalist[1].link);

        } catch (error) {
            
            setURLDATALIST([]);
        }
    }

    fetchDataInfo = async (link: string, setInformation: (plot: string, links: {}) => void) => {
        try {
            
            
            let response = await axios.get(link, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            let $ = cheerio.load(response.data);
            let plot: string = "";
            let data = $(".data a");
            let links: any = {
                "Download Low Mp4" : $(data[0]).attr("href"),
                "Download High Mp4" : $(data[1]).attr("href"),
            };
            setInformation(plot, links);

        } catch (error: any) {
            setInformation(null as any, null as any);
        }
    }
}
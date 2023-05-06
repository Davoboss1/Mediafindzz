import axios from "axios";
import {decode, encode} from 'base-64'
/*
if (!global.btoa) {
    global.btoa = encode;
}

if (!global.atob) {
    global.atob = decode;
}*/

const atob = decode;
const cheerio = require('react-native-cheerio');

import { newAbortSignal, Seasontype, Source, URLDATA } from "../Types"

export default class WcoSource implements Source {
    get name() {
        return "WatchCartoonOnline"
    }

    get image_src() {
        return require("../assets/wcoforever-icon.png");
    }

    get HOST() {
        return "https://www.wcoforever.net"
    }

    requestHeaders: any = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Connection": "keep-alive",
        "HOST": "www.wcoforever.net"
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if (page) {
                setURLDATALIST([]);
                return;
            }
            response = await axios.get(this.HOST, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });

            const $ = cheerio.load(response.data);
            let container = $("ul.items").last();

            //Get last item
            //container = $(container[container.length-1]);
            
            let images = container.find("img");
            
            let titles_links = container.find("div.recent-release-episodes > a");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles_links.length; index++) {
                let title = $(titles_links[index]).text();
                let link = $(titles_links[index]).attr("href");
                let img = "https:"+$(images[index]).attr("src");
                
                datalist.push({
                    title: title,
                    link: link || '',
                    img: img || ''
                });
            }

            setURLDATALIST(datalist);

        } catch (error) {
            setURLDATALIST(null as any);
        }
    }

    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string) => {

        try {
            if (query.trim().length == 0) {
                return;
            }
            let response;

            response = await axios.post(`${this.HOST}/search`, { catara: query, konuara: "series" }, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            const $ = cheerio.load(response.data);
            let container = $("ul.items").last();
            let images = container.find("img")
            let titles_links = container.find("div.recent-release-episodes > a");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles_links.length; index++) {
                let title = $(titles_links[index]).text();
                let link = $(titles_links[index]).attr("href");
                let img = $(images[index]).attr("src");

                datalist.push({
                    title: title,
                    link: link || '',
                    img: img || '',
                    source: this.name

                });
            }

            setURLDATALIST(datalist);

        } catch (error) {
            
            setURLDATALIST([]);
        }
    }

    fetchEpisodeList = async (seasonUrl: string, setURLDATALIST: (arr: Seasontype[], plot: string) => void) => {
        try {
            let response;
            
            response = await axios.get(seasonUrl, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });


            //load to cheerio
            let $ = cheerio.load(response.data);
            let plot = $("div#sidebar_cat p").text();
            let container = $("div.recent-release-main");

            let datalist: Seasontype[] = [];
            let episode_links_and_titles = container.find("div.cat-eps > a");
            
            let episodes: { title: string, link: string }[] = []
            for (let i = 0; i < episode_links_and_titles.length; i++) {
                episodes.push({
                    title: $(episode_links_and_titles[i]).text(),
                    link: $(episode_links_and_titles[i]).attr("href"),
                });
            }
            let season: Seasontype = {
                season_title: container.find("div.video-title > h2 > div").text(),
                index: 1,
                episodes
            };

            datalist = [season];
            setURLDATALIST(datalist, plot);
        } catch (error) {
            setURLDATALIST(null as any, null as any);
        }
    }

    fetchDataInfo = async (link: string, setInformation: (plot: string, links: {}) => void) => {
        try {
            
            let response = await axios.get(link, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            
            const plot = "";

            let temp_text_regex = new RegExp(/(<script>)(.*)(<\/script>)/g).exec(response.data)
            let temp_text = temp_text_regex ? temp_text_regex[2] : '';
            
            let htmlstring = "";
            let eval_text = temp_text.replace("document.write", "htmlstring = ");           
            
            eval(eval_text);
            
            let $ = cheerio.load(htmlstring);
            let next_link = $("iframe").attr("src");
            
            let headers = this.requestHeaders;
            headers["Referer"] = next_link;

            let get_host_regex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/g).exec(next_link);
            let full_host = get_host_regex ? get_host_regex[0] : '';
            headers["HOST"] = get_host_regex ? get_host_regex[1] : '';
            response = await axios.get(next_link, {
                headers: headers, timeout: 30000,
                signal: newAbortSignal(30000)
            });

            let download_link_regex = new RegExp(/(\$\.getJSON\(")(.*)(",)/g).exec(response.data);
            let download_link = download_link_regex ? download_link_regex[2] : '';

            headers["Referer"] = full_host + download_link;
            headers["x-requested-with"] = "XMLHttpRequest";
            
            response = await axios.get(full_host + download_link, {
                headers: headers, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            
            const download_data = response.data;
            setInformation(plot, {
                "Download (SD)": download_data.server+'/getvid?evid='+download_data.enc,
                "Download (HD)": download_data.server+'/getvid?evid='+download_data.hd,
                "WatchPage": link
            })
            
        } catch (error: any) {
            
            setInformation(null as any, [] as any);
        }
    }
}

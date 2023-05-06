import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source, URLDATA } from "../Types"

export default class BooksFreeSource implements Source {
    get name() {
        return "BooksFree"
    }

    get image_src() {
        return require("../assets/pdfdrive.png");
    }

    get HOST() {
        return "https://www.booksfree.org"
    }

    requestHeaders = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {
        try {
            if (page) {
                setURLDATALIST([]);
                return;
            }

            let response = await axios.get(this.HOST, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });


            //load to cheerio
            const $ = cheerio.load(response.data);
            let links_titles = $(".td-module-container.td-category-pos-above .entry-title a");
            let imgs = $(".td-module-container.td-category-pos-above span");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < links_titles.length; index++) {
                datalist.push({
                    title: $(links_titles[index]).text().replace(/pdf\sfree\sdownload/g, ""),
                    link: $(links_titles[index]).attr("href") || '',
                    img: $(imgs[index]).attr("data-img-url") || '',

                });
            }

            setURLDATALIST(datalist);
            //fetchDataInfo(datalist[0].link);

        } catch (error) {
            setURLDATALIST(null as any);
        }
    }

    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string) => {
        try {
            if (query.trim().length == 0) {
                return;
            }
            let response = await axios.get(this.HOST + "/?s=" + query, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            //load to cheerio
            const $ = cheerio.load(response.data);
            let links_titles = $("div.td_module_wrap div.item-details .entry-title a");
            let imgs = $("div.td_module_wrap div.td-module-thumb img");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < links_titles.length; index++) {
                datalist.push({
                    title: $(links_titles[index]).text(),
                    link: $(links_titles[index]).attr("href") || '',
                    img: $(imgs[index]).attr("data-img-url") || '',
                    source: this.name,
                });
            }
            setURLDATALIST(datalist);
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
            let container = $("div.td-post-content");
            let downloadlink_page = container.find("center a").attr("href");
            let plot = container.find("p:first-child").text();
            response = await axios.get(downloadlink_page, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            $ = cheerio.load(response.data);
            let downloadlink = $("p.dlm-downloading-page a").attr("href");

            let links = {
                "Download": downloadlink
            }

            setInformation(plot, links);

        } catch (error: any) {
            setInformation(null as any, null as any);
        }
    }
}

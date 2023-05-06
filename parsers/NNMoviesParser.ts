import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source, URLDATA } from "../Types"


export default class NetNaijaSource implements Source {
    get name() {
        return "NetNaija"
    }

    get image_src() {
        return require("../assets/source-nn-logo.png");
    }

    get HOST() {
        return "https://www.thenetnaija.net"
    }
    
    requestHeaders: any = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if (page) {
                response = await axios.get(this.HOST + "/videos/movies/page/" + page, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });

            } else {
                response = await axios.get(this.HOST + "/videos/movies", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            }
            //temp code
            /*fs.writeFile("fzmovies.html",response.data,function (err) {
                if(err) 
            });*/

            const $ = cheerio.load(response.data);
            let titles_links = $("article .info h2 a");
            let images = $("article .thumbnail img");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles_links.length; index++) {
                let title = $(titles_links[index]).text();
                let link = $(titles_links[index]).attr("href");
                let img = $(images[index]).attr("src");
                datalist.push({
                    title: title,
                    link: link || '',
                    img: img || ''
                });
            }


            setURLDATALIST(datalist)
            //fetchDataInfo(datalist[1].link);

        } catch (error) {
            setURLDATALIST(null as any);
        }
    }

    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string) => {

        try {
            if (query.trim().length == 0) {
                return;
            }

            let response = await axios.get(this.HOST + "/search?t=" + query, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });

            const $ = cheerio.load(response.data);
            let titles_links = $("article .info h3 a");
            let images = $("article .thumbnail img");
            const datalist: URLDATA[] = [];


            for (let index = 0; index < titles_links.length; index++) {
                let title = $(titles_links[index]).text();
                let link = $(titles_links[index]).attr("href");
                let img = $(images[index]).attr("src");
                if (title.startsWith("Movie: ")) {
                    datalist.push({
                        title: title,
                        link: link || '',
                        img: img || '',
                        source: "Netnaija",
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
            const response = await axios.get(link, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            let $ = cheerio.load(response.data);
            let plot = $("article.post-body > p").text()
            let downloadpagelink = $("div.download-block .db-one:first-child a").attr("href")
            this.requestHeaders["referer"] = link;

            const downloadpageresponse = await axios.get(this.HOST + downloadpagelink, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            $ = cheerio.load(downloadpageresponse.data);
            let page_url = $("link[itemprop='url']").attr("href") || "";

            let tokenarr = page_url.match(/\/\w*(?=\-)/g) as string[];
            let token = tokenarr[0];
            token = token.replace("/", "")

            delete this.requestHeaders["referer"]
            const downloadresponse = await axios.get("https://api.sabishare.com/token/download/" + token, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            const url = downloadresponse.data.data.url;
            setInformation(plot, {
                Download: url
            })
        } catch (error) {
            setInformation(null as any, null as any);
        }
    }
}

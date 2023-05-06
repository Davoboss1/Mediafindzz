import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source , URLDATA} from "../Types"


export default class FZMoviesSource implements Source {
    get name() {
        return "FZMovies"
    }

    get image_src() {
        return require("../assets/source-fz-logo.png");
    }

    get HOST() {
        return "https://fzmovies.net"
    }
    requestHeaders = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "Cookie": ''
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {
        try {

            let response;
            if (page) {
                response = await axios.get(this.HOST + "/movieslist.php?catID=2&by=date&pg=" + page, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });

            } else {
                response = await axios.get(this.HOST + "/movieslist.php?catID=2&by=date", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });

            }
            //temp code
            /*fs.writeFile("fzmovies.html",response.data,function (err) {
                if(err) 
            });*/

            let cookies = response.headers["set-cookie"] as string[];
            if (cookies) {
                let sessionid = cookies[0].replace(" path=/", "") || "";
                this.requestHeaders["Cookie"] = sessionid;
            }


            //load to cheerio
            const $ = cheerio.load(response.data);

            let container = $("div.mainbox table tr");
            let links = container.find("td:first-child a");
            let titles = container.find("td span a small b");
            let imgs = container.find("td a img");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles.length; index++) {
                datalist.push({
                    title: $(titles[index]).text(),
                    link: $(links[index]).attr("href") || '',
                    img: this.HOST + $(imgs[index]).attr("src") || '',
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
            
            let response = await axios.get(this.HOST + "/csearch.php?searchname=" + query + "&searchby=name&category=all", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });


            let cookies = response.headers["set-cookie"] as string[];
            if (cookies) {
                let sessionid = cookies[0].replace(" path=/", "") || "";
                this.requestHeaders["Cookie"] = sessionid;
            }
            const datalist: URLDATA[] = [];

            //load to cheerio
            const $ = cheerio.load(response.data);
            let container = $("div.mainbox table tr");
            let links = container.find("td:first-child a");
            let titles = container.find("td span a small b");
            let imgs = container.find("td a img");

            for (let index = 0; index < titles.length; index++) {
                datalist.push({
                    title: $(titles[index]).text(),
                    link: $(links[index]).attr("href") || '',
                    img: this.HOST + $(imgs[index]).attr("src") || '',
                    source: "Fzmovies",
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
            
            
            const response = await axios.get(Host + link, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            let $ = cheerio.load(response.data);

            let plot = $("span textcolor1[itemprop='description']").text();
            let urlobj = $("ul.moviesfiles a[itemprop='url']");
            let quality_480p_url = $(urlobj[0]).attr("href");
            let quality_720p_url = $(urlobj[1]).attr("href");
            const datainfo:any = {};
            datainfo.plot = plot;

            const downloadOptionsResponse_480p = await axios.get(Host + quality_480p_url, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            const downloadOptionsResponse_720p = await axios.get(Host + quality_720p_url, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            $ = cheerio.load(downloadOptionsResponse_480p.data);
            let downloadpagelink_480p = $("a#downloadlink").attr("href");

            const downloadResponse_480p = await axios.get(Host + downloadpagelink_480p, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            $ = cheerio.load(downloadResponse_480p.data);
            let downloadlinks_480p = $("ul.downloadlinks p input");

            let downloadlink1_480p = $(downloadlinks_480p[0]).val();
            let downloadlink2_480p = $(downloadlinks_480p[1]).val();
            let downloadlink3_480p = $(downloadlinks_480p[2]).val();


            //720p download links request
            $ = cheerio.load(downloadOptionsResponse_720p.data);
            let downloadpagelink_720p = $("a#downloadlink").attr("href");
            const downloadResponse_720p = await axios.get(Host + downloadpagelink_720p, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            $ = cheerio.load(downloadResponse_720p.data);
            let downloadlinks_720p = $("ul.downloadlinks p input");

            let downloadlink1_720p = $(downloadlinks_720p[0]).val();
            let downloadlink2_720p = $(downloadlinks_720p[1]).val();
            let downloadlink3_720p = $(downloadlinks_720p[2]).val();
            let links = {
                "480p 1": downloadlink1_480p,
                "720p 1": downloadlink1_720p,
                "480p 2": downloadlink2_480p,
                "720p 2": downloadlink2_720p,
                "480p 3": downloadlink3_480p,
                "720p 3": downloadlink3_720p,
            }

            setInformation(plot, links);

        } catch (error: any) {
            setInformation(null as any, null as any);
        }
    }
}
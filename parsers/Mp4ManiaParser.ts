import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source, URLDATA } from "../Types"

export default class Mp4ManiaSource implements Source {
    get name() {
        return "Mp4Mania"
    }

    get image_src() {
        return require("../assets/mp4mania_or_tvshows4mobile.png");
    }

    get HOST() {
        return "https://mp4mania1.net"
    }

    requestHeaders: any = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if (page) {
                response = await axios.get(this.HOST + "/showcat.php?catid=2&sort=1&letter=&page=" + page, {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });

            } else {
                response = await axios.get(this.HOST + "/showcat.php?catid=2", {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });
            }
            //temp code
            /*fs.writeFile("fzmovies.html",response.data,function (err) {
                if(err) 
            });*/

            const $ = cheerio.load(response.data);
            let titles_links = $(".mainlink a");

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
            let response;

            response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyAZqse88drGHvwcmfWNI1SD3DrThIfOr-A&cx=e4cab9346bf184212&q=${query}`, { headers: this.requestHeaders, timeout: 30000,
            signal: newAbortSignal(30000) });
            let response_text: string = response.data;
            /*
            
            
            
            let regex_text_arr = response_text.match(/("results":)(.|\n)*]/g);
            response_text = regex_text_arr === null ? '' : regex_text_arr[0];

            const data = JSON.parse(`{${response_text}}`) */
            const datalist: URLDATA[] = [];
            let data = response.data;
            for (let i = 0; i < data.items.length; i++) {
                datalist.push({
                    title: data.items[i].title,
                    link: data.items[i].formattedUrl.replace(`${this.HOST}/`, ""),
                    img: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
                    source: "Mp4Mania"
                });
            }

            setURLDATALIST(datalist);

            //fetchDataInfo(datalist[1].link);

        } catch (error) {
            
            setURLDATALIST([]);
        }
    }

    fetchDataInfo = async (link: string, setInformation: (plot: string, links: {}) => void) => {
        try {
            
            let response = await axios.get(this.HOST + "/" + link, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            let $ = cheerio.load(response.data);
            const plot = $($(".detail")[2]).text();
            let category:string = $($(".detail")[1]).text();
            category = category.replace(/Category:/gi,"").trimStart();
            let movie: string = $($(".detail")[0]).text();

            movie = movie.replace(/\sMovie:\s+/g, "")
            


            let link_id = link.replace("showmovie.php?id=", "");
            let download_url = `${this.HOST}/forcedownload.php?id=${link_id}&p=1&s=1`;
            setInformation(plot,{
                "Download (Includes Captcha)": download_url,
                "Download (Without Captcha, Inaccurate)": `http://mp41.dlmania.com/${category}/${movie}/${movie} (Mp4Mania).mp4`,
            })
        } catch (error: any) {
            
            setInformation(null as any, [] as any);
        }
    }
}

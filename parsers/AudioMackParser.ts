import axios from "axios";
const cheerio = require('react-native-cheerio');
import { Source, URLDATA } from "../Types"


export default class AudioMackSource implements Source {
    get name() {
        return "Audiomack"
    }

    get image_src() {
        return require("../assets/source-nn-logo.png");
    }

    get HOST() {
        return "https://audiomack.com"
    }
    
    requestHeaders: any = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "content-type": "text/html; charset=utf-8"
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if (page) {
                response = await axios.get(this.HOST + "/trending-now" + page, { headers: this.requestHeaders });

            } else {
                response = await axios.get(this.HOST + "/trending-now", { headers: this.requestHeaders });
            }
            //temp code
            /*fs.writeFile("fzmovies.html",response.data,function (err) {
                if(err) 
            });*/
            //const $ = cheerio.load(response.data);
            /*
            let artist = $(".music-detail__content a.music-detail__link span.music__heading--artist");
            let titles = $(".music-detail__content a.music-detail__link span.music__heading--title");
            let links = $(".music-detail__content a.music-detail__link");
            let images = $(".music-artwork.music-detail__image img");
            */
            let html:string = response.data
            let title_regex = /(<span class="music__heading--title">)(.+?)(<\/span>)/g;
            let artist_regex = /(<span class="music__heading--artist u-d-block">)(.+?)(<\/span>)/g
            let link_regex = /(<a class="music-detail__link" tabindex="0" href=")(.+?)(">)/g
            let image_regex = /(?:<img.+?srcSet=")(.+?)(?:"><a class="music-detail__link")/g
            let length = html.match(link_regex)?.length as any;
            
            
            const datalist: URLDATA[] = [];
            for(let i = 0; i< length; i++){
            
                
                let title = title_regex.exec(html);
                let artist = artist_regex.exec(html);
                let link = link_regex.exec(html);
                let image = image_regex.exec(html);
            

                if(title !== null && artist !== null && link !== null && image !== null){
                    datalist.push({
                        title: artist[0] + ": " + title[0],
                        link: link[0] || '',
                        img: image[0] || ''
                    });
                }else
                break;
            }
            /*
            for (let index = 0; index < titles.length; index++) {
                let title = `${$(artist[index]).text()}: ${$(titles[index]).text()}`;
                let link = $(links[index]).attr("href");
                let img = $(images[index]).attr("src");
                datalist.push({
                    title: title,
                    link: link || '',
                    img: img || ''
                });
            }
            */


            setURLDATALIST(datalist)
            //fetchDataInfo(datalist[1].link);

        } catch (error) {
            
            
            setURLDATALIST(null as any);
        }
    }

    searchController: AbortController | undefined;
    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string, page?: number) => {

        try {
            if (query.trim().length == 0) {
                return;
            }
            if (this.searchController) {
                this.searchController.abort();
            }
            this.searchController = new AbortController();
            let response;
            if (page) {
                response = await axios.get(this.HOST + "/search?t=" + query + "&page=" + page, { headers: this.requestHeaders, signal: this.searchController.signal });
            } else {
                response = await axios.get(this.HOST + "/search?t=" + query, { headers: this.requestHeaders, signal: this.searchController.signal });
            }



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
            const response = await axios.get(link, { headers: this.requestHeaders });
            let $ = cheerio.load(response.data);
            let plot = $("article.post-body > p").text()
            let downloadpagelink = $("div.download-block .db-one:first-child a").attr("href")
            this.requestHeaders["referer"] = link;

            const downloadpageresponse = await axios.get(this.HOST + downloadpagelink, { headers: this.requestHeaders });
            $ = cheerio.load(downloadpageresponse.data);
            let page_url = $("link[itemprop='url']").attr("href") || "";

            let tokenarr = page_url.match(/\/\w*(?=\-)/g) as string[];
            let token = tokenarr[0];
            token = token.replace("/", "")

            delete this.requestHeaders["referer"]
            const downloadresponse = await axios.get("https://api.sabishare.com/token/download/" + token, { headers: this.requestHeaders });
            const url = downloadresponse.data.data.url;
            setInformation(plot, {
                Download: url
            })
        } catch (error) {
            setInformation(null as any, null as any);
        }
    }
}

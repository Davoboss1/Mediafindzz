import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source, URLDATA } from "../Types"


export default class GenytSource implements Source {
    get name() {
        return "GenYoutube"
    }

    get image_src() {
        return require("../assets/genyt.png");
    }

    get HOST() {
        return "https://www.genyt.net/";
    }
    
    requestHeaders: any = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if(page){
                setURLDATALIST([]);
                return;
            }
            response = await axios.get(this.HOST, { headers: this.requestHeaders, 
                timeout: 30000,
                signal: newAbortSignal(30000)});
            

            const $ = cheerio.load(response.data);
            let titles_and_links = $(".gytDetail .gytTitle a");
            let images = $(".gytImg picture img");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles_and_links.length; index++) {
                let title = $(titles_and_links[index]).text();
                let link = $(titles_and_links[index]).attr("href");
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
            let response;
            response = await axios.get(this.HOST + "/search.php?q=" + query, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });  

            const $ = cheerio.load(response.data);
            let titles_and_links = $(".gytDetail .gytTitle a");
            let images = $(".gytImg picture img");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles_and_links.length; index++) {
                let title = $(titles_and_links[index]).text();
                let link = $(titles_and_links[index]).attr("href");
                let img = $(images[index]).attr("src");
                datalist.push({
                    title: title,
                    link: link || '',
                    img: img || '',
                    source: "Genyt"
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
            const response = await axios.get(link, { headers: this.requestHeaders ,timeout: 30000,
                signal: newAbortSignal(30000)});
            let $ = cheerio.load(response.data);
            let plot = "";
            let getlinktext:string = $("noscript").text();
            let link_text_regex = getlinktext.match(/href="[^"]*/g);
            let link_text = link_text_regex ? link_text_regex[0] : "";
            let getlink = link_text.replace('href="',"");
            if(!getlink.startsWith("https://")){
                let res_text : string = response.data;
                let ms_id_arr = res_text.match(/var\s*ms\s*=.*;/g);
                let mh_id_arr = res_text.match(/var\s*mh\s*=.*;/g);
                let ms_id = ms_id_arr ? ms_id_arr[0] : '';
                let mh_id = mh_id_arr ? mh_id_arr[0] : '';
                ms_id = ms_id.replace("var ms = ","");
                ms_id = ms_id.replace(";","");
                ms_id = ms_id.replace(/'/g,"");
                mh_id = mh_id.replace("var mh = ","");
                mh_id = mh_id.replace(";","");
                mh_id = mh_id.replace(/'/g,"");
                let arg_link_arr = link.match("net\/.*");
                let arg_link = arg_link_arr ? arg_link_arr[0] : '';
                arg_link = arg_link.replace("net/","")
                getlink = `https://www.genyt.net/getLinks.php?vid=${arg_link}&s=${ms_id}&h=${mh_id}&t=html&l=1`;
            }         
               
            const links_response = await axios.get(getlink, { headers: this.requestHeaders });
            $ = cheerio.load(links_response.data);
            let links_container = $(".ytdl #tab_default_1 a.btn.btn-sm");
            if(links_container.length === 0){
                links_container = $(".ytdl a.btn.btn-sm");
            }
            let urls:any = {}
            for(let i =0; i<links_container.length;i++){
                urls[$(links_container[i]).text()] = $(links_container[i]).attr("href");
            }
            setInformation(plot, urls)
        } catch (error) {
            
            
            setInformation(null as any, null as any);
        }
    }
}

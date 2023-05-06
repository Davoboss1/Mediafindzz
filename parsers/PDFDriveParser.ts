import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source , URLDATA} from "../Types"

export default class PDFDriveSource implements Source{
    get name(){
        return "PDFDrive"
    }
    
    get image_src(){
        return require("../assets/pdfdrive.png");
    }

    get HOST(){
        return "https://www.pdfdrive.com"
    }

    requestHeaders = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {
        try {

            let response;
            if (page) {
                response = await axios.get(this.HOST + "/category/113/p" + page, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            } else {
                response = await axios.get(this.HOST + "/category/113", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            }
            
            //load to cheerio
            const $ = cheerio.load(response.data);
            let container = $("div.files-new ul li");
            let links = container.find("div.file-right a");
            let titles = container.find("div.file-right h2");
            let imgs = container.find("div.file-left a > img");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles.length; index++) {
                datalist.push({
                    title: $(titles[index]).text(),
                    link: $(links[index]).attr("href") || '',
                    img: $(imgs[index]).attr("src") || '',
                    
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
            let response = await axios.get(this.HOST + "/search?q=" + query + "&pagecount=&pubyear=&searchin=&em=", { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            //load to cheerio
            const $ = cheerio.load(response.data);
            let container = $("div.files-new ul li");
            let links = container.find("div.file-right a");
            let titles = container.find("div.file-right h2");
            let imgs = container.find("div.file-left a > img");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < titles.length; index++) {
                datalist.push({
                    title: $(titles[index]).text(),
                    link: $(links[index]).attr("href") || '',
                    img: $(imgs[index]).attr("src") || '',
                    source: "Pdfdrive",
                });
            }

            setURLDATALIST(datalist);
            //fetchDataInfo(datalist[0].
        } catch (error) {
            setURLDATALIST([]);
        }
    }

    fetchDataInfo = async (link: string, setInformation: (plot: string, links: {}) => void) => {
        try {

            const Host = this.HOST;
            //Replace id in link using regex
            // e39338383 -> de39338383
            let link_id_arr = link.match(/(?!-)e\d*(?=\.html)/g);
            let link_id_str = link_id_arr ? link_id_arr[0] : "";
            let new_link_id_str = link_id_str.replace("e", "d");
            link = link.replace(link_id_str, new_link_id_str);
            


            const response = await axios.get(Host + link, { headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000) });
            let response_text: string = response.data;
            let id_arr = response_text.match(/(?!^{id:'$)\d{6,20}(?=',)/g);
            let id = id_arr ? id_arr[0] : "";
            let session_id_arr = response_text.match(/(session:').{20,40}(?=',)/g);
            let session_id = session_id_arr ? session_id_arr[0] : "";
            session_id = session_id.replace("session:'", "");
            
            

            let $ = cheerio.load(response.data);

            let plot = "";

            let links = {
                "PDF": `https://www.pdfdrive.com/download.pdf?id=${id}&h=${session_id}&u=cache&ext=pdf`
            }

            setInformation(plot, links);

        } catch (error: any) {
            setInformation(null as any, null as any);
        }
    }
}

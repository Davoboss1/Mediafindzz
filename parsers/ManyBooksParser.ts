import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source, URLDATA } from "../Types"

export default class ManyBooksSource implements Source {
    get name() {
        return "ManyBooks"
    }

    get image_src() {
        return require("../assets/pdfdrive.png");
    }

    get HOST() {
        return "https://manybooks.net"
    }

    requestHeaders = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "Cookie": `mobile_app_banner_modal_percents=0.37027832915125414; _ga=GA1.2.1494660034.1683291886; _gid=GA1.2.1839869084.1683291886; __gpi=UID=00000c10595e82c8:T=1683291888:RT=1683291888:S=ALNI_MaJO5BeAWPsF0v59ua6eRJrgMijGA; fsbotchecked=true; _fssid=0149e989-be30-45f8-a06f-e7a36e9640e6; _pbjs_userid_consent_data=3524755945110770; cookie=891e847f-a6ca-4875-b484-6367c290b79e; __gads=ID=f73fca728ff1ea75-22e79bbbb1dc00f0:T=1683291888:S=ALNI_MbdxcTTPLNE5Z4YUb6EzPhPUQ5OIg; __qca=P0-1394103105-1683291909690; _lr_retry_request=true; _lr_env_src_ats=false; panoramaId_expiry=1683378312624; _cc_id=8d83a115b462db0beb77e9af5702125c; panoramaId=9f0b3191058d3945fb38f03534f6a9fb927a0353d04a87d47cea59e7021c0ade; SSESS638aad2a38a8d64c64f7efc3ac6b5c0b=jxmZfwcTJ1CmX0vrX%2CAFSperAr-NjDQcrz9rX9ZbuhMUaZeg; cto_bundle=_oAL7F9PeExFNHVsTyUyQm1lVVNQaDJmZEpBS1BWWjBCWCUyQnppRiUyRk9LaTdGZ05UVGdxTE52JTJGVjlJejNoQ05SY3RobHNDZGRwZEVLM2FCUHhaZVJJJTJGUUd1TlVsc0tnNVZSdVdRT0M0OWNianVITk52V1Q0T3BuOWMlMkJSTTFvZTIlMkJrZ0w5OFBBV1FMczRIajVRcSUyQmtNQ0Vmc2xQeHN3JTNEJTNE`
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {
        try {
            
            let response;
            if (page) {
                response = await axios.get(this.HOST + "/search-book?check_logged_in=1&language=All&search=&sticky=All&created_op=%3C&created%5Bvalue%5D=0&created%5Bmin%5D=&created%5Bmax%5D=&author_uid_op=%3E%3D&author_uid%5Bvalue%5D=0&author_uid%5Bmin%5D=&author_uid%5Bmax%5D=&sort_by=field_downloads&page="+page, {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });
            } else {
                response = await axios.get(this.HOST + "/search-book?check_logged_in=1", {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });
            }
            
            //load to cheerio
            const $ = cheerio.load(response.data);
            let links_titles = $("div.content > div:nth-child(2) a");
            let imgs = $("div.content img");
            const datalist: URLDATA[] = [];
            for (let index = 0; index < links_titles.length; index++) {
                datalist.push({
                    title: $(links_titles[index]).text(),
                    link: this.HOST + $(links_titles[index]).attr("href") || '',
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
            let response = await axios.get(this.HOST + "/search-book?search=" + query, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });
            //load to cheerio
            const $ = cheerio.load(response.data);
            let links_titles = $("div.content > div:nth-child(2) a");
            let imgs = $("div.content img");

            const datalist: URLDATA[] = [];
            for (let index = 0; index < links_titles.length; index++) {
                datalist.push({
                    title: $(links_titles[index]).text(),
                    link: this.HOST + $(links_titles[index]).attr("href") || '',
                    img: this.HOST + $(imgs[index]).attr("src") || '',
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
            let container = $("div.block-region-top-center");
            let plot = container.find(".field--name-field-description").text();
            let book_id_link:string = container.find(".block-book-file-links a.mb-link-files").attr("href");
            let book_id = book_id_link.replace(/\/.*\//g,"");
            let pdf = this.HOST + "/books/get/" + book_id + "/6"
            let epub = this.HOST + "/books/get/" + book_id + "/2"
            let html = this.HOST + "/books/get/" + book_id + "/1"
            let txt = this.HOST + "/books/get/" + book_id + "/8"

            let links = {
                "PDF": pdf,
                "EPUB": epub,
                "HTML": html,
                "TXT": txt,
            }

            setInformation(plot, links);

        } catch (error: any) {
            setInformation(null as any, null as any);
        }
    }
}

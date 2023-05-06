import axios from "axios";
const cheerio = require('react-native-cheerio');
import { newAbortSignal, Source, URLDATA } from "../Types"


export default class Soap2daySource implements Source {
    get name() {
        return "Soap2day"
    }

    get image_src() {
        return require("../assets/soap2day-icon.png");
    }

    get HOST() {
        return "https://soap2day.to"
    }

    get URL() {
        return this.HOST + "/movielist/";
    }

    get PAGEURL() {
        return this.HOST + "/movielist/?page=";
    }

    SEARCHURL(query: string): string {
        return this.HOST + '/search/keyword/' + query;
    }

    get renderInWebview() {
        return true;
    }

    requestHeaders: any = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    }

    get fetchDataListInjectJavascript() {
        return `
        let btn = document.querySelector('#btnhome')
        if(btn){
        setTimeout(() => {
            btn.click();
            //window.ReactNativeWebView.postMessage(document.querySelector('body').innerHTML);
        }, 2000);
        }else{
            window.ReactNativeWebView.postMessage(document.querySelector('body').innerHTML);
        }`;
    }

    get fetchDataInfoInjectJavascript() {
        return `
        let timer = setInterval(function () {
            let video = document.querySelector("video");
            if(video.getAttribute("src")){
                window.ReactNativeWebView.postMessage(document.querySelector('body').innerHTML);
                clearInterval(timer);
            }
        },1000)`;
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number, htmlstring?: string) => {

        try {
            if (htmlstring) {
                const datalist: URLDATA[] = [];
                //load to cheerio
                const $ = cheerio.load(htmlstring);
                let container = $(".thumbnail");
                if (container.length > 0) {
                    let titles_and_links = container.find("div > h5 > a");
                    let imgs = container.find(".img-group img");
                    for (let index = 0; index < titles_and_links.length; index++) {
                        datalist.push({
                            title: $(titles_and_links[index]).text(),
                            link: this.HOST + $(titles_and_links[index]).attr("href"),
                            img: this.HOST + $(imgs[index]).attr("src"),
                        });
                    }
                    setURLDATALIST(datalist);
                }
            }
        } catch (error) {
            setURLDATALIST(null as any);
        }
    }

    searchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, query: string, htmlstring?: string) => {
        try {
            

            if (htmlstring) {
                const datalist: URLDATA[] = [];
                //load to cheerio
                const $ = cheerio.load(htmlstring);
                let main_container = $($(".row > div")[3])
                let container = main_container.find(".thumbnail");
                
                
                
                if (container.length > 0) {
                    let titles_and_links = container.find("div > h5 > a");
                    let imgs = container.find(".img-group img");
                    for (let index = 0; index < titles_and_links.length; index++) {
                        datalist.push({
                            title: $(titles_and_links[index]).text(),
                            link: this.HOST + $(titles_and_links[index]).attr("href"),
                            img: this.HOST + $(imgs[index]).attr("src"),
                            source: "Soap2day"
                        });
                        
                        
                        
                    }
                    setURLDATALIST(datalist);
                }
            }
        } catch (error) {
            
            setURLDATALIST(null as any);
        }
    }

    fetchDataInfo = async (html: string, setInformation: (plot: string, links: {}) => void) => {
        try {
            let $ = cheerio.load(html);
            let plot: string = $("p#wrap").text();
            plot = plot.trim();
            let video_link = $("video").attr("src");
            setInformation(plot, {
                Download: video_link
            })
        } catch (error) {
            setInformation(null as any, null as any);
        }
    }
}

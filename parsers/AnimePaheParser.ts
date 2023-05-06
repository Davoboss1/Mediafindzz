import axios from "axios";
const cheerio = require('react-native-cheerio');

import { newAbortSignal, Seasontype, Source, URLDATA } from "../Types"

export default class AnimePaheSource implements Source {
    get name() {
        return "AnimePahe"
    }

    get image_src() {
        return require("../assets/animepahe-icon.png");
    }

    get HOST() {
        return "https://animepahe.ru"
    }

    requestHeaders: any = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    }

    fetchDataList = async (setURLDATALIST: (arr: URLDATA[]) => void, page?: number) => {

        try {
            let response;
            if (page) {
                response = await axios.get(this.HOST + "/api?m=airing&page=" + page, {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });

            } else {
                response = await axios.get(this.HOST + "/api?m=airing&page=1", {
                    headers: this.requestHeaders, timeout: 30000,
                    signal: newAbortSignal(30000)
                });
            }
            const data = response.data.data;
            const datalist: URLDATA[] = [];
            for (let index = 0; index < data.length; index++) {
                let title = data[index].anime_title;
                let link = this.HOST + "/anime/" + data[index].anime_session + "/";
                let img = data[index].snapshot;
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
            let requestHeaders = this.requestHeaders;
            requestHeaders["x-requested-with"] = "XMLHttpRequest";
            
            response = await axios.get(this.HOST + "/api?m=search&q="+query, {
                headers: requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });

            const data = response.data.data;
            const datalist: URLDATA[] = [];
            for (let index = 0; index < data.length; index++) {
                let title = data[index].title;
                let link = this.HOST + "/anime/" + data[index].session + "/";
                let img = data[index].poster;
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
            let link_id = seasonUrl.replace("https://animepahe.ru/anime/", "")
            link_id = link_id.replace("/", "")


            response = await axios.get(seasonUrl, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });


            //load to cheerio
            let $ = cheerio.load(response.data);
            let plot = $("div.anime-synopsis").text();

            response = await axios.get(`${this.HOST}/api?m=release&id=${link_id}&sort=episode_asc`, {
                headers: this.requestHeaders, timeout: 30000,
                signal: newAbortSignal(30000)
            });

            let data = response.data;



            let anime_data = data.data

            let requestHeaders = this.requestHeaders;
            let HOST = this.HOST;
            requestHeaders["x-requested-with"] = "XMLHttpRequest";
            let request_count = data.current_page;

            let episodes: { title: string, link: string }[] = []

            //Add initial request data to array
            for (let index = 0; index < anime_data.length; index++) {
                episodes.push({
                    title: "Episode " + anime_data[index].episode,
                    link: `${HOST}/play/${link_id}/${anime_data[index].session}`,
                });
            }

            if (data.last_page === 1)
                setURLDATALIST([{
                    index: 1,
                    season_title: "Episode List",
                    episodes: episodes
                }], plot);
            else
                //Add More request data to array
                for (let page = data.current_page + 1; page <= data.last_page; page++) {
                    (async function () {
                        try {


                            let response = await axios.get(`${HOST}/api?m=release&id=${link_id}&sort=episode_asc&page=${page}`, {
                                headers: requestHeaders, timeout: 30000,
                                signal: newAbortSignal(30000)

                            });

                            let anime_data = response.data.data;
                            for (let index = 0; index < anime_data.length; index++) {
                                episodes.push({
                                    title: "Episode " + anime_data[index].episode,
                                    link: `${HOST}/play/${link_id}/${anime_data[index].session}`,
                                });
                            }
                            request_count++;


                            if (request_count === data.last_page) {
                                setURLDATALIST([{
                                    index: 1,
                                    season_title: "Episode List",
                                    episodes: episodes
                                }], plot);
                            }
                        } catch (err) {

                            throw err;

                        }
                    })();
                }

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
            let $ = cheerio.load(response.data);
            let download_page_links = $("div#pickDownload > a");


            //Go through all links and make request to all
            let requestHeaders = this.requestHeaders;

            //Count number of request to detect if all requests are completed
            let request_count = 0;
            let download_links_object: any = {};
            for (let index = 0; index < download_page_links.length; index++) {
                //Run requests async
                (async function () {
                    try {
                        //Steps to successfully get download link
                        let temp_link = $(download_page_links[index]).attr("href");

                        response = await axios.get(temp_link, {
                            headers: requestHeaders, timeout: 30000,
                            signal: newAbortSignal(30000)
                        });

                        $ = cheerio.load(response.data);
                        temp_link = $("a.redirect").attr("href");


                        response = await axios.get(temp_link, {
                            headers: requestHeaders, timeout: 30000,
                            signal: newAbortSignal(30000)
                        });

                        $ = cheerio.load(response.data);
                        let download_size = $("abbr").text();
                        let regex_arr = new RegExp(/(<script>)((.|\n)*?)(<\/script>)/g).exec(response.data)
                        let regex_str = regex_arr ? regex_arr[2] : '';
                        let value: string = "";
                        regex_str = regex_str.replace(/return.decodeURIComponent/g, "value = decodeURIComponent");
                        eval(regex_str);
                        let html_fragment_arr = value.match(/<form.*<\/form>/g);
                        let html_fragment = html_fragment_arr ? html_fragment_arr[0] : "";

                        $ = cheerio.load(html_fragment);

                        const download_form = $("form");
                        let downloadlink = download_form.attr("action");
                        let token = download_form.find("input[type=hidden]").val();
                        //
                        //

                        let headers = requestHeaders;
                        headers["Cookie"] = response.headers["set-cookie"];
                        headers["Referer"] = temp_link;
                        headers["Range"] = "bytes=0-0"
                        response = await axios.post(downloadlink, { "_token": token }, {
                            headers: headers,
                            signal: newAbortSignal(30000)
                        });
                        //
                        //


                        download_links_object[`Download ${download_size}`] = response.request.responseURL;
                        request_count++;
                        if (request_count === download_page_links.length) {
                            setInformation(plot, download_links_object)
                        }
                    } catch (err) {
                        throw err;
                    }
                })();



            }



        } catch (error: any) {

            setInformation(null as any, [] as any);
        }
    }
}

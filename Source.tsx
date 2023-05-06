import FZMoviesSource from "./parsers/FZMoviesParser";
import NetNaijaSource from "./parsers/NNMoviesParser";
import PDFDriveSource from "./parsers/PDFDriveParser";
import GenytSource from "./parsers/GenytParser";
import MobiletvshowsSource from "./parsers/MobileTvshowsParser"; 
import {Source} from "./Types";
import AudioMackSource from "./parsers/AudioMackParser";
import GenytMusicSource from "./parsers/GenytMusicParser";
import Mp4ManiaSource from "./parsers/Mp4ManiaParser";
import Tvshows4MobileSource from "./parsers/Tvshows4MobileParser";
import Soap2daySource from "./parsers/Soap2DayMovies";
import Soap2dayTvshowsSource from "./parsers/Soap2DayTvshows";
import WcoSource from "./parsers/WCOParser";
import AnimePaheSource from "./parsers/AnimePaheParser";
import BooksFreeSource from "./parsers/BooksFreeParser";
import ManyBooksSource from "./parsers/ManyBooksParser";
export const Categories = {
  "Movies" : [new FZMoviesSource(),new NetNaijaSource(), new Mp4ManiaSource(),new Soap2daySource()],
  "TV Shows" : [new MobiletvshowsSource(),new Tvshows4MobileSource(),new Soap2dayTvshowsSource()],
  "Anime" : [new WcoSource(), new AnimePaheSource()],
  "Books" : [new BooksFreeSource(),new PDFDriveSource(), new ManyBooksSource()],
  "Music" : [new GenytMusicSource(),],
  "Videos" : [new GenytSource(),],
}
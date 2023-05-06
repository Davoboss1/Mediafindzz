import { useState, useContext, useEffect } from "react";
import { View, ActivityIndicator, FlatList, TouchableOpacity, Pressable, Modal, Image, Text } from "react-native";
import { itemViewStyle, menuStyle, sourceModalStyle, tvShowDisplayStyle } from "../styles/style";
import { Seasontype, Source } from "../Types";
import { SourcesContext, SourceContext, webviewObjectsContext, LightThemeContext } from "./Contexts";
import { ErrorDisplay } from "./ErrorDisplay";

export const TvshowsEpisodeDisplay = ({ route, navigation }: any) => {
  const item_param = route.params;
  const [description, setdescription] = useState("");
  const [data, setdatalist] = useState<Seasontype[]>([]);
  const [loading, setloading] = useState(true);
  const [showImageModal, setshowImageModal] = useState(false);
  const [displayImage, setdisplayImage] = useState("");
  const sources = useContext(SourcesContext);
  const isLightTheme = useContext(LightThemeContext);
  const { webviewObjects, setWebviewObjects } = useContext(webviewObjectsContext);


  let source: Source;
  if (item_param.sourceIndex !== undefined && item_param.sourceIndex < sources.length) {
    source = sources[item_param.sourceIndex];
  } else {
    source = useContext(SourceContext);

  }

  const makeRequest = () => {
    if (source.fetchEpisodeList) {
      source.fetchEpisodeList(item_param.link, (arr: Seasontype[], plot: string) => {
        setdescription(plot);
        setdatalist(arr);
        setloading(false);
      });
    }
  }

  const makeWebviewRequest = (page?: number) => {
    if (source.URL && source.fetchDataListInjectJavascript) {
      setWebviewObjects([{
        url: item_param.link,
        injectedJavaScript: source.fetchDataListInjectJavascript,
        fetchEpisodeList: source.fetchEpisodeList,
        DataSetter: (arr: Seasontype[], plot: string) => {
          setdescription(plot);
          setdatalist(arr);
          setloading(false);
        }
      }])
    }
  }

  useEffect(() => {
    setloading(true);
    if (source.renderInWebview) {
      makeWebviewRequest();
    } else {
      makeRequest();
    }
  }, []);

  const sortSeason = (a: Seasontype, b: Seasontype) => {
    return a.index - b.index;
  }

  const sortSeasonName = (a: Seasontype, b: Seasontype) => {
    let digits_from_text = a.season_title.replace(/^\D+/g, '');
    let second_digits_from_text = b.season_title.replace(/^\D+/g, '');
    if (digits_from_text && second_digits_from_text)
      return parseInt(digits_from_text) - parseInt(second_digits_from_text);
    else
      return a.season_title.localeCompare(b.season_title);
  }

  const sortEpisodes = (a: {
    title: string,
    link: string
  }, b: {
    title: string,
    link: string
  }) => {
    let digits_from_text = a.title.replace(/^\D+/g, '');
    let second_digits_from_text = b.title.replace(/^\D+/g, '');
    if (digits_from_text && second_digits_from_text)
      return parseInt(digits_from_text) - parseInt(second_digits_from_text);
    else
      return a.title.localeCompare(b.title);
  }

  const Header = (
    <View style={[tvShowDisplayStyle.tvShowContainer, { backgroundColor: isLightTheme ? "white" : "#1C1C1C" }]}>
      {loading ? <ActivityIndicator animating={loading} color={"#AD1457"} size={"large"} /> :
        <FlatList ListHeaderComponent={
          <View style={itemViewStyle.container}>
            <TouchableOpacity onPress={() => {
              setshowImageModal(true);
              setdisplayImage(item_param.img);
            }} style={{ width: "40%" }}>
              <Image source={{ uri: item_param.img }} style={itemViewStyle.image} />
            </TouchableOpacity>
            <View style={itemViewStyle.textContainer}>

              <Text style={[tvShowDisplayStyle.title, { color: isLightTheme ? "#1C1C1C" : "white" }]}>
                {item_param.title}
              </Text>
              <Text style={[itemViewStyle.text, { color: isLightTheme ? "#1C1C1C" : "white" }]}>
                {description}
              </Text>
            </View>
          </View>
        } data={data ? data.sort(sortSeasonName) : []}
          renderItem={({ item, index }: { item: Seasontype, index: number }) => (
            <View key={item.season_title + index} style={[menuStyle.menuContainer, { flexWrap: "wrap", marginBottom: 10, paddingBottom: 20, backgroundColor: isLightTheme ? "white" : "#1C1C1C" }]}>
              <Text style={[tvShowDisplayStyle.season_title, { color: isLightTheme ? "#1C1C1C" : "white" }]}>{item.season_title}</Text>
              {item.episodes.sort(sortEpisodes).map((item, index) => (
                <View style={{ width: "100%", justifyContent: "center" }} key={item.title + index}>

                  <Pressable style={[menuStyle.button, {
                    width: "95%",
                  }]} onPress={() => {

                    navigation.push("ItemDisplay", { title: item.title, link: item.link, img: item_param.img, isEpisode: true, sourceIndex: item_param.sourceIndex });
                  }}>
                    <Text style={{
                      color: "white",
                      textAlign: "center",
                      fontFamily: "Jost",
                    }}>{item.title}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )} />}

    </View>
  );
  return (<>
    {data === null ? <ErrorDisplay request={makeRequest} /> :
      <>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showImageModal}
          onRequestClose={() => {
            setshowImageModal(false);
          }}>
          <TouchableOpacity onPressOut={() => (setshowImageModal(false))} style={sourceModalStyle.centeredView}>
            <Image source={{ uri: displayImage }} style={{ height: "70%", width: "95%" }} />
          </TouchableOpacity>
        </Modal>
        {Header}
      </>}
  </>);
}
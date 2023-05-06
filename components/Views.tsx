import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Pressable, Image, Text } from "react-native";
import WebView from "react-native-webview";
import { itemStyle } from "../styles/style";
import { Seasontype, URLDATA } from "../Types";
import { LightThemeContext, webviewObjectsContext } from "./Contexts";

export const ItemView = ({ image, title, action, displayImageModal, setImage }: { image: string, title: string, action: () => void, displayImageModal: any, setImage: any }) => (
  <View style={itemStyle.container} >
    <TouchableOpacity onPress={() => {
      displayImageModal(true);
      setImage(image);
    }}>
      <Image source={{ uri: image }} style={itemStyle.image} />
    </TouchableOpacity>

    <Text style={[itemStyle.title,{color: useContext(LightThemeContext) ? "#1C1C1C" : "white"}]}  >{title}
    </Text>
    <Pressable android_ripple={{ color: "grey", radius: 5, }} style={itemStyle.button} onPress={action}>
      <Text style={{ color: "#3A0C26" }}>Get</Text>
    </Pressable>
  </View>
);

export type webviewComponentProps = {
  url: string,
  injectedJavaScript: string,
  fetchDataList?(setURLDATALIST: (arr: URLDATA[]) => void, page?: number, htmlstring?: string): void,
  searchDataList?(setURLDATALIST: (arr: URLDATA[]) => void, query: string, htmlstring?: string): void,
  fetchEpisodeList?(seasonUrl_or_html: string, setURLDATALIST: (arr: Seasontype[], plot: string) => void): void,
  fetchDataInfo?(link: string, setInformation: (plot: string, links: {}) => void): void,
  DataSetter: any,
}
export const RenderInWebView = ({ webviewObject, index }: { webviewObject: webviewComponentProps, index: number }) => {
  const { url, injectedJavaScript, fetchDataList, fetchEpisodeList, fetchDataInfo, searchDataList, DataSetter } = webviewObject;
  const [responseHTML, setresponseHTML] = useState("");
  const { webviewObjects } = useContext(webviewObjectsContext);
  const webviewRef = useRef<any>(null);
  const previous_url = useRef<string>(url);

  useEffect(() => {

    if (previous_url.current == url) {
      if (responseHTML) {
        setTimeout(() => {
          callResponseHandler(responseHTML);
          previous_url.current = url;
        }, 100);
      }
    } else {
      setresponseHTML("");
    }
  }, [webviewObjects]);


  const callResponseHandler = (data: string) => {
    if (fetchDataList) {
      fetchDataList(DataSetter, undefined, data);
    }
    if (searchDataList) {
      searchDataList(DataSetter, "", data);
    }
    if (fetchEpisodeList) {
      fetchEpisodeList(data, DataSetter);
    }
    if (fetchDataInfo) {
      fetchDataInfo(data, DataSetter);
    }
  }

  return (<View style={{ position: "absolute", width: "100%", height: "100%", zIndex: 0, display: "none" }}>
    <WebView ref={webviewRef} injectedJavaScript={injectedJavaScript} mediaPlaybackRequiresUserAction={false} source={{ uri: url }} onMessage={(event) => {
      if (!responseHTML) {
        callResponseHandler(event.nativeEvent.data);
        setresponseHTML(event.nativeEvent.data);
      }

    }} />
  </View>);
}
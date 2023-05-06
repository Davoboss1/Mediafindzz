import { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Pressable, Image, Share, Linking, Alert, ActivityIndicator, Modal } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
  renderers
} from 'react-native-popup-menu';
import { itemStyle, itemViewStyle, menuStyle, sourceModalStyle } from "../styles/style";
import { Source } from "../Types";
import { webviewObjectsContext, SourceContext, SourcesContext, LightThemeContext } from "./Contexts";
import { ErrorDisplay } from "./ErrorDisplay";
import { ListDisplay } from "./ListDisplay";
import { RenderInWebView, webviewComponentProps } from "./Views";

export type Item = { title: string, link: string, img: string };


export const ItemDisplay = ({ route, navigation }: any) => {
  const item = route.params;
  const [description, setdescription] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [quality_list, setQuality_list] = useState<string[]>([]);
  const [loading, setloading] = useState(true);
  const sources = useContext(SourcesContext);
  const isLightTheme = useContext(LightThemeContext);
  const { webviewObjects, setWebviewObjects } = useContext(webviewObjectsContext);

  let source: Source;
  if (item.sourceIndex !== undefined && item.sourceIndex < sources.length) {
    source = sources[item.sourceIndex];
  } else {
    source = useContext(SourceContext);
  }

  const [showImageModal, setshowImageModal] = useState(false);
  const [displayImage, setdisplayImage] = useState("");

  const responseSetter = (description: string, links_data: any) => {

    if (description) {
      setdescription(description);
    }
    if (links_data) {
      setQuality_list(Object.keys(links_data));
      setLinks(Object.values(links_data));
    } else {
      setLinks(null as any);
    }
    setloading(false);
  }

  //Set webview object to allow request from webview
  const webviewrequest = (arg?: webviewComponentProps) => {
    setloading(true);
    if (arg)
      setWebviewObjects([{
        url: item.link,
        injectedJavaScript: source.fetchDataInfoInjectJavascript as string,
        fetchDataInfo: source.fetchDataInfo,
        DataSetter: responseSetter,
      },arg])
    else
      setWebviewObjects([{
        url: item.link,
        injectedJavaScript: source.fetchDataInfoInjectJavascript as string,
        fetchDataInfo: source.fetchDataInfo,
        DataSetter: responseSetter,
      }])
  }

  const makeRequest = () => {
    setloading(true);
    setLinks([]);
    if (!source.renderInWebview)
      source.fetchDataInfo(item.link, responseSetter);
  }

  useEffect(() => {
    if (item.fromSearch && source.renderInWebview) {
      webviewrequest();
    } else
      makeRequest();
  }, [item]);


  const OpenInExternal = (item: any, link: string) => {
    Share.share({
      url: link,
      message: link
    }).then((result) => {
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          
        } else {
          
        }
      } else if (result.action === Share.dismissedAction) {
        
      }
    }).catch((error) => {
      Alert.alert("Failed to share", error.message)
    });
  }

  const WatchLink = (link: string) => {
    Linking.openURL(link);
  }

  const DownloadLink = (item: any, link: string) => {
    Alert.alert("Coming soon", "In app download coming soon");
  }

  const Header = (
    <>
      <View style={itemViewStyle.container}>
        <TouchableOpacity onPress={() => {
          setshowImageModal(true);
          setdisplayImage(item.img);
        }} style={{ width: "40%" }}>
          <Image source={{ uri: item.img }} style={itemViewStyle.image} />
        </TouchableOpacity>
        <View style={itemViewStyle.textContainer}>
          <Text style={[itemViewStyle.title_text,{color: isLightTheme ? "#1C1C1C" : "white"}]}>
            {item.title}
          </Text>
          <Text style={[itemViewStyle.text,{color: isLightTheme ? "#1C1C1C" : "white"}]}>
            {loading ? (<ActivityIndicator animating={loading} color={"#AD1457"} size={"small"} />) : description}
          </Text>
        </View>
      </View>

      <View style={[menuStyle.menuContainer, { flexWrap: "wrap", backgroundColor: isLightTheme ? "white" : "#1C1C1C" }]}>
        <Text style={[itemViewStyle
        .download_text,{color: isLightTheme ? "#1C1C1C" : "white"}]}>Download</Text>

        {loading && <ActivityIndicator style={{ marginLeft: "auto", marginRight: "auto" }} animating={loading} color={"#AD1457"} size={"small"} />}
        {quality_list.map((item, index) => (
          <View style={{ width: "50%", justifyContent: "center" }} key={item + index}>
            {links[index] &&
              <Menu renderer={renderers.SlideInMenu}>
                <MenuTrigger style={[menuStyle.button, {
                  width: "95%",
                }]}
                  children={
                    <Text style={{
                      color: "white",
                      textAlign: "center",
                      fontFamily: "Jost",
                    }}>{item}</Text>
                  } />
                <MenuOptions>
                  <MenuOption style={{
                    padding: 15
                  }} onSelect={() => WatchLink(links[index])} text='Open' />
                  <MenuOption style={{
                    padding: 15
                  }} onSelect={() => DownloadLink(item, links[index])} text='Download' />
                  <MenuOption style={{
                    padding: 15
                  }} onSelect={() => OpenInExternal(item, links[index])} text='Open in external app' />
                </MenuOptions>
              </Menu>
            }
          </View>
        ))}

      </View>
      <Text style={[itemViewStyle.explore_text,{color: isLightTheme ? "#1C1C1C" : "white"}]}>Explore Others</Text>


    </>
  );
  return (<>
    {links === null ? <ErrorDisplay request={makeRequest} /> :
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
        <ListDisplay navigation={navigation} header={Header} fromItem={true} triggerWebviewRequest={webviewrequest} />
      </>}
  </>);
};
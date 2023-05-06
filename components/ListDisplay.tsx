import React, { useContext, useState, useEffect } from "react";
import { View, ActivityIndicator, FlatList, Modal, TouchableOpacity, Image, Text } from "react-native";
import { itemStyle, sourceModalStyle } from "../styles/style";
import { SourceContext, CategoryContext, webviewObjectsContext, LightThemeContext } from "./Contexts";
import { ErrorDisplay } from "./ErrorDisplay";
import { ItemView, webviewComponentProps } from "./Views";

export const ListDisplay = ({ navigation, header, fromItem, triggerWebviewRequest }: { navigation?: any, header?: any, fromItem?: boolean, triggerWebviewRequest?: Function }) => {

  type list = { title: string, link: string, img: string };
  const fetchDataList = useContext(SourceContext).fetchDataList;

  const [data, setData] = useState<list[]>([]);

  const [page, setPage] = useState<number>(2);
  const [loadMoreIndicator, setloadMoreIndicator] = useState(false);
  const [loadingIndicator, setloadingIndicator] = useState(true);
  const [showImageModal, setshowImageModal] = useState(false);
  const [displayImage, setdisplayImage] = useState("");
  const { webviewObjects, setWebviewObjects } = useContext(webviewObjectsContext);
  const isLightTheme = useContext(LightThemeContext);

  const category = useContext(CategoryContext);
  //to detect request status
  // 0 = Success/Pending
  // 1 = Normal request error
  // 2 = Page request error
  const [status, setstatus] = useState(0);

  const source = useContext(SourceContext);

  const makeRequest = () => {
    setstatus(0);
    setloadingIndicator(true);
    fetchDataList(responseSetter);
  }

  const responseSetter = (data: any) => {
    if (data === null) {
      setstatus(1);
    } else {
      setstatus(0);
      setData(data);
    }
    setloadingIndicator(false);
  }

  const responsePageSetter = (datalist: any) => {
    if (datalist === null) {
      setstatus(2);
    } else {
      setstatus(0)
      setData([...data, ...datalist]);
      setPage(page + 1);
    }
    setloadMoreIndicator(false);
  }

  const makeWebviewRequest = (page?: number) => {
    if (source.URL && source.fetchDataListInjectJavascript) {
      let webobj;
      if (page) {
        webobj = {
          url: source.PAGEURL ? source.PAGEURL + page : '',
          injectedJavaScript: source.fetchDataListInjectJavascript,
          fetchDataList: source.fetchDataList,
          DataSetter: responsePageSetter
        }
      }
      else {
        webobj = {
          url: source.URL,
          injectedJavaScript: source.fetchDataListInjectJavascript,
          fetchDataList: source.fetchDataList,
          DataSetter: responseSetter,
        };
      }
      setWebviewObjects([webobj]);
    }
  }

  const makeRequestByPage = () => {
    setloadMoreIndicator(true);
    if (source.renderInWebview) {
      makeWebviewRequest(page);
    } else {
      fetchDataList(responsePageSetter, page);
    }
  }

  const navigateToPage = (item: any) => {
    if ((category.toLowerCase() === "tv shows" && !item.isEpisode) || (category.toLowerCase() === "anime" && !item.isEpisode)) {
      navigation.push("EpisodeDisplay", item);
    }
    else
      navigation.push("ItemDisplay", item);
  }

  useEffect(() => {
    setloadingIndicator(true)

    if (source.renderInWebview) {
      makeWebviewRequest();
    } else {
      makeRequest();
    }
  }, [source])

  useEffect(() => {
    if (source.renderInWebview) {
      if (fromItem){
        if(triggerWebviewRequest)
        triggerWebviewRequest({
          url: source.URL,
          injectedJavaScript: source.fetchDataListInjectJavascript,
          fetchDataList: source.fetchDataList,
          DataSetter: responseSetter,
        });
      }
      else
        makeWebviewRequest();
    } else {
      makeRequest();
    }
  }, [])

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: isLightTheme ? "white" : "#1C1C1C"
  }}>

      <View style={[itemStyle.mainLoaderContainer,{display: (loadingIndicator ? "flex" : "none")}]} >
        <View style={itemStyle.loaderContainer}>
          <ActivityIndicator animating={loadingIndicator} size={"large"} color={"#AD1457"} />

        </View>
      </View>
      <FlatList style={itemStyle.list} ListHeaderComponent={header} data={data} numColumns={2} onEndReached={makeRequestByPage} onEndReachedThreshold={0.7} renderItem={({ item, index }) => (
        <ItemView image={item.img} title={item.title} action={() => navigateToPage(item)} displayImageModal={setshowImageModal} setImage={setdisplayImage} />
      )} />
      <View style={{ display: (loadMoreIndicator ? "flex" : "none"), alignItems: "center", }} >

        <ActivityIndicator animating={loadMoreIndicator} size={"large"} color={"#AD1457"} />
      </View>
      {!header &&
        <>
          {status === 1 && <ErrorDisplay request={makeRequest} />}
          {status === 2 && <ErrorDisplay request={makeRequestByPage} />}
        </>
      }

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
    </View>
  );
}


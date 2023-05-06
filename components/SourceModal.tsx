import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useContext, useEffect } from "react";
import { Modal, TouchableOpacity, View, ActivityIndicator, Pressable, Text, Image } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { sourceModalStyle } from "../styles/style";
import { CategoryContext, webviewObjectsContext, SourcesContext } from "./Contexts";
import { Item } from "./ItemDisplay";
import { webviewComponentProps } from "./Views";

export const SourceModal = ({ show, setShow, setSource }: { show: { visible: boolean, type: string }, setShow: Function, setSource: Function }) => {

  const navigation = useNavigation<any>();

  const [searchData, setsearchData] = useState<Item[]>([]);
  const [selectedIndex, setselectedIndex] = useState<any>(null);
  const [searchText, setsearchText] = useState<string>("");
  const [searching, setsearching] = useState(false);
  const dropdownRef = useRef<SelectDropdown>(null);
  const category = useContext(CategoryContext);
  const sources = useContext(SourcesContext);
  const { webviewObjects, setWebviewObjects} = useContext(webviewObjectsContext);



  //Searches all sources
  const searchSources = () => {
    let data: Item[] = [];
    setsearchData(data);
    setsearching(true);

    //Modifies and Adds items to state
    const setSearchItem = (datalist: any, index: number) => {
      datalist = datalist.map((item: any) => {
        item.sourceIndex = index;
        item.fromSearch = true;
        return item;
      });
      data = [...data, ...datalist]
      setsearchData(data);
    }

    //Creates an array of objects for webview
    let webviewObjectArr:webviewComponentProps[] = [];

     for(let index = 0; index < sources.length; index++){
      let source = sources[index];
      //Check if to render in webview
      if (source.renderInWebview) {
          let url = "";
          //Prevent undefined function invocation
          if (source.SEARCHURL) {
            url = source.SEARCHURL(searchText);
          }
          webviewObjectArr.push({
            url: url,
            injectedJavaScript: source.fetchDataListInjectJavascript as string,
            searchDataList: source.searchDataList,
            DataSetter: (datalist: any) => setSearchItem(datalist, index),
          });
      } else {
        //Search using callback
        sources[index].searchDataList((datalist: any) => setSearchItem(datalist, index), searchText)
      }
    }

    //Set properties for webview 
    setWebviewObjects(webviewObjectArr);

  }

  useEffect(() => {
    if (searchData.length > 0) {
      setsearching(false);
    }
  }, [searchData])


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={show.visible}
      onRequestClose={() => {
        setShow({ visible: false });
      }}>
      <TouchableOpacity onPressOut={() => (setShow({ visible: false }))} style={sourceModalStyle.centeredView}>
        {show.type === "SEARCH" ?
          <View style={sourceModalStyle.searchView} >
            <SelectDropdown
              ref={dropdownRef}
              data={searchData}
              buttonStyle={sourceModalStyle.searchButton}
              buttonTextStyle={sourceModalStyle.searchButtonText}
              defaultButtonText={"Search ....."}
              onSelect={(selectedItem, index) => {
                
              }}
              search={true}
              searchPlaceHolder={"Search..."}
              onChangeSearchInputText={setsearchText}
              searchInputStyle={sourceModalStyle.searchInput}
              rowStyle={{
                height: 60,
                borderBottomColor: "white",
                borderBottomWidth: 1
              }}
              renderSearchInputLeftIcon={() => (searching ?
                <ActivityIndicator animating={searching} color={"#AD1457"} size={"small"} />
                :
                <Image source={require("../assets/search-1.png")} style={{ height: 25, width: 25 }} />
              )}
              renderSearchInputRightIcon={() => (
                <Pressable onPress={searchSources} android_ripple={{ color: "white", radius: 5, }} style={sourceModalStyle.searchTriggerButton}>
                  <Text style={sourceModalStyle.searchTriggerButtonText}>Search</Text>
                </Pressable>
              )}
              renderCustomizedRowChild={(item, index) => (
                <TouchableOpacity style={sourceModalStyle.searchRow} onPress={() => {
                  setShow({ visible: false });
                  if ((category.toLowerCase() === "tv shows" && !item.isEpisode) || (category.toLowerCase() === "anime" && !item.isEpisode)) {
                    navigation.navigate("EpisodeDisplay", item);
                  }
                  else
                    navigation.navigate("ItemDisplay", item);

                }}>
                  <Image source={{ uri: item.img }} style={{
                    height: 50, width: 50, borderTopLeftRadius: 10, borderBottomRightRadius: 10,
                    marginLeft: 10
                  }} />
                  <Text style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 16,
                    marginLeft: 10,
                    width: "60%"
                  }}>{item.title}</Text>
                  <Text style={{
                    color: "white",
                    fontSize: 10,
                    marginLeft: "auto",
                    marginRight: 15
                  }}>{item.source}</Text>
                </TouchableOpacity>)
              }
              dropdownStyle={sourceModalStyle.searchDropdown}
            />
          </View>
          :
          <View style={sourceModalStyle.modalView}>
            <SelectDropdown
              ref={dropdownRef}
              defaultButtonText='Select Source'
              renderCustomizedButtonChild={(item, index) => (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {selectedIndex === null ?
                    <><Text style={{ color: "white" }} > Select Source </Text>
                      <Image source={require("../assets/cloud-30.png")} style={{ position: "absolute", right: 0, height: 25, width: 25, marginRight: 10 }} /></>
                    :
                    <>
                      {sources[selectedIndex] ?
                        <>
                          <Text style={{ color: "white" }} > {sources[selectedIndex].name}</Text>
                          <Image source={sources[selectedIndex].image_src} style={{ position: "absolute", right: 0, height: 25, width: 25, marginRight: 10 }} /></>
                        :
                        <>
                          <Text style={{ color: "white" }} > {sources[0].name}</Text>
                          <Image source={sources[0].image_src} style={{ position: "absolute", right: 0, height: 25, width: 25, marginRight: 10 }} /></>
                      }
                    </>
                  }
                </View>

              )}
              buttonStyle={sourceModalStyle.buttonStyle}
              renderCustomizedRowChild={(item, index) => (
                <Pressable style={[sourceModalStyle.rowStyle, {
                  backgroundColor: (selectedIndex === index ? "#7D0A3C" : "#AD1457")
                }]} onPress={() => {
                  if (dropdownRef.current) {
                    dropdownRef.current.closeDropdown();
                    setselectedIndex(index);
                    setSource(sources[index]);
                    navigation.navigate("ListDisplay");
                    
                  }
                }}>
                  <Image source={item.image_src} style={{ height: 25, width: 25 }} />
                  <Text style={sourceModalStyle.rowTextStyle}>{item.name}</Text>
                </Pressable>
              )}
              data={sources}
              onSelect={(selectedItem, index) => {
              }}

            />
          </View>
        }

      </TouchableOpacity>
    </Modal>
  );
}
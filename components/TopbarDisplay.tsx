import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import { View, ScrollView, Pressable, Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Categories } from "../Source";
import { AppbarStyle, menuStyle } from "../styles/style";
import { LightThemeContext } from "./Contexts";

// Top bar stye for web
/*
contentContainerStyle={{
            marginLeft: "auto",
            marginRight: "auto",
          }}
*/

export const TopBar = ({ showModal, setSources, setSource, setCategory, setThemeLight }: { showModal: Function, setSources: Function, setSource: Function, setCategory: Function , setThemeLight: Function}) => {
  const insets = useSafeAreaInsets();
  const button_names = Object.keys(Categories);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLightTheme = useContext(LightThemeContext);
  const navigation = useNavigation<any>();
  return (
    <>
      <View style={[{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom
      }, AppbarStyle.Appbar]} >
        <View style={{ left: 15, position: "absolute", height: "100%", bottom: 0, justifyContent: "center" }} onTouchEnd={() => showModal({ visible: true, type: "SEARCH" })}>
          <Image source={require("../assets/search.png")} style={{ height: 25, width: 25 }} />
        </View>
        <Text style={AppbarStyle.AppbarText}>MediaFindzz</Text>
        <View style={{ right: 15, position: "absolute", height: "100%", bottom: 0, justifyContent: "center" }} onTouchEnd={() => showModal({ visible: true, type: "SOURCE" })}>
          <Image source={require("../assets/cloud-30.png")} style={{ height: 25, width: 25 }} />
        </View>

      </View>
      <View style={[menuStyle.menuContainer,{backgroundColor: isLightTheme ? "white" : "#1C1C1C"}]}>
        <ScrollView style={{ paddingBottom: 10 }} horizontal={true}>
          <Pressable style={menuStyle.themeButton} onPress={()=>{
            let current_light_theme = !isLightTheme;
            setThemeLight(current_light_theme);
            AsyncStorage.setItem('theme', current_light_theme ? "true" : "false");
          }}>
            <Image source={isLightTheme ? require( "../assets/light.png") : require("../assets/dark.png")} style={{width: 20, height: 20}} />
          </Pressable>
          {button_names.map((name, index) => (
            <Pressable key={index + name} style={[menuStyle.button, { backgroundColor: (index === activeIndex ? "#7D0A3C" : "#AD1457") }]} onPress={() => {
              setActiveIndex(index);
              setCategory(Object.keys(Categories)[index]);
              setSources(Object.values(Categories)[index]);
              setSource(Object.values(Categories)[index][0]);
              navigation.navigate("ListDisplay");

            }}>
              <Text style={{
                color: "white",
                fontFamily: "Jost_Light"
              }}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );
}
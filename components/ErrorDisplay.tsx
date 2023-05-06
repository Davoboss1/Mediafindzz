import { useContext, useState } from "react";
import { Pressable, View, Image, Text } from "react-native";
import { menuStyle, errorStyle } from "../styles/style";
import { LightThemeContext } from "./Contexts";

export const ErrorDisplay = ({ request }: { request?: any }) => {
    const [text, settext] = useState("Retry");
    const isLightTheme = useContext(LightThemeContext);
    return (
      <View style={[errorStyle.errorDisplayContainer,{backgroundColor: isLightTheme ? "white" : "#1C1C1C"}]}>
        <Image source={require("../assets/error.png")} style={{
          marginTop: "40%"
        }} />
        <Text style={{
          textAlign: "center",
          margin: 10,
          color: "#AE0044",
        }}>
          Something went wrong and the data cannot be fetched. Retry your request
        </Text>
        <Pressable android_ripple={{ color: "white", radius: 5, }} style={[menuStyle.button, { backgroundColor: "#AE0044", paddingLeft: 30, paddingRight: 30, paddingTop: 10, paddingBottom: 10 }]} onPress={() => {
          request();
          settext("Loading....")
        }}>
          <Text style={{ color: "white" }}>{text}</Text>
        </Pressable>
      </View>
    );
  }
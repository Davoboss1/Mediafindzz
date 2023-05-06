import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  MenuProvider,
} from 'react-native-popup-menu';
import { Categories } from "./Source";
import { Source, URLDATA } from "./Types";
import { useFonts } from 'expo-font';
import * as SplashScreen from "expo-splash-screen";
import { CategoryContext, SourcesContext, SourceContext, webviewObjectsContext, LightThemeContext } from './components/Contexts';
import { ItemDisplay } from './components/ItemDisplay';
import { ListDisplay } from './components/ListDisplay';
import { TvshowsEpisodeDisplay } from './components/TvShowsEpisdeDisplay';
import { TopBar } from './components/TopbarDisplay';
import { SourceModal } from './components/SourceModal';
import { RenderInWebView, webviewComponentProps } from './components/Views';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const MainStack = createNativeStackNavigator();


export default function App() {
  //gobal States for context variables
  const firstSource = Object.values(Categories)[0][0];
  const [source, setSource] = useState<Source>(firstSource);
  const [sources, setSources] = useState<Source[]>(Object.values(Categories)[0]);
  const [category, setCategory] = useState<string>(Object.keys(Categories)[0]);
  const [modalVisible, setModalVisible] = useState({ visible: false, type: "" });
  const [WebviewObjects, setWebviewObjects] = useState<webviewComponentProps[]>([]);
  const [themeLight, setthemeLight] = useState(useColorScheme() == "light" ? true : false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((value)=>{
      setthemeLight(value == "true" ? true : false);
  });
  
  }, [])

  const [fontsLoaded] = useFonts({
    'Jost': require("./assets/Jost/static/Jost-Medium.ttf"),
    'Jost_Light': require("./assets/Jost/static/Jost-Light.ttf"),
    'Jost_Bold': require("./assets/Jost/static/Jost-SemiBold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LightThemeContext.Provider value={themeLight} >
      <CategoryContext.Provider value={category}>
        <SourcesContext.Provider value={sources}>
          <SourceContext.Provider value={source}>
            <webviewObjectsContext.Provider value={{ webviewObjects: WebviewObjects, setWebviewObjects: setWebviewObjects }}>
              <SafeAreaProvider>
                <MenuProvider >
                  <NavigationContainer>
                    <StatusBar animated={true} backgroundColor={"grey"} />
                    <TopBar setSources={setSources} setSource={setSource} setCategory={setCategory} showModal={setModalVisible} setThemeLight={setthemeLight} />

                    {WebviewObjects.map((object, index) => <RenderInWebView index={index} key={index} webviewObject={object} />
                    )}
                    <SourceModal show={modalVisible} setShow={setModalVisible} setSource={setSource} />
                    <MainStack.Navigator screenOptions={{
                      headerShown: false
                    }}>
                      <MainStack.Screen name='ListDisplay' component={ListDisplay} />
                      <MainStack.Screen name='ItemDisplay' component={ItemDisplay} />
                      <MainStack.Screen name='EpisodeDisplay' component={TvshowsEpisodeDisplay} />
                    </MainStack.Navigator>
                  </NavigationContainer>
                </MenuProvider>
              </SafeAreaProvider>
            </webviewObjectsContext.Provider>
          </SourceContext.Provider>
        </SourcesContext.Provider>
      </CategoryContext.Provider>
    </LightThemeContext.Provider>
  );
}


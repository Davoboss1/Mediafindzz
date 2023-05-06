import { StyleSheet } from 'react-native';

export const AppbarStyle = StyleSheet.create({
    Appbar: {
        backgroundColor: "#AD1457",
        borderBottomColor: "#bdbdbd",
        borderBottomWidth: 1,
        top: 0,
        height: 80,
        alignItems: "center",
        flexDirection: "row",
        width: "100%",
        justifyContent: "center"
    },
    AppbarText: {
        fontSize: 20,
        marginLeft: "auto",
        marginRight: "auto",
        color: "white",
        fontFamily: "Jost"
    },
});

export const itemStyle = StyleSheet.create({
    container: {
        width: "50%",
        padding: 10,
    },
    mainLoaderContainer: { position: "absolute", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", zIndex: 5, },
    loaderContainer: {
        height: 80,
        width: 80,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15
    },

    list: {
        width: "100%",
    },
    image: {
        alignSelf: "center",
        height: 150,
        width: 150,
        borderRadius: 5
    },
    title: {
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 10,
        textAlign: "center",
        fontFamily: "Jost_Bold",
    },
    button: {
        backgroundColor: "#E0E0E0",
        maxWidth: 150,
        width: "100%",
        alignSelf: "center",
        padding: 9,
        alignItems: "center",
        borderRadius: 5,
        marginTop: "auto"
    }
});

export const errorStyle = StyleSheet.create({
    errorDisplayContainer: {
        height: "100%",
        width: "100%",
        alignItems: "center",
        position: "absolute",
    }
});

export const menuStyle = StyleSheet.create({
    menuContainer: {
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10,
        width: "100%",
        
    },
    button: {
        marginTop: 10,
        padding: 8,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5,
        elevation: 4,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: "#AD1457"
    },
    themeButton: {
        marginTop: 10,
        padding: 8,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5,
        elevation: 4,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: "#AD1457"
    }
});

export const itemViewStyle = StyleSheet.create({
    container: {
        flexDirection: "row",
        margin: 5
    },
    image: {
        height: 180,
        width: "100%",
        maxWidth: 200,
        borderRadius: 5,
        marginTop: 15,

    },
    textContainer: {
        width: "60%",
        padding: 10,
    },
    text: {
        lineHeight: 20,
        textAlign: "center",
        maxHeight: 200,
        marginBottom: 0,
        marginTop: 10,
        fontFamily: "Jost",
        
    },
    explore_text: {
        fontSize: 20,
        fontFamily: "Jost_Bold",
        marginTop: 10,
        width: "100%",
        textAlign: "center",
        

    },
    download_text: {
        fontSize: 20,
        width: "100%",
        textAlign: "center",
        fontFamily: "Jost_Bold",
        
    },
    title_text: {
        fontSize: 20, textAlign: "center", fontFamily: "Jost",
        

    }
});

export const sourceModalStyle = StyleSheet.create({
    searchView: {
        height: "100%",
        width: "100%"
    },
    searchButton: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        width: "95%",
        borderRadius: 5,
        backgroundColor: "#AD1457",
        color: "white"
    },
    searchButtonText: {
        color: "white"
    },
    searchTriggerButton: {
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: "#AD1457",
        color: "white"
    },
    searchTriggerButtonText: {
        color: "white",
        fontFamily: "Jost_Light"

    },
    searchInput: {
        borderRadius: 5,
    },
    searchRow: {
        backgroundColor: "#AD1457",
        alignItems: "center",
        flexDirection: "row",
        height: 60,
    },
    searchDropdown: {
        borderRadius: 5,
        height: "80%",
        backgroundColor: "transparent"

    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: "100%"
    },
    modalView: {
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: 50,
        borderRadius: 20,
        width: "80%"
    },
    buttonStyle: {
        backgroundColor: "#AD1457",
        shadowColor: "grey",
        shadowRadius: 5,
        shadowOffset: {
            width: 2,
            height: 2,
        },
        width: "100%",
        borderRadius: 20,

    },
    rowStyle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        backgroundColor: "#AD1457",
    },
    rowTextStyle: {
        padding: 10,
        color: "white"
    }
});

export const tvShowDisplayStyle = StyleSheet.create({
    season_title: {
        fontSize: 20,
        width: "100%",
        textAlign: "center",
        fontFamily: "Jost",
        

    },
    tvShowContainer: {
        width: "100%", height: "100%", alignItems: "center", justifyContent: "center",
        
    },
    title: { fontSize: 20, textAlign: "center", fontFamily: "Jost",
     }
});
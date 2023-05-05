import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import warehouse from './assets/warehouse.jpg';
import { Stock, ProductListContextProvider } from './components/Stock.js';
import StockEditor from './components/StockEditor';

const { height } = Dimensions.get('window');

export default function App() {
    return <SafeAreaProvider>
        <SafeAreaView>
            <LinearGradient colors={styles.backgroundGradient} style={styles.base}>
                <ProductListContextProvider>
                    <StockEditor />
                    <View style={styles.container}>
                        <Text style={styles.title}>Lager-Appen</Text>
                        <Image source={warehouse} style={{ width: 320, height: 240 }} />
                        <Stock />
                    </View>
                </ProductListContextProvider>
                <StatusBar style="auto" />
            </LinearGradient>
        </SafeAreaView>
    </SafeAreaProvider>;
}

const styles = StyleSheet.create({
    backgroundGradient: [
        'gray', 'aliceblue', 'gray', 'aliceblue'
    ],
    base: {
        flex: 1,
        lineHeight: 1.4
    },
    container: {
        width: 'fit-content',
        height: height,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 50,
        paddingRight: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    title: {
        fontFamily: "'Merriweather', serif",
        textAlign: 'center',
        color: '#33c',
        fontSize: 42,
        marginBottom: 15
    }
});

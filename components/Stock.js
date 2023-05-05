import { useState, useEffect, useContext, createContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from "../config/config.json";

export const ProductListContext = createContext(false);

export function ProductListContextProvider({ children }) {
    const productListSharedStates = {
        reload: useState(false),
        selection: useState({})
    };

    return (
        <ProductListContext.Provider value={productListSharedStates}>
            {children}
        </ProductListContext.Provider>
    );
}

export function Stock() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useContext(ProductListContext).selection;
    const reloadProductList = useContext(ProductListContext).reload[0];

    function SelectableProduct({ children, product }) {
        return <TouchableOpacity onPress={() =>
            setSelectedProduct(() => selectedProduct !== product ? product : {})
        }
        style={[
            styles.stockRow,
            selectedProduct.id === product.id ? styles.selectionHighlighting : ''
        ]}>
            {children}
        </TouchableOpacity>;
    }

    function ProductList() {
        return <ScrollView style={styles.scrollableContainer}>
            {products.map((product, index) => {
                return <SelectableProduct key={index} product={products[index]}>
                    <Text style={styles.productText}>{product.name}</Text>
                    <Text style={styles.productText}>{product.stock}</Text>
                </SelectableProduct>;
            })}
        </ScrollView>;
    }

    useEffect(() => {
        fetch(`${config.base_url}/products?api_key=${config.api_key}`)
            .then(response => response.json())
            .then(result => setProducts(result.data));
    }, [reloadProductList]);

    return <View style={styles.table}>
        <Text style={styles.title}>Lagerförteckning</Text>
        <View style={styles.stockRow}>
            <Text style={styles.stockHeader}>Namn</Text>
            <Text style={styles.stockHeader}>Lagersaldo</Text>
        </View>
        <ProductList />
    </View>;
}

const styles = StyleSheet.create({
    table: {
        flexGrow: 1,
        width: 320,
        height: 0
    },
    scrollableContainer: {
        flexGrow: 1
    },
    title: {
        fontFamily: "'Merriweather', serif",
        alignSelf: 'center',
        color: '#333',
        fontSize: 24
    },
    stockHeader: {
        fontFamily: "'Merriweather', serif",
        fontSize: 17,
        fontWeight: 'bold'
    },
    stockRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    productText: {
        fontFamily: "'Merriweather', serif",
        fontSize: 16
    },
    selectionHighlighting: {
        backgroundColor: 'rgba(230, 230, 230, 0.7)',
        borderRadius: 2
    }
});

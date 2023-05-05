import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, TextInput, Button, TouchableOpacity,
    View, ScrollView, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm } from "react-hook-form";
import { ProductListContext } from './Stock.js';
import config from "../config/config.json";

function StockProductControls() {
    const { register, handleSubmit, setValue, getValues } = useForm();
    const productKeys = ['article_number', 'name', 'description',
        'specifiers', 'stock', 'location', 'price'];
    const formMethods = ['get', 'delete', 'post', 'put'];
    const [selectedRequestMethod, setMethod] = useState(formMethods[0]);
    const [resultLabel, setResultLabel] = useState('');
    const setReloadProductList = useContext(ProductListContext).reload[1];
    const selectedProduct = useContext(ProductListContext).selection[0];

    const onSubmit = useCallback(formData  => {
        const apiLinkExtension = selectedRequestMethod === 'get' ?
            `${formData['id']}?api_key=` + config.api_key : '';
        const apiLinkBase = 'https://lager.emilfolino.se/v2/products/';
        const formUrlEncodedData = Object.entries(formData).map(([key, value]) =>
            encodeURIComponent(key) + '=' + encodeURIComponent(value)).join('&');

        fetch(apiLinkBase + apiLinkExtension, {
            method: selectedRequestMethod,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: selectedRequestMethod !== 'get' ? formUrlEncodedData : null
        })
            .then(response => response.json()
                .then(payload => Promise.resolve({ response, data: payload.data }))
                .catch(() => Promise.resolve({ response })))
            .then(result => {
                if (result.data === undefined || Object.keys(result.data).length < 1) {
                    if (selectedRequestMethod !== 'get') {
                        const methodLabel = selectedRequestMethod === 'put' ? 'Edited' : 'Deleted';

                        setResultLabel(`${methodLabel} item by ID ${formData.id}.`);
                    } else {
                        setResultLabel(`No item found by ID ${formData.id}.`);
                    }
                } else {
                    const formatProduct = (product) => Object.entries(product)
                        .map(([key, value]) => `${key}: ${value}`).join('\n');

                    if (result.data.length > 1) {
                        setResultLabel(result.data
                            .map((product) => formatProduct(product)).join('\n\n'));
                    } else {
                        setResultLabel(formatProduct(result.data));
                    }
                }
                if (selectedRequestMethod !== 'get') {
                    setReloadProductList(reloadProductList => !reloadProductList);
                }
            })
            .catch(errorMessage => setResultLabel(errorMessage));
    }, [register, selectedRequestMethod]);

    useEffect(() => {
        register('api_key');
        setValue('api_key', config.api_key);
        register('id');
        productKeys.map((key) => register(key));
    }, [register]);

    const undefinedAndNull = [undefined, null];
    const onChangeField = useCallback(key => value => {
        setValue(key, value);
        updateInputFields();
    }, [selectedRequestMethod]);
    const makeInputField = (key, label) => {
        return <View key={productKeys.concat('id').indexOf(key)} dataKey={key} dataLabel={label}>
            <Text style={styles.label}>{label}: </Text>
            <TextInput onChangeText={onChangeField(key)}
                value={undefinedAndNull
                    .every(falsish => getValues(key) !== falsish) ? getValues(key) : ''}
                style={styles.input} />
        </View>;
    };
    const productInputFields = productKeys.map((key) => {
        return makeInputField(key,
            key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '));
    }).concat(makeInputField('id', 'ID'));
    const dropdownItemsList = formMethods.map((method, index) => {
        return <Picker.Item key={index} label={method.toUpperCase()} value={method} />;
    });
    const inputSets = {
        get: productInputFields.slice(-1),
        delete: productInputFields.slice(-1),
        post: productInputFields.slice(0, -1),
        put: productInputFields
    };
    const updateInputFields = () => setInputFields(inputSets[selectedRequestMethod]
        .map((inputField) => makeInputField(inputField.props.dataKey, inputField.props.dataLabel)));
    const [inputFields, setInputFields] = useState(productInputFields.slice(-1));
    const [scrollContainerTopOffset, setScrollContainerTopOffset] = useState(100);

    useEffect(() => {
        for (let i = 0; i < inputFields.length; i++) {
            const key = inputFields[i].props.dataKey;
            const value = selectedProduct[key];

            setValue(key, undefinedAndNull.every(falsish => value !== falsish) ? value : '');
        }
        updateInputFields();
    }, [selectedProduct, selectedRequestMethod]);

    return <View>
        {inputFields}

        <View style={styles.formControls}>
            <Button title="Submit" onPress={handleSubmit(onSubmit)} />
            <Picker onValueChange={(value) => {
                setMethod(value);
                setInputFields(inputSets[value]);
            }} style={styles.dropdown}>
                {dropdownItemsList}
            </Picker>
        </View>
        <ScrollView onLayout={e => setScrollContainerTopOffset(e.nativeEvent.layout.y)}
            contentContainerStyle={{
                maxHeight: Dimensions.get('window').height - scrollContainerTopOffset - 70
            }}>
            <Text style={[styles.label, styles.resultLabel]}>{resultLabel}</Text>
        </ScrollView>
        <TouchableOpacity onPress={() => setResultLabel('')}
            style={[styles.clearLabelButton, {display: resultLabel === '' ? 'none' : 'flex'}]}>
            <Text style={styles.clearLabelButtonText}>CLEAR</Text>
        </TouchableOpacity>
    </View>;
}

export default function StockEditor() {
    const [menuVisibility, setMenuVisibility] = useState(false);

    return <View style={styles.menuWithHandleContainer}>
        <TouchableOpacity onPress={() => setMenuVisibility(!menuVisibility)}
            style={styles.menuFoldButton}>
            <Text style={[
                styles.menuFoldButtonText,
                {transform: `rotate(${menuVisibility ? '0' : '180'}deg)`}
            ]}>{'<'}</Text>
        </TouchableOpacity>
        <View style={[styles.menuContainer, {display: menuVisibility ? 'flex' : 'none'}]}>
            <Text style={styles.title}>Redigering och sökning av lager</Text>
            <StockProductControls />
        </View>
    </View>;
}

const styles = StyleSheet.create({
    menuWithHandleContainer: {
        zIndex: 1
    },
    menuContainer: {
        position: 'absolute',
        alignSelf: 'end',
        width: 350,
        marginRight: 5,
        paddingRight: 5,
        paddingLeft: 5,
        paddingBottom: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 1,
    },

    menuFoldButton: {
        marginRight: 10,
        zIndex: 2
    },
    menuFoldButtonText: {
        position: 'absolute',
        alignSelf: 'end',
        color: '#5ddcff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 10,
        height: 'fit-content',
        fontSize: 22
    },

    titleBar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        fontFamily: "'Merriweather', serif",
        color: '#18cdff',
        fontSize: 24
    },

    label: {
        backgroundColor: 'rgba(233, 233, 233, 0.5)'
    },
    input: {
        backgroundColor: 'aliceblue'
    },
    dropdown: {
        backgroundColor: 'darkred',
        color: '#fff'
    },
    resultLabel: {
        marginTop: 5,
        paddingLeft: 5
    },
    clearLabelButton: {
        textAlign: 'center',
        backgroundColor: 'blueviolet'
    },
    clearLabelButtonText: {
        color: 'white'
    },
    formControls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    }
});

const express = require('express');
const { getLangDataOnRequest } = require("../helper/languageManager");
const router = express.Router();

router.post('/', (req, res) => {
    const langData = getLangDataOnRequest(req);
    const data = convertDataToNumberObject(req.body);
    const errors = verifyData(data, langData);

    if (errors.length > 0) {
        res.status(400).json({
            status: 'error',
            errors: errors
        });
        return;
    }
    res.status(200).json({
        status: 'success'
    });
});

function verifyData(data, langData) {
    const errors = [];
    const { period, startTime, timeArray, MagnitudeArray, FluxArray } = data;

    if (!isNumber(period))
        errors.push(langData.invalidPeriodInfo);

    if (!isNumber(startTime))
        errors.push(langData.invalidStartTimeInfo);

    if (timeArray === undefined)
        errors.push(langData.invalidTimeColumnInfo);

    if (timeArray === false)
        errors.push(langData.timeColumnValuesNumeric);

    if (MagnitudeArray !== undefined && FluxArray !== undefined)
        errors.push(langData.brightnessLuminanceConflict);

    if (MagnitudeArray === false)
        errors.push(langData.brightnessColumnValuesNumeric);

    if (FluxArray === false)
        errors.push(langData.luminanceColumnValuesNumeric);

    if (!!timeArray) {
        if (!!FluxArray && timeArray.length !== FluxArray.length)
            errors.push(langData.timeLuminanceCountMismatch);

        if (!!MagnitudeArray && timeArray.length !== MagnitudeArray.length)
            errors.push(langData.timeBrightnessCountMismatch);
    }

    return errors;
}

function convertDataToNumberObject(reqBody) {
    const { period, startTime, timeArray, MagnitudeArray, FluxArray } = reqBody;
    return {
        period: convertToNumber(period),
        startTime: convertToNumber(startTime),
        timeArray: convertArrayValuesToNumbers(timeArray),
        MagnitudeArray: convertArrayValuesToNumbers(MagnitudeArray),
        FluxArray: convertArrayValuesToNumbers(FluxArray)
    }
}

function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function convertToNumber(input) {
    if (typeof input === 'number') {
        if (!isNaN(input)) {
            return input;
        } else {
            return null;
        }
    }

    // Input'u string olarak kabul et ve virgülleri noktaya çevir
    const formattedValue = String(input).replace(/,/g, '.');
    const numberValue = Number(formattedValue);

    if (!isNaN(numberValue) && formattedValue.trim() !== "") {
        return numberValue;
    } else {
        return null;
    }
}

function convertArrayValuesToNumbers(array) {
    if (!Array.isArray(array))
        return undefined;

    for (let i = 0; i < array.length; i++) {
        array[i] = convertToNumber(array[i]);
        if (array[i] === null)
            return false;
    }
    return array;
}

module.exports = router;

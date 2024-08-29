require('dotenv').config();
const axios = require('axios');

const { codeLength, ymToken, ymPath } = process.env;

function generateCode() {
    // e.g. for code_length = 5, between 0 and 99999 (100000 - 1 = 10^5 - 1)
    const rawCode = Math.floor(Math.random() * (10 ** codeLength));
    // pad with leading zeroes, so e.g. 134 => 00134
    return rawCode.toString().padStart(codeLength, '0');
}

async function yemot(phone) {
    try {
        let _res = (await axios.post('https://www.call2all.co.il/ym/api/CallExtensionBridging', {
            token: ymToken,
            phones: phone,
            ivrPath: ymPath
        })).data;
        if (_res.responseStatus == 'OK') {
            return { success: true };
        } else {
            console.log('Error func yemot in file utlils.js', _res);
            return { success: false, message: 'Error calling send message API. Check server logs.' };
        }
    } catch (error) {
        const errorCode = error.response.status;
        const errorText = error.response.data.error.error_data.details;
        console.log('Error func yemot in file utlils.js', `Error (${errorCode}) from calling send message API: ${errorText}`);
        return { success: false, message: 'Error calling send message API. Check server logs.' };
    }
}


module.exports = {
    generateCode, yemot
};

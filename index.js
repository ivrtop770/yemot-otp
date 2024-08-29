require('dotenv').config();
const { port, codeLifetimeInMinutes } = process.env;
const express = require('express');
const app = express();
const { YemotRouter } = require('yemot-router2');
const router = YemotRouter({ printLog: false });
const { generateCode, yemot } = require('./utils');

let activeCodes = {};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/:phone_number', async (req, res) => {
    const phone = req.params.phone_number;
    console.log("api", `OTP requested for phone ${phone}`);

    const code = generateCode();
    const expirationTimestamp = new Date();
    expirationTimestamp.setMinutes(
        expirationTimestamp.getMinutes() + codeLifetimeInMinutes
    );

    let run = await yemot(phone);
    if (run.success) {
        activeCodes[phone] = { code, expirationTimestamp };
        res.json(run);
    } else {
        res.status(500).json(run);
    }
});

app.post('/:phone_number', (req, res) => {
    const phone = req.params.phone_number;
    console.log("api", `OTP validation request for phone ${phone}`);

    const { code: expectedCode, expirationTimestamp } = activeCodes[phone] || {};
    if (expectedCode == null) {
        return res.status(404).json({ success: false, message: `No active code for phone ${phone}` });
    }

    const actualCode = req.body.code;
    if (actualCode == null) {
        return res.status(400).json({ success: false, message: "No code provided." });
    } else if (expirationTimestamp < Date.now()) {
        delete activeCodes[phone];
        return res.status(401).json({ success: false, message: "Code has expired, please request another." });
    } else if (actualCode !== expectedCode) {
        return res.status(401).json({ success: false, message: "Invalid code" });
    }

    delete activeCodes[phone];
    res.json({ success: true });
});

router.get('/', async (call) => {
    const phone = call.phone;
    console.log("IVR", `OTP call request for phone ${phone}`);

    const min = 1;
    const max = 9;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

    let menu = await call.read([
        {
            type: "file",
            data: "013"
        },

        {
            type: "file",
            data: "00" + randomNum
        },
        {
            type: "file",
            data: "013"
        },

        {
            type: "file",
            data: "00" + randomNum
        }
    ], "tap", { max_digits: "1", min_digits: "1", allow_empty: true, empty_val: "*" });

    if (menu == randomNum) {

        const { code: expectedCode, expirationTimestamp } = activeCodes[phone];
        if (expectedCode == null) {
            call.id_list_message([
                {
                    type: "file",
                    data: "011"
                },
            ], { prependToNextAction: true })
            call.hangup();
            return
        }

        if (expirationTimestamp < Date.now()) {
            delete activeCodes[phone];
            call.id_list_message([
                {
                    type: "file",
                    data: "011"
                },
            ], { prependToNextAction: true })
            call.hangup();
            return
        }


        let CodeMesg = String(expectedCode).split('');
        let newCodes = [];
        CodeMesg.forEach(element => {
            newCodes.push({
                type: "file",
                data: "00" + element
            });
        });
        call.id_list_message([
            {
                type: "file",
                data: "010"
            },

            ...newCodes,
            {
                type: "file",
                data: "012"
            },
            ...newCodes,

        ], { prependToNextAction: true })

    }
    call.id_list_message([
        {
            type: "file",
            data: "011"
        },
    ], { prependToNextAction: true })
    call.hangup();
});

app.use(router);
app.use((_req, res, next) => {
    console.log("Current time: ", new Date());
    res.on('finish', () => {
        console.log(`Response (${res.statusCode}): ${res.statusMessage}`);
        if (Object.keys(activeCodes).length > 0) {
            console.log("Active codes state:")
            console.table(activeCodes);
        }
        console.log()
    });
    next();
})
app.listen(port, () => {
    console.log(`otp yemot listening on port ${port}`);
});
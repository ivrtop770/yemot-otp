# Yemot OTP
OTP verification through a phone call in the IVR2 system - ימות המשיח.

## Installation

Instructions on how to install and set up your project.

```bash
# Clone the repository
git clone https://github.com/ivrtop770/otp-yemot.git

# Navigate to the project directory
cd otp-yemot

# Install dependencies
npm install

To use the OTP verification system, follow these steps:

1. Make sure you have cloned the repository and installed the dependencies as mentioned in the installation instructions.

2. Edit the `.env` file and provide the necessary data, such as the `ymToken` and `ymPath`.

3. Save the changes to the `.env` file.

4. Start the project by running `node index.js` in the terminal.

5. Upload the required audio files to the desired path in Yemot.

6. Edit the `ext.ini` file and set the `type` to "api" and the `api_link` to the appropriate URL and port.

7. Save the changes to the `ext.ini` file.

8. Now you can use the OTP verification system:
    - To send a call with the OTP code, send a GET request to `http://url:port/0501234567`, replacing `url` with the project's URL and `port` with the defined port.
    - After listening to the code through the phone call, send a POST request to `http://url:port/0501234567` with the code in the request body as `{"code": THE CODE}`.

Remember to replace `url` and `port` with the appropriate values for your project.

Good luck!


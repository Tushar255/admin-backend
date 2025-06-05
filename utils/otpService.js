import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY_1 = process.env.TWO_FACTOR_API_KEY;
const API_KEY_2 = process.env.TWO_FACTOR_API_KEY2;


export const sendOTP = async (phone, adminId) => {
    try {
        const apiKey = adminId === process.env.adminId ? API_KEY_2 : API_KEY_1;        
        
        const response = await axios.get(`https://2factor.in/API/V1/${apiKey}/SMS/${phone}/AUTOGEN2`);

        if (response.data.Status === "Success") {
            return {
                success: true,
                msg: "OTP sent successfully",
                otp : response.data.OTP
            };
        } else {
            return { success: false, msg: "Failed to send OTP" };
        }
    } catch (error) {
        console.error("Error sending OTP:", error?.response?.data || error.message);
        return { success: false, msg: "Error sending OTP" };
    }
};
import Admin from "../models/Admin.js"

export const checkActiveStatus = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);

        if (!admin || !admin?.isActive) {
            return {
                statusCode: 400,
                msg: "Invalid or Inactive Admin"
            }
        }

        return {
            statusCode: 200,
            msg: "Valid and Active Admin"
        }
    } catch (error) {
        return {
            statusCode: 500,
            msg: error.message
        }
    }
}
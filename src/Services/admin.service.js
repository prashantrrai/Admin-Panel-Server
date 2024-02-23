const bcrypt = require('bcrypt');

// Import the admin model
const adminModel = require('../Models/admin.model');

const registerUserService = async (userData) => {
    try {

        if (!userData.username || !userData.profile || !userData.email || !userData.password || !userData.roleId) {
            throw new Error('Invalid input. Please provide valid data.');
        }

        // Checking if email is already registered.
        const existingEmail = await adminModel.findOne({ email: userData.email });
        if (existingEmail) {
            throw new Error('Email is already registered. Please use a different email.');
        }

        // Checking if username is already registered.
        const existingUsername = await adminModel.findOne({ username: userData.username });
        if (existingUsername) {
            throw new Error('Username is already registered. Please use a different username.');
        }

        // Hashing the password before saving it.
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create and save the admin in a single step
        return await adminModel.create({
            username: userData.username,
            profile: userData.profile,
            email: userData.email,
            password: hashedPassword,
            roleId: userData.roleId,
            isVerified: userData.isVerified,
            two_factor_enabled: userData.two_factor_enabled
        });

    } catch (error) {
        console.error('ERROR IN registerUser SERVICE:', error);
        throw error;
    }
};


const deleteUserService = async (id) => {
    try {

        const user = await adminModel.findById(id);

        if (!user) {
            throw new Error('User not found');
        }

        // User exists, proceed with deletion
        return await adminModel.findByIdAndDelete(id);

    } catch (error) {
        console.error('ERROR IN deleteUser SERVICE:', error);
        throw error;
    }
}


const editUserService = async (id, userData) => {
    try {
        const user = await adminModel.findById(id);

        // User exists, proceed with edit
        if (!user) {
            throw new Error('User not found');
        }

        // Update user data
        user.username = userData.username;
        user.profile = userData.profile;
        user.email = userData.email;
        user.password = userData.password;
        user.roleId = userData.roleId;
        user.isVerified = userData.isVerified;
        user.two_factor_enabled = userData.two_factor_enabled;

        return updatedUser = await user.save();

    } catch (error) {
        console.error('ERROR IN editUser SERVICE:', error);
        throw error;
    }
}


module.exports = { registerUserService, deleteUserService, editUserService };

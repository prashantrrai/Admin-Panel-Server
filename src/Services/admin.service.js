const bcrypt = require('bcrypt');
const fs = require('fs');
const util = require('util');

// Import the admin model
const adminModel = require('../Models/admin.model');
const { sendMail } = require('./email.service');

// Promisify fs.readFile
const readFile = util.promisify(fs.readFile);

const registerUserService = async (userData) => {
    try {

        const { username, profile, email, password, roleId } = userData;

        // Check if any required field is missing
        if (!username || !profile || !email || !password || !roleId) {
            throw new Error('Sorry, all fields are required.');
        }

        const existingEmail = await adminModel.findOne({ email: email });

        // Checking if email is already registered.
        if (existingEmail) {
            throw new Error('Email is already registered. Please use a different email.');
        }

        const existingUsername = await adminModel.findOne({ username: username });

        // Checking if username is already registered.
        if (existingUsername) {
            throw new Error('Username is already registered. Please use a different username.');
        }

        // Hashing the password before saving it.
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Load HTML template for forgot password email
        const template = await readFile('src/templates/registration-success.html', 'utf8');

        // compose email content
        const subject = 'Registration Successful';
        const description = template.replace('{{ username }}', username).replace('{{ password }}', password).replace('{{ firstname }}', profile.firstName).replace('{{ lastname }}', profile.lastName);

        await sendMail(email, subject, description);

        // Create and save the admin in a single step
        const result = await adminModel.create({
            username: userData.username,
            profile: userData.profile,
            email: userData.email,
            password: hashedPassword,
            roleId: userData.roleId,
            isVerified: userData.isVerified,
            two_factor_enabled: userData.two_factor_enabled
        });

        return result;

    } catch (error) {
        console.error('ERROR IN registerUser SERVICE:', error);
        throw error;
    }
};


const deleteUserService = async (id) => {
    try {

        const user = await adminModel.findById(id);

        if (!user) {
            throw new Error('Sorry, user not found');
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
            throw new Error('Sorry, user not found');
        }

        // Hashing the password before saving it.
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Update user data
        user.username = userData.username;
        user.profile = userData.profile;
        user.email = userData.email;
        user.password = hashedPassword;
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

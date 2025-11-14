import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from "../models/appointmentModel.js";


// ===============================
// 🔹 REGISTER USER
// ===============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Enter a valid email' });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log('Register Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// 🔹 LOGIN USER
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log('Login Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// 🔹 GET USER PROFILE
// ===============================
export const getProfile = async (req, res) => {
  try {
    // ✅ Comes from middleware (authUser.js)
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: 'Unauthorized access' });
    }

    const userData = await userModel.findById(userId).select('-password');
    if (!userData) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log('Get Profile Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// 🔹 UPDATE USER PROFILE
// ===============================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: 'Data Missing' });
    }

    // ✅ Use req.userId from auth middleware
    const userId = req.userId;

    const updateData = {
      name,
      phone,
      address: address ? JSON.parse(address) : {},
      dob,
      gender,
    };

    // Upload image if provided
    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
      });
      updateData.image = upload.secure_url;
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    res.json({ success: true, message: 'Profile Updated' });
  } catch (error) {
    console.log('Update Profile Error:', error);
    res.json({ success: false, message: error.message });
  }
};

//API to book appointment
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId; // ★ Get from middleware
    const { docId, slotDate, slotTime } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized user" });
    }

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked || {};

    // Slot Availability Check
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      }
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment booked successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

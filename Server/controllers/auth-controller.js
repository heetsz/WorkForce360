import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import hr from "../models/hr-model.js";

export const registration = async (req, res) => {
      try {
            const {name,  email, password } = req.body;

            let existingUser = await hr.findOne({ email });
            if (existingUser) {
                  return res.status(400).json({
                        message: "User already registered"
                  });
            }

            const salt = await bcrypt.genSalt(10); 
            const hashPassword = await bcrypt.hash(password, salt);

            const newUser = new hr({
                  name,
                  email,
                  password: hashPassword,
            });
            await newUser.save();

            const token = jwt.sign({ userId: newUser?._id, userEmail: newUser?.email }, process.env.ACCESS_TOKEN, {
                  expiresIn: '1h'
            })

            const cookieOptions = {
                  httpOnly: true,
                  secure: false,
                  sameSite: false,
                  maxAge: 60 * 60 * 1000,
            };

            return res.cookie('token', token, cookieOptions).status(200).json({
                  message: 'User registered',
                  token
            })
      } catch (err) {
            res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
};

export const login = async (req, res) => {
      try {
            const { email, password } = req.body;
            const user = await hr.findOne({ email });

            if (!user) {
                  return res.status(400).json({
                        message: "Invalid email",
                        email: email,
                  });
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                  return res.status(400).json({
                        message: "Invalid password",
                        password: password,
                  });
            }

            const token = jwt.sign({ userId: user?._id, userEmail: user?.email }, process.env.ACCESS_TOKEN, {
                  expiresIn: '1h'
            })

            const cookieOptions = {
                  httpOnly: true,
                  secure: false,
                  sameSite: false,
                  maxAge: 60 * 60 * 1000,
            };

            return res.cookie('token', token, cookieOptions).status(200).json({
                  message: 'Login successfull',
                  token
            })
      } catch (err) {
            return res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
}

export const logout = async (req, res) => {
      try {
            const cookieClearOptions = {
                  httpOnly: true,
                  secure: false,
                  sameSite: false,
            };
            res.clearCookie('token', cookieClearOptions)

            return res.status(200).json({
                  message: 'Logged out',
            })
      } catch (error) {
            return res.status(500).json({
                  message: 'Server error',
                  error: error.message
            })
      }
}

export const getProfile = async (req, res) => {
      try {
            const userId = req.user?.userId;
            const email = req.user?.userEmail;
            if (!userId) {
                  return res.status(400).json({ message: 'User id not found in token' });
            }

            const user = await hr.findOne({email})
            if (!user) {
                  return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(user);
      } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
      }
}
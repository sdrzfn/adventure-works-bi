import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserByName } from "../models/User.js";

export const login = async (req, res) => {
    const { name, password } = req.body;

    const user = await findUserByName(name);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );

    res
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })
        .json({ accessToken });
};

export const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        const accessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
        );

        res.json({ accessToken });
    } catch (err) {
        res.sendStatus(403);
    }
};
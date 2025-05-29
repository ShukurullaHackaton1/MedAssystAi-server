import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Регистрация нового пользователя
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверка наличия обязательных полей
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Пожалуйста, заполните все поля" });
    }

    // Проверка существования пользователя
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    // Создание нового пользователя
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Некорректные данные пользователя" });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Вход пользователя
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // Проверка наличия обязательных полей
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Пожалуйста, заполните все поля" });
    }

    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    // Проверка пароля
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение профиля пользователя
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Создание админа (только для разработки)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Проверка секретного ключа (для безопасности)
    if (secretKey !== "your_admin_secret_key") {
      return res.status(401).json({ message: "Неверный секретный ключ" });
    }

    // Проверка существования пользователя
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    // Создание админа
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: "Некорректные данные" });
    }
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

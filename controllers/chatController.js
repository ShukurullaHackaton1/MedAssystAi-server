import Chat from "../models/Chat.js";
import {
  analyzeSymptoms,
  isSymptomDescription,
} from "../services/aiService.js";

// Функция создания заголовка на основе симптомов
const generateChatTitle = (symptomText) => {
  // Ограничиваем длину заголовка
  const maxLength = 50;

  // Очищаем текст от лишних символов и пробелов
  let cleanedText = symptomText.trim();

  // Для коротких текстов используем их целиком
  if (cleanedText.length <= maxLength) {
    return cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
  }

  // Для длинных текстов обрезаем и добавляем многоточие
  let title = cleanedText.substring(0, maxLength);

  // Обрезаем по последнему полному слову
  const lastSpaceIndex = title.lastIndexOf(" ");
  if (lastSpaceIndex > 0) {
    title = title.substring(0, lastSpaceIndex);
  }

  return title.charAt(0).toUpperCase() + title.slice(1) + "...";
};

// Создание нового чата
export const createChat = async (req, res) => {
  try {
    const newChat = await Chat.create({
      user: req.user._id,
      messages: [
        {
          sender: "system",
          content:
            "Здравствуйте! Опишите ваши симптомы, и я постараюсь помочь с предварительным диагнозом.",
        },
      ],
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение всех чатов пользователя
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title updatedAt diagnosis");

    res.json(chats);
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение одного чата по ID
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Чат не найден" });
    }

    res.json(chat);
  } catch (error) {
    console.error("Get chat by ID error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение последних 3 чатов для контекста
const getRecentChatsSymptoms = async (userId) => {
  try {
    // Найти 3 последних активных чата, исключая текущий
    const recentChats = await Chat.find({
      user: userId,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select("symptoms");

    // Извлекаем все симптомы из чатов
    const allSymptoms = recentChats.flatMap((chat) => chat.symptoms);

    return allSymptoms;
  } catch (error) {
    console.error("Get recent chats error:", error);
    return [];
  }
};

// Отправка сообщения в чат
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.id;

    if (!content) {
      return res
        .status(400)
        .json({ message: "Сообщение не может быть пустым" });
    }

    // Проверяем, является ли сообщение описанием симптомов
    let isSymptom = true;
    try {
      isSymptom = await isSymptomDescription(content);
    } catch (err) {
      console.error("Error checking symptoms:", err);
      // В случае ошибки проверки, принимаем сообщение как описание симптомов
      isSymptom = true;
    }

    if (!isSymptom) {
      return res.status(400).json({
        message:
          'Пожалуйста, опишите только ваши медицинские симптомы. Например: "У меня болит голова и тошнит".',
      });
    }

    // Находим чат
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ message: "Чат не найден" });
    }

    // Добавляем сообщение пользователя
    chat.messages.push({
      sender: "user",
      content: content,
    });

    // Добавляем симптом в список симптомов
    chat.symptoms.push(content);

    // Генерируем новый заголовок чата на основе первого сообщения пользователя
    if (chat.messages.filter((msg) => msg.sender === "user").length === 1) {
      chat.title = generateChatTitle(content);
    }

    let diagnosis = "";

    try {
      // Получаем контекст из предыдущих чатов
      const contextSymptoms = await getRecentChatsSymptoms(req.user._id);

      // Анализируем симптомы с учетом контекста
      diagnosis = await analyzeSymptoms(content, contextSymptoms);

      // Сохраняем диагноз
      chat.diagnosis = diagnosis;
    } catch (err) {
      console.error("Error analyzing symptoms:", err);
      diagnosis =
        "Не удалось проанализировать симптомы. Пожалуйста, попробуйте позже или обратитесь к врачу.";
    }

    // Добавляем ответ системы
    chat.messages.push({
      sender: "system",
      content: diagnosis,
    });

    // Сохраняем чат
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error("Send message error:", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера. Пожалуйста, попробуйте позже." });
  }
};

// Закрытие чата
export const closeChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Чат не найден" });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ message: "Чат закрыт" });
  } catch (error) {
    console.error("Close chat error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

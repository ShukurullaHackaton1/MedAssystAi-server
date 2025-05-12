import Chat from "../models/Chat.js";
import moment from "moment";

// Получение статистики по симптомам
export const getSymptomStats = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate;

    // Определение периода фильтрации
    switch (period) {
      case "day":
        startDate = moment().subtract(1, "days").toDate();
        break;
      case "week":
        startDate = moment().subtract(7, "days").toDate();
        break;
      case "month":
        startDate = moment().subtract(30, "days").toDate();
        break;
      case "year":
        startDate = moment().subtract(365, "days").toDate();
        break;
      default:
        startDate = moment().subtract(30, "days").toDate(); // По умолчанию месяц
    }

    // Агрегация для подсчета частоты симптомов
    const symptomStats = await Chat.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: "$symptoms",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          symptom: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(symptomStats);
  } catch (error) {
    console.error("Get symptom stats error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение статистики обращений по дням
export const getDailyStats = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate;
    let groupFormat;

    // Определение периода и формата группировки
    switch (period) {
      case "week":
        startDate = moment().subtract(7, "days").toDate();
        groupFormat = "%Y-%m-%d";
        break;
      case "month":
        startDate = moment().subtract(30, "days").toDate();
        groupFormat = "%Y-%m-%d";
        break;
      case "year":
        startDate = moment().subtract(365, "days").toDate();
        groupFormat = "%Y-%m";
        break;
      default:
        startDate = moment().subtract(30, "days").toDate();
        groupFormat = "%Y-%m-%d";
    }

    // Агрегация для подсчета обращений по дням
    const dailyStats = await Chat.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(dailyStats);
  } catch (error) {
    console.error("Get daily stats error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение статистики по диагнозам
export const getDiagnosisStats = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate;

    // Определение периода фильтрации
    switch (period) {
      case "day":
        startDate = moment().subtract(1, "days").toDate();
        break;
      case "week":
        startDate = moment().subtract(7, "days").toDate();
        break;
      case "month":
        startDate = moment().subtract(30, "days").toDate();
        break;
      case "year":
        startDate = moment().subtract(365, "days").toDate();
        break;
      default:
        startDate = moment().subtract(30, "days").toDate();
    }

    // Агрегация для подсчета частоты диагнозов
    const diagnosisStats = await Chat.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          diagnosis: { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$diagnosis",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          diagnosis: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(diagnosisStats);
  } catch (error) {
    console.error("Get diagnosis stats error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение общей статистики
export const getOverallStats = async (req, res) => {
  try {
    // Общее количество чатов
    const totalChats = await Chat.countDocuments();

    // Количество чатов за сегодня
    const todayChats = await Chat.countDocuments({
      createdAt: { $gte: moment().startOf("day").toDate() },
    });

    // Количество активных пользователей (уникальных пользователей за последние 30 дней)
    const activeUsers = await Chat.aggregate([
      {
        $match: {
          createdAt: { $gte: moment().subtract(30, "days").toDate() },
        },
      },
      {
        $group: {
          _id: "$user",
        },
      },
      {
        $count: "count",
      },
    ]);

    // Количество уникальных диагнозов
    const uniqueDiagnoses = await Chat.aggregate([
      {
        $match: {
          diagnosis: { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$diagnosis",
        },
      },
      {
        $count: "count",
      },
    ]);

    res.json({
      totalChats,
      todayChats,
      activeUsers: activeUsers[0]?.count || 0,
      uniqueDiagnoses: uniqueDiagnoses[0]?.count || 0,
    });
  } catch (error) {
    console.error("Get overall stats error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

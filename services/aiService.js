import axios from "axios";

// Исправлен URL API и добавлена проверка токена
const API_URL = "https://api-inference.huggingface.co/models/Mykesmedicus";

/**
 * Анализирует симптомы и возвращает предполагаемый диагноз используя Hugging Face API
 * @param {string} symptoms - Описание симптомов
 * @param {Array} contextHistory - История предыдущих симптомов (необязательно)
 * @returns {Promise<string>} - Предполагаемый диагноз
 */
export const analyzeSymptoms = async (symptoms, contextHistory = []) => {
  try {
    // Проверяем наличие токена
    if (!process.env.HUGGINGFACE_API_TOKEN) {
      console.error("HUGGINGFACE_API_TOKEN не найден в переменных окружения");
      return "Не удалось подключиться к сервису анализа симптомов. Пожалуйста, обратитесь к администратору.";
    }

    // Формируем контекст из предыдущих симптомов
    let contextPrompt = "";
    if (contextHistory && contextHistory.length > 0) {
      contextPrompt =
        "Предыдущие симптомы пациента: " +
        contextHistory.map((s) => `"${s}"`).join(", ") +
        ". ";
    }

    // Создаем полный запрос с контекстом и запрашиваем подробный анализ с рекомендациями
    const inputText = `${contextPrompt}Текущие симптомы: ${symptoms}. Дайте подробный анализ симптомов, предварительный диагноз с возможными причинами, и четкие рекомендации: к какому специалисту обратиться и какие анализы стоит сдать для подтверждения диагноза.`;

    console.log("Отправка запроса к Hugging Face API:", API_URL);
    console.log("Текст запроса:", inputText);

    // ВРЕМЕННОЕ РЕШЕНИЕ: Если API не работает, можно вернуть заглушку для тестирования
    if (
      process.env.NODE_ENV === "development" &&
      process.env.USE_MOCK_AI === "true"
    ) {
      console.log("Используется тестовая заглушка вместо API");
      return mockAnalyzeSymptoms(symptoms, contextHistory);
    }

    const response = await axios.post(
      API_URL,
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 секунд таймаут
      }
    );

    console.log("Ответ API:", response.data);

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text;
    } else {
      throw new Error("Некорректный ответ от API");
    }
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    if (error.response) {
      console.error(
        "API response error:",
        error.response.status,
        error.response.data
      );
    }

    // ВРЕМЕННОЕ РЕШЕНИЕ: Если API не работает, возвращаем заглушку
    if (process.env.NODE_ENV === "development") {
      console.log("API недоступно, возвращается тестовая заглушка");
      return mockAnalyzeSymptoms(symptoms, contextHistory);
    }

    throw new Error(
      "Не удалось проанализировать симптомы. Пожалуйста, попробуйте позже."
    );
  }
};

/**
 * Тестовая заглушка для анализа симптомов (используется при недоступности API)
 */
const mockAnalyzeSymptoms = (symptoms, contextHistory = []) => {
  const lowerSymptoms = symptoms.toLowerCase();

  // Если текст не очень похож на симптомы, возвращаем общий ответ
  const symptomKeywords = [
    "болит",
    "боль",
    "температура",
    "кашель",
    "насморк",
    "тошнота",
    "голова",
    "горло",
    "живот",
    "спина",
    "слабость",
    "утомляемость",
    "сыпь",
    "зуд",
    "давление",
    "одышка",
    "тяжело дышать",
    "озноб",
  ];

  const isSymptomDescription = symptomKeywords.some((keyword) =>
    lowerSymptoms.includes(keyword)
  );

  if (!isSymptomDescription && lowerSymptoms.length < 15) {
    return "На основе ваших симптомов трудно определить точный диагноз. Рекомендуется обратиться к врачу для детального обследования или попробуйте описать симптомы более подробно.";
  }

  let diagnosis = "";
  let recommendation = "";

  // Простая логика для определения диагноза по ключевым словам
  if (lowerSymptoms.includes("голов") && lowerSymptoms.includes("бол")) {
    diagnosis = `
**Анализ симптомов:** 
Вы описываете головную боль, что может указывать на несколько возможных состояний. Головная боль может проявляться по-разному: пульсирующая, давящая, односторонняя или охватывающая всю голову. 

**Возможные причины:**
1. Головная боль напряжения - наиболее распространенный тип, характеризуется ощущением давления или сжатия головы
2. Мигрень - часто сопровождается светобоязнью, тошнотой, рвотой
3. Кластерная головная боль - очень интенсивная, обычно возникает с одной стороны головы
4. Вторичные причины - синусит, гипертония, стресс, обезвоживание, недостаток сна

**Рекомендации:**
Рекомендую обратиться к неврологу для диагностики и определения типа головной боли. Полезными могут быть следующие исследования:
- Общий анализ крови
- Измерение артериального давления
- МРТ головного мозга (при регулярных или сильных головных болях)
- Дневник головной боли (записывайте частоту, интенсивность, сопутствующие симптомы)

В качестве временной меры: отдых в тихом затемненном помещении, достаточное потребление воды, умеренные дозы безрецептурных анальгетиков (при отсутствии противопоказаний).`;
  } else if (
    lowerSymptoms.includes("горл") &&
    (lowerSymptoms.includes("бол") || lowerSymptoms.includes("першит"))
  ) {
    diagnosis = `
**Анализ симптомов:**
Вы описываете боль или першение в горле, что является распространенным симптомом при различных состояниях, от вирусных инфекций до бактериальных инфекций или аллергических реакций.

**Возможные причины:**
1. Вирусный фарингит - наиболее распространенная причина боли в горле, часто в рамках ОРВИ
2. Бактериальный фарингит или тонзиллит (ангина) - обычно сопровождается более высокой температурой, отсутствием кашля, увеличением лимфоузлов
3. Аллергический фарингит - часто сочетается с другими аллергическими проявлениями
4. Раздражение горла из-за сухого воздуха, курения, кислотного рефлюкса

**Рекомендации:**
Рекомендую обратиться к терапевту или оториноларингологу (ЛОР) для осмотра и определения причины. Полезными исследованиями могут быть:
- Общий анализ крови
- Мазок из зева на бактериологический посев
- Экспресс-тест на стрептококк (при подозрении на стрептококковую инфекцию)

В качестве симптоматической терапии: обильное теплое питье, полоскание горла антисептическими растворами (хлоргексидин, мирамистин, фурацилин), леденцы для рассасывания с антисептическим или противовоспалительным эффектом.`;
  } else if (
    lowerSymptoms.includes("температур") ||
    lowerSymptoms.includes("жар") ||
    lowerSymptoms.includes("лихорадк")
  ) {
    diagnosis = `
**Анализ симптомов:**
Повышенная температура (лихорадка, жар) - это защитная реакция организма, которая активируется при различных инфекционных и неинфекционных состояниях. Температура считается повышенной, когда она превышает 37°C.

**Возможные причины:**
1. Вирусные инфекции - наиболее распространенная причина (грипп, ОРВИ, COVID-19)
2. Бактериальные инфекции - ангина, пневмония, инфекции мочевыводящих путей, др.
3. Другие инфекции - грибковые, паразитарные
4. Неинфекционные причины - аутоиммунные заболевания, злокачественные новообразования, реакция на лекарства

**Рекомендации:**
Необходимо обратиться к терапевту для оценки вашего состояния. Рекомендуемые исследования:
- Общий анализ крови
- Общий анализ мочи
- Рентген органов грудной клетки (при подозрении на пневмонию)
- ПЦР-тесты или экспресс-тесты на актуальные инфекции (грипп, COVID-19)

При температуре выше 38-38.5°C и плохом самочувствии можно принять жаропонижающее (парацетамол, ибупрофен при отсутствии противопоказаний). Обеспечьте обильное питье для предотвращения обезвоживания. При температуре выше 39°C, судорогах, сильной одышке, нарушении сознания - срочно вызовите скорую помощь.`;
  } else if (lowerSymptoms.includes("кашл")) {
    diagnosis = `
**Анализ симптомов:**
Кашель - это защитный рефлекс, который помогает очищать дыхательные пути. Характер кашля (сухой/влажный, продуктивный/непродуктивный, время возникновения) важен для диагностики.

**Возможные причины:**
1. Вирусные инфекции верхних дыхательных путей (ОРВИ, грипп)
2. Бактериальные инфекции (бронхит, пневмония)
3. Аллергический или постназальный синдром
4. Астма или хроническая обструктивная болезнь легких (ХОБЛ)
5. Гастроэзофагеальная рефлюксная болезнь (ГЭРБ)
6. Прием некоторых лекарств (например, ингибиторов АПФ)

**Рекомендации:**
Рекомендую обратиться к терапевту или пульмонологу. Полезными исследованиями могут быть:
- Общий анализ крови
- Рентген или КТ органов грудной клетки
- Спирометрия (исследование функции внешнего дыхания)
- Анализ мокроты (при продуктивном кашле)

В качестве симптоматической терапии: увлажнение воздуха, обильное питье, отхаркивающие средства при влажном кашле, противокашлевые - при сухом (по рекомендации врача), избегание раздражающих факторов (курение, загрязненный воздух).`;
  } else if (
    lowerSymptoms.includes("насморк") ||
    (lowerSymptoms.includes("заложен") && lowerSymptoms.includes("нос"))
  ) {
    diagnosis = `
**Анализ симптомов:**
Ринит (насморк) и заложенность носа возникают при воспалении слизистой оболочки носа, что приводит к отеку и повышенной секреции слизи.

**Возможные причины:**
1. Вирусный ринит (часть ОРВИ)
2. Аллергический ринит (сезонный или круглогодичный)
3. Вазомоторный ринит (реакция на раздражители: холодный воздух, духи и т.д.)
4. Синусит (воспаление околоносовых пазух)
5. Медикаментозный ринит (при длительном использовании сосудосуживающих капель)

**Рекомендации:**
Рекомендую обратиться к оториноларингологу (ЛОР-врачу) или аллергологу. Полезными исследованиями могут быть:
- Риноскопия (осмотр носовой полости)
- Анализ крови на аллергены (при подозрении на аллергию)
- КТ околоносовых пазух (при подозрении на синусит)

В качестве временных мер: промывание носа солевыми растворами, кратковременное использование сосудосуживающих капель (не более 5-7 дней), увлажнение воздуха в помещении. При аллергическом рините могут быть эффективны антигистаминные препараты или назальные кортикостероиды (по назначению врача).`;
  } else if (lowerSymptoms.includes("живот") && lowerSymptoms.includes("бол")) {
    diagnosis = `
**Анализ симптомов:**
Боль в животе может возникать из-за множества причин, от относительно безобидных до потенциально опасных для жизни. Характер боли (острая/тупая, постоянная/приступообразная, локализация, иррадиация) имеет важное диагностическое значение.

**Возможные причины:**
1. Функциональные расстройства ЖКТ (синдром раздраженного кишечника, функциональная диспепсия)
2. Гастрит, язвенная болезнь
3. Панкреатит
4. Воспалительные заболевания кишечника
5. Холецистит, желчнокаменная болезнь
6. Аппендицит, дивертикулит
7. Непроходимость кишечника
8. Гинекологические причины у женщин (эндометриоз, воспалительные заболевания органов малого таза)

**Рекомендации:**
В зависимости от характера и интенсивности боли, рекомендую обратиться к гастроэнтерологу или хирургу. При сильной, внезапной боли, сопровождающейся рвотой, лихорадкой или кровью в стуле - срочно обратитесь за медицинской помощью!

Полезными исследованиями могут быть:
- Общий анализ крови
- Биохимический анализ крови (включая печеночные пробы, амилазу, липазу)
- УЗИ органов брюшной полости
- Эзофагогастродуоденоскопия (ЭГДС)
- Колоноскопия
- КТ брюшной полости

До консультации с врачом избегайте самолечения, особенно приема обезболивающих, которые могут маскировать важные симптомы.`;
  } else if (
    lowerSymptoms.includes("тошнот") ||
    lowerSymptoms.includes("рвот")
  ) {
    diagnosis = `
**Анализ симптомов:**
Тошнота и рвота - это защитные механизмы организма, которые могут возникать при различных состояниях, от легких до потенциально опасных.

**Возможные причины:**
1. Пищевое отравление или пищевая инфекция
2. Вирусные инфекции (гастроэнтерит, "кишечный грипп")
3. Побочные эффекты лекарств
4. Мигрень
5. Вестибулярные нарушения, укачивание
6. Беременность (токсикоз)
7. Заболевания ЖКТ (гастрит, язва, панкреатит, холецистит)
8. Серьезные причины: кишечная непроходимость, черепно-мозговая травма, повышение внутричерепного давления

**Рекомендации:**
Рекомендую обратиться к терапевту или гастроэнтерологу. При сильной, продолжительной рвоте, особенно с кровью или сопровождающейся сильной головной болью, болью в животе, обезвоживанием - срочно обратитесь за медицинской помощью!

Полезными исследованиями могут быть:
- Общий анализ крови
- Биохимический анализ крови
- УЗИ органов брюшной полости
- Анализ на инфекции (при подозрении на инфекционную причину)

Для предотвращения обезвоживания: пейте небольшими порциями прозрачные жидкости (вода, слабый чай, регидрон), избегайте твердой пищи до улучшения состояния, затем постепенно вводите легкую пищу (сухари, бананы, рис).`;
  } else if (
    lowerSymptoms.includes("диаре") ||
    lowerSymptoms.includes("понос")
  ) {
    diagnosis = `
**Анализ симптомов:**
Диарея (понос) - это частый жидкий стул (более 3 раз в сутки), который может быть острым (до 2 недель) или хроническим (более 4 недель).

**Возможные причины:**
1. Вирусные инфекции (ротавирус, норовирус)
2. Бактериальные инфекции (сальмонелла, шигелла, кампилобактер, E. coli)
3. Паразитарные инфекции (лямблиоз, амебиаз)
4. Пищевая непереносимость (лактозная непереносимость, целиакия)
5. Синдром раздраженного кишечника
6. Воспалительные заболевания кишечника (болезнь Крона, язвенный колит)
7. Побочные эффекты лекарств (антибиотики, слабительные)

**Рекомендации:**
Рекомендую обратиться к терапевту или гастроэнтерологу. При сильной диарее, длящейся более 3 дней, с высокой температурой, кровью в стуле, сильным обезвоживанием - срочно обратитесь за медицинской помощью!

Полезными исследованиями могут быть:
- Общий анализ крови
- Анализ кала (копрограмма, на скрытую кровь, на яйца глист и цисты простейших)
- Посев кала на патогенную флору
- Тесты на пищевую непереносимость
- Колоноскопия (при хронической диарее)

Для предотвращения обезвоживания: пейте больше жидкости, можно использовать растворы для пероральной регидратации. Придерживайтесь щадящей диеты (каши на воде, сухари, бананы). Избегайте молочных продуктов, кофеина, алкоголя, жирной и острой пищи.`;
  } else if (lowerSymptoms.includes("сыпь") || lowerSymptoms.includes("зуд")) {
    diagnosis = `
**Анализ симптомов:**
Кожная сыпь и зуд могут быть проявлениями различных состояний, от аллергии до инфекционных и аутоиммунных заболеваний. Характер сыпи (цвет, форма, распределение, наличие зуда) помогает в диагностике.

**Возможные причины:**
1. Аллергические реакции (контактный дерматит, крапивница, атопический дерматит)
2. Инфекционные заболевания (корь, ветрянка, краснуха, скарлатина и др.)
3. Грибковые инфекции
4. Чесотка, педикулез и другие паразитарные заболевания
5. Аутоиммунные заболевания (псориаз, экзема)
6. Реакция на лекарства
7. Сухость кожи

**Рекомендации:**
Рекомендую обратиться к дерматологу или аллергологу-иммунологу. При распространенной сыпи, сопровождающейся высокой температурой, затрудненным дыханием, отеком губ/языка - срочно обратитесь за медицинской помощью!

Полезными исследованиями могут быть:
- Общий анализ крови
- Анализы на аллергены (при подозрении на аллергию)
- Микроскопическое исследование соскоба с кожи (при подозрении на грибковую инфекцию, чесотку)
- Биопсия кожи (при необходимости)

Временные меры: избегайте расчесывания, используйте мягкие гипоаллергенные средства для кожи, носите свободную хлопчатобумажную одежду, исключите из рациона потенциальные аллергены, при сухости кожи - увлажняющие средства.`;
  } else if (
    lowerSymptoms.includes("одышк") ||
    lowerSymptoms.includes("трудно дыша") ||
    lowerSymptoms.includes("не хватает воздух")
  ) {
    diagnosis = `
**Анализ симптомов:**
Одышка (диспноэ) - это ощущение нехватки воздуха или затрудненного дыхания. Это может быть симптомом различных заболеваний, от легких до потенциально опасных для жизни.

**Возможные причины:**
1. Заболевания дыхательной системы (астма, ХОБЛ, пневмония, плеврит, пневмоторакс)
2. Заболевания сердечно-сосудистой системы (сердечная недостаточность, аритмии, ишемическая болезнь сердца)
3. Анемия
4. Тревожные расстройства, панические атаки
5. Ожирение
6. Аллергические реакции
7. Тромбоэмболия легочной артерии (ТЭЛА)

**Рекомендации:**
В зависимости от интенсивности и характера одышки, рекомендую обратиться к терапевту, пульмонологу или кардиологу. При внезапной, сильной одышке, особенно в сочетании с болью в груди, синюшностью губ или ногтей, нарушениями сознания - немедленно вызывайте скорую помощь!

Полезными исследованиями могут быть:
- Общий анализ крови
- ЭКГ
- Рентген или КТ органов грудной клетки
- Спирометрия (исследование функции легких)
- Эхокардиография
- Анализ газов артериальной крови

До консультации с врачом: обеспечьте доступ свежего воздуха, займите положение, облегчающее дыхание (обычно с приподнятым изголовьем), избегайте физических нагрузок и стрессовых ситуаций.`;
  } else if (
    lowerSymptoms.includes("давлен") ||
    lowerSymptoms.includes("гиперт")
  ) {
    diagnosis = `
**Анализ симптомов:**
Повышенное артериальное давление (артериальная гипертензия) часто не имеет явных симптомов, но может проявляться головной болью, головокружением, учащенным сердцебиением, одышкой при нагрузке.

**Возможные причины:**
1. Первичная (эссенциальная) гипертензия - наиболее распространенная форма, связана с генетическими факторами и образом жизни
2. Вторичная гипертензия - вызвана другими заболеваниями (заболевания почек, эндокринные нарушения, сосудистые патологии, прием некоторых лекарств)

**Рекомендации:**
Рекомендую обратиться к терапевту или кардиологу. При очень высоком давлении (систолическое > 180 мм рт. ст. или диастолическое > 120 мм рт. ст.), особенно с такими симптомами как сильная головная боль, нарушение зрения, тошнота/рвота, спутанность сознания - срочно обратитесь за медицинской помощью!

Полезными исследованиями могут быть:
- Мониторинг артериального давления (домашние измерения или суточное мониторирование)
- Общий анализ крови и мочи
- Биохимический анализ крови (липидный профиль, глюкоза, электролиты, функция почек)
- ЭКГ, эхокардиография
- УЗИ почек и надпочечников (при подозрении на вторичную гипертензию)

Рекомендации по образу жизни: снижение потребления соли, регулярная физическая активность, отказ от курения и злоупотребления алкоголем, снижение веса при необходимости, управление стрессом. Медикаментозная терапия назначается врачом индивидуально.`;
  } else if (lowerSymptoms.includes("аллерг")) {
    diagnosis = `
**Анализ симптомов:**
Аллергия - это повышенная чувствительность иммунной системы к определенным веществам (аллергенам), которые обычно безвредны. Проявления аллергии могут быть различными: от легкого насморка до тяжелых системных реакций.

**Возможные причины (аллергены):**
1. Пыльца растений
2. Домашняя пыль и клещи домашней пыли
3. Эпидермис животных (шерсть, перхоть, слюна)
4. Пищевые продукты (орехи, яйца, молоко, морепродукты и др.)
5. Лекарственные препараты
6. Укусы насекомых
7. Плесень
8. Латекс

**Рекомендации:**
Рекомендую обратиться к аллергологу-иммунологу. При тяжелых аллергических реакциях (отек губ/языка/горла, затрудненное дыхание, резкое падение давления) - немедленно вызывайте скорую помощь!

Полезными исследованиями могут быть:
- Кожные пробы (прик-тесты)
- Анализ крови на специфические IgE (иммуноглобулины E) к различным аллергенам
- Провокационные пробы (в редких случаях, под наблюдением врача)

Рекомендации для управления аллергией:
1. Избегание контакта с аллергеном (по возможности)
2. Применение антигистаминных препаратов (по назначению врача)
3. Назальные кортикостероиды при аллергическом рините
4. Местные кортикостероиды при аллергическом дерматите
5. Бронходилататоры при бронхиальной астме
6. Аллерген-специфическая иммунотерапия для долгосрочного лечения

При риске анафилаксии (тяжелой системной аллергической реакции) врач может прописать автоинжектор с адреналином для экстренного применения.`;
  } else {
    diagnosis = `
**Анализ симптомов:**
На основе предоставленной информации о ваших симптомах: "${symptoms}", можно предположить несколько возможных состояний, которые требуют более детального медицинского обследования.

**Возможные причины:**
Для точного определения причин ваших жалоб требуется более подробная информация и клиническое обследование. Симптомы могут указывать на различные состояния - от функциональных расстройств до воспалительных или инфекционных процессов.

**Рекомендации:**
Рекомендую обратиться к терапевту для первичной консультации и определения дальнейшей тактики обследования. Врач проведет осмотр, соберет подробный анамнез и назначит необходимые исследования, которые могут включать:
- Общий анализ крови
- Общий анализ мочи
- Биохимический анализ крови
- Дополнительные инструментальные исследования в зависимости от характера симптомов

Важно не заниматься самолечением и получить квалифицированную медицинскую помощь для правильной диагностики и лечения вашего состояния.`;
  }

  // Учитываем контекст из предыдущих симптомов
  if (contextHistory && contextHistory.length > 0) {
    const contextString = contextHistory.join(" ").toLowerCase();

    // Пример учета контекста
    if (
      (lowerSymptoms.includes("головокружение") ||
        lowerSymptoms.includes("слабость")) &&
      contextString.includes("голов") &&
      contextString.includes("бол")
    ) {
      diagnosis += `

**Дополнительно на основе ваших предыдущих симптомов:**
Учитывая ваши предыдущие жалобы на головную боль и текущие симптомы (головокружение/слабость), следует рассмотреть возможность мигрени с сопутствующими симптомами, вестибулярных нарушений или нарушений кровообращения головного мозга. Это повышает важность консультации невролога. 

Дополнительно к ранее рекомендованным исследованиям может потребоваться:
- Дуплексное сканирование сосудов головы и шеи
- МРТ головного мозга
- Консультация отоневролога при выраженном головокружении`;
    }

    if (
      lowerSymptoms.includes("температур") &&
      contextString.includes("горл") &&
      contextString.includes("бол")
    ) {
      diagnosis += `

**Дополнительно на основе ваших предыдущих симптомов:**
Боль в горле с последующим повышением температуры часто указывает на развитие бактериальной инфекции, например, стрептококковой ангины. Это повышает значимость консультации оториноларинголога (ЛОР-врача) и проведения бактериологического исследования мазка из зева.

В этом случае, помимо ранее рекомендованных исследований, может потребоваться:
- Экспресс-тест на стрептококк группы А
- Определение антистрептолизина-О (АСЛ-О) в крови
- Более тщательный контроль для предотвращения осложнений, таких как ревматическая лихорадка или постстрептококковый гломерулонефрит`;
    }

    if (
      (lowerSymptoms.includes("насморк") || lowerSymptoms.includes("кашель")) &&
      contextString.includes("температур") &&
      contextString.includes("горл")
    ) {
      diagnosis += `

**Дополнительно на основе ваших предыдущих симптомов:**
Развитие насморка/кашля после боли в горле и температуры является типичной картиной ОРВИ с последовательным вовлечением различных отделов респираторного тракта. Это может указывать на вирусную этиологию заболевания, хотя не исключает возможных бактериальных осложнений.

Важно:
- Наблюдение за характером мокроты при кашле (появление гнойной мокроты может указывать на бактериальное осложнение)
- Контроль температуры тела
- Адекватная гидратация
- Консультация пульмонолога в случае затяжного течения или усиления симптомов`;
    }
  }

  return diagnosis;
};

/**
 * Проверяет, является ли текст описанием симптомов
 * @param {string} text - Текст для проверки
 * @returns {Promise<boolean>} - true если текст является описанием симптомов
 */
export const isSymptomDescription = async (text) => {
  try {
    // ВРЕМЕННОЕ РЕШЕНИЕ: Если API недоступно, используем упрощенную проверку
    if (
      !process.env.HUGGINGFACE_API_TOKEN ||
      (process.env.NODE_ENV === "development" &&
        process.env.USE_MOCK_AI === "true")
    ) {
      // Простая проверка: считаем, что текст описывает симптомы, если в нем есть ключевые слова
      const symptomKeywords = [
        "болит",
        "боль",
        "температура",
        "кашель",
        "насморк",
        "тошнота",
        "голова",
        "горло",
        "живот",
        "спина",
        "слабость",
        "утомляемость",
        "сыпь",
        "зуд",
        "давление",
        "одышка",
        "тяжело дышать",
        "озноб",
        "рвота",
        "понос",
        "диарея",
        "сухость",
        "першит",
        "головокружение",
        "бессонница",
        "аллергия",
        "заложенность",
        "мигрень",
        "простуда",
        "потливость",
        "судороги",
        "тремор",
        "чешется",
        "опухоль",
        "отек",
      ];

      const lowerText = text.toLowerCase();
      return (
        symptomKeywords.some((keyword) => lowerText.includes(keyword)) ||
        text.length > 10
      ); // Считаем достаточно длинный текст описанием симптомов
    }

    const inputText = `Это описание медицинских симптомов? "${text}"`;

    const response = await axios.post(
      API_URL,
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 5000, // 5 секунд таймаут
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      // Анализируем ответ модели, чтобы определить, содержит ли он положительный ответ
      const answer = response.data[0].generated_text.toLowerCase();
      return (
        answer.includes("да") ||
        answer.includes("это симптом") ||
        answer.includes("это описание симптом") ||
        !answer.includes("нет")
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking if text is symptom description:", error);
    // В случае ошибки, считаем текст описанием симптомов, чтобы избежать ложных негативов
    return true;
  }
};

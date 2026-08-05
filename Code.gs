/**
 * NEXT GAME TICKET — Google Apps Script backend.
 *
 * Сценарий должен быть привязан к Google Таблице:
 * Расширения → Apps Script → вставить Code.gs и Admin.html.
 *
 * После сохранения обновите Таблицу и запустите:
 * Билет → Первичная настройка.
 */

/* ============================================================================
   РЕДАКТИРУЕМЫЕ СЕРВЕРНЫЕ ПАРАМЕТРЫ — собраны в одном месте.
   Контент и цвета после установки меняются через веб-админку, не здесь.
   ============================================================================ */
const SERVER_SETTINGS = Object.freeze({
  CONFIG_SHEET_NAME: "TicketConfig",
  AUDIT_SHEET_NAME: "TicketAudit",
  CACHE_SECONDS: 60,
  MIN_ADMIN_PASSWORD_LENGTH: 12,
  SPREADSHEET_ID_PROPERTY: "TICKET_SPREADSHEET_ID",
  ADMIN_HASH_PROPERTY: "TICKET_ADMIN_PASSWORD_HASH",
  CACHE_KEY: "NEXT_GAME_TICKET_PUBLIC_V1",
  ADMIN_PAGE_TITLE: "Админка ближайшей игры"
});

/* Только эти поля разрешено сохранять из админки. */
const FIELD_DEFINITIONS = Object.freeze([
  { key: "price", defaultValue: "800₽", type: "text", maxLength: 40 },
  { key: "game_title", defaultValue: "МЕЛОМАНИЯ", type: "text", maxLength: 100 },
  { key: "address", defaultValue: "ул. Квизалендова, 19", type: "text", maxLength: 180 },
  { key: "image_url", defaultValue: "", type: "url", maxLength: 1000 },
  {
    key: "image_alt",
    defaultValue: "Иллюстрация ближайшей игры",
    type: "text",
    maxLength: 180
  },
  { key: "date_iso", defaultValue: "2026-07-13", type: "date", maxLength: 10 },
  { key: "time", defaultValue: "13:00", type: "time", maxLength: 5 },
  { key: "button_label", defaultValue: "ИДУ ИГРАТЬ", type: "text", maxLength: 40 },
  { key: "button_url", defaultValue: "https://example.com/", type: "url", maxLength: 1000 },
  { key: "share_url", defaultValue: "https://example.com/", type: "url", maxLength: 1000 },
  { key: "geo_icon_url", defaultValue: "", type: "url", maxLength: 1000 },
  {
    key: "ticket_background_color",
    defaultValue: "#F5F6F8",
    type: "color",
    maxLength: 7
  },
  { key: "price_color", defaultValue: "#7E0AD1", type: "color", maxLength: 7 },
  { key: "title_color", defaultValue: "#7E0AD1", type: "color", maxLength: 7 },
  { key: "address_color", defaultValue: "#7E0AD1", type: "color", maxLength: 7 },
  {
    key: "date_background_color",
    defaultValue: "#7E0AD1",
    type: "color",
    maxLength: 7
  },
  { key: "date_text_color", defaultValue: "#FFFFFF", type: "color", maxLength: 7 },
  {
    key: "button_background_color",
    defaultValue: "#7E0AD1",
    type: "color",
    maxLength: 7
  },
  { key: "button_text_color", defaultValue: "#D9FF62", type: "color", maxLength: 7 },
  {
    key: "share_background_color",
    defaultValue: "#7E0AD1",
    type: "color",
    maxLength: 7
  },
  { key: "share_icon_color", defaultValue: "#D9FF62", type: "color", maxLength: 7 },
  {
    key: "image_background_color",
    defaultValue: "transparent",
    type: "colorOrTransparent",
    maxLength: 11
  },
  { key: "texture_url", defaultValue: "", type: "url", maxLength: 1000 },
  { key: "texture_opacity", defaultValue: 0.32, type: "number01", maxLength: 4 },
  {
    key: "font_family",
    defaultValue: "Arial, Helvetica, sans-serif",
    type: "fontFamily",
    maxLength: 160
  },
  { key: "animation_enabled", defaultValue: true, type: "boolean", maxLength: 5 },
  {
    key: "animation_duration_ms",
    defaultValue: 1200,
    type: "duration",
    maxLength: 4
  },
  { key: "updated_at", defaultValue: "", type: "serverTimestamp", maxLength: 40 }
]);

const RUSSIAN_MONTHS_GENITIVE = Object.freeze([
  "ЯНВАРЯ",
  "ФЕВРАЛЯ",
  "МАРТА",
  "АПРЕЛЯ",
  "МАЯ",
  "ИЮНЯ",
  "ИЮЛЯ",
  "АВГУСТА",
  "СЕНТЯБРЯ",
  "ОКТЯБРЯ",
  "НОЯБРЯ",
  "ДЕКАБРЯ"
]);

/**
 * Добавляет меню в Google Таблицу.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Билет")
    .addItem("Первичная настройка", "setupTicketProject")
    .addItem("Показать адрес админки", "showAdminUrl")
    .addItem("Сменить пароль админки", "changeAdminPasswordFromMenu")
    .addToUi();
}

/**
 * Создаёт листы, заголовки и пароль. Запускается один раз из меню Таблицы.
 */
function setupTicketProject() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("Скрипт должен быть привязан к Google Таблице.");
  }

  PropertiesService.getScriptProperties().setProperty(
    SERVER_SETTINGS.SPREADSHEET_ID_PROPERTY,
    spreadsheet.getId()
  );

  ensureConfigSheet_(spreadsheet);
  ensureAuditSheet_(spreadsheet);

  const ui = SpreadsheetApp.getUi();
  const currentHash = PropertiesService.getScriptProperties().getProperty(
    SERVER_SETTINGS.ADMIN_HASH_PROPERTY
  );

  if (!currentHash) {
    const response = ui.prompt(
      "Пароль админки",
      `Придумайте пароль не короче ${SERVER_SETTINGS.MIN_ADMIN_PASSWORD_LENGTH} символов. ` +
        "Он не будет записан в Таблицу и сохранится только в виде SHA-256 хэша.",
      ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== ui.Button.OK) {
      ui.alert(
        "Листы созданы, но пароль не установлен. Повторите «Первичную настройку» позже."
      );
      return;
    }

    setAdminPassword_(response.getResponseText());
  }

  ui.alert(
    "Готово",
    "Структура Таблицы и пароль настроены. Теперь разверните Apps Script как веб-приложение.",
    ui.ButtonSet.OK
  );
}

/**
 * GET:
 *   ?api=ticket&callback=fn — публичная JSONP-конфигурация для Tilda.
 *   без api — отдельная админка.
 */
function doGet(event) {
  const params = (event && event.parameter) || {};

  if (params.api === "ticket") {
    const payload = {
      ok: true,
      data: getPublicTicketData_()
    };

    const callback = String(params.callback || "").trim();
    if (callback) {
      if (!isValidJsonpCallback_(callback)) {
        return ContentService.createTextOutput(
          "throw new Error('Invalid JSONP callback');"
        ).setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      return ContentService.createTextOutput(
        `${callback}(${JSON.stringify(payload)});`
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  return HtmlService.createHtmlOutputFromFile("Admin")
    .setTitle(SERVER_SETTINGS.ADMIN_PAGE_TITLE)
    .addMetaTag("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
}

/**
 * Вызывается из Admin.html через google.script.run.
 * Пароль проверяется на сервере; наружу его хэш не возвращается.
 */
function getAdminConfig(password) {
  assertAdminPassword_(password);
  return getPublicTicketData_();
}

/**
 * Сохраняет только whitelisted-поля после серверной валидации.
 */
function saveAdminConfig(payload, password) {
  assertAdminPassword_(password);
  const sanitized = sanitizePayload_(payload || {});
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(10000)) {
    throw new Error("Данные сейчас обновляются. Повторите сохранение через несколько секунд.");
  }

  try {
    const sheet = getConfigSheet_();
    const previous = readConfigRow_(sheet);
    sanitized.updated_at = new Date().toISOString();
    writeConfigRow_(sheet, sanitized);
    appendAudit_(previous, sanitized);
    CacheService.getScriptCache().remove(SERVER_SETTINGS.CACHE_KEY);
    return toPublicConfig_(sanitized);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Смена пароля из меню Таблицы. Текущий пароль не нужен, поскольку действие
 * выполняется владельцем/редактором самой Таблицы.
 */
function changeAdminPasswordFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    "Новый пароль админки",
    `Минимум ${SERVER_SETTINGS.MIN_ADMIN_PASSWORD_LENGTH} символов.`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;
  setAdminPassword_(response.getResponseText());
  ui.alert("Пароль админки обновлён.");
}

/**
 * Показывает production URL после развертывания.
 */
function showAdminUrl() {
  const url = ScriptApp.getService().getUrl();
  const ui = SpreadsheetApp.getUi();
  if (!url) {
    ui.alert(
      "Веб-приложение ещё не развёрнуто. Откройте «Развернуть → Новое развертывание»."
    );
    return;
  }

  const escapedUrl = escapeHtml_(url);
  const html = HtmlService.createHtmlOutput(
    `<div style="font:14px/1.5 Arial;padding:18px">` +
      `<p><b>Админка и API используют один production URL:</b></p>` +
      `<p><a href="${escapedUrl}" target="_blank" rel="noopener">${escapedUrl}</a></p>` +
      `<p>API: <code>${escapedUrl}?api=ticket</code></p>` +
      `</div>`
  ).setWidth(560).setHeight(190);
  ui.showModalDialog(html, "Адрес веб-приложения");
}

function getPublicTicketData_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(SERVER_SETTINGS.CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const config = toPublicConfig_(readConfigRow_(getConfigSheet_()));
  cache.put(
    SERVER_SETTINGS.CACHE_KEY,
    JSON.stringify(config),
    SERVER_SETTINGS.CACHE_SECONDS
  );
  return config;
}

function toPublicConfig_(config) {
  const publicConfig = {};
  FIELD_DEFINITIONS.forEach((definition) => {
    publicConfig[definition.key] =
      config[definition.key] !== undefined
        ? config[definition.key]
        : definition.defaultValue;
  });

  const dateParts = deriveDateParts_(publicConfig.date_iso);
  publicConfig.date_day = dateParts.day;
  publicConfig.date_month = dateParts.month;
  return publicConfig;
}

function sanitizePayload_(payload) {
  const sanitized = {};
  FIELD_DEFINITIONS.forEach((definition) => {
    if (definition.type === "serverTimestamp") return;
    const raw =
      Object.prototype.hasOwnProperty.call(payload, definition.key)
        ? payload[definition.key]
        : definition.defaultValue;
    sanitized[definition.key] = sanitizeField_(definition, raw);
  });
  return sanitized;
}

function sanitizeField_(definition, value) {
  const type = definition.type;

  if (type === "boolean") {
    return value === true || value === "true" || value === 1 || value === "1";
  }

  if (type === "number01") {
    const number = Number(value);
    if (!Number.isFinite(number)) return Number(definition.defaultValue);
    return Math.min(1, Math.max(0, number));
  }

  if (type === "duration") {
    const duration = Math.round(Number(value));
    if (!Number.isFinite(duration)) return Number(definition.defaultValue);
    return Math.min(4000, Math.max(400, duration));
  }

  let text = String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, definition.maxLength);

  if (type === "url") {
    if (!text) return "";
    if (!/^https:\/\/[^\s]+$/i.test(text)) {
      throw new Error(`Поле ${definition.key}: нужен полный HTTPS-адрес.`);
    }
    return text;
  }

  if (type === "color") {
    if (!/^#[0-9A-F]{6}$/i.test(text)) {
      throw new Error(`Поле ${definition.key}: цвет должен быть в формате #RRGGBB.`);
    }
    return text.toUpperCase();
  }

  if (type === "colorOrTransparent") {
    if (text.toLowerCase() === "transparent") return "transparent";
    if (!/^#[0-9A-F]{6}$/i.test(text)) {
      throw new Error(
        `Поле ${definition.key}: укажите #RRGGBB или слово transparent.`
      );
    }
    return text.toUpperCase();
  }

  if (type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !isRealIsoDate_(text)) {
      throw new Error("Укажите корректную дату.");
    }
    return text;
  }

  if (type === "time") {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)) {
      throw new Error("Укажите корректное время в формате ЧЧ:ММ.");
    }
    return text;
  }

  if (type === "fontFamily") {
    if (!/^[\p{L}\p{N}\s,'"_\-]+$/u.test(text)) {
      throw new Error("Название шрифта содержит недопустимые символы.");
    }
    return text || definition.defaultValue;
  }

  return text || String(definition.defaultValue);
}

function isRealIsoDate_(isoDate) {
  const parts = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return (
    date.getUTCFullYear() === parts[0] &&
    date.getUTCMonth() === parts[1] - 1 &&
    date.getUTCDate() === parts[2]
  );
}

function deriveDateParts_(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ""))) {
    return { day: "13", month: "ИЮЛЯ" };
  }
  const parts = isoDate.split("-").map(Number);
  return {
    day: String(parts[2]).padStart(2, "0"),
    month: RUSSIAN_MONTHS_GENITIVE[parts[1] - 1] || ""
  };
}

function setAdminPassword_(password) {
  const normalized = String(password || "");
  if (normalized.length < SERVER_SETTINGS.MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `Пароль должен содержать минимум ${SERVER_SETTINGS.MIN_ADMIN_PASSWORD_LENGTH} символов.`
    );
  }

  PropertiesService.getScriptProperties().setProperty(
    SERVER_SETTINGS.ADMIN_HASH_PROPERTY,
    hashPassword_(normalized)
  );
}

function assertAdminPassword_(password) {
  const expected = PropertiesService.getScriptProperties().getProperty(
    SERVER_SETTINGS.ADMIN_HASH_PROPERTY
  );
  if (!expected) {
    throw new Error(
      "Пароль админки не настроен. Запустите «Билет → Первичная настройка» в Таблице."
    );
  }

  const actual = hashPassword_(String(password || ""));
  if (!constantTimeEqual_(actual, expected)) {
    Utilities.sleep(350);
    throw new Error("Неверный пароль.");
  }
}

function hashPassword_(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return bytes
    .map((byte) => ((byte < 0 ? byte + 256 : byte).toString(16).padStart(2, "0")))
    .join("");
}

function constantTimeEqual_(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function isValidJsonpCallback_(callback) {
  return /^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(
    callback
  );
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(
    SERVER_SETTINGS.SPREADSHEET_ID_PROPERTY
  );
  if (!id) {
    throw new Error(
      "Google Таблица не привязана. Запустите «Билет → Первичная настройка»."
    );
  }
  return SpreadsheetApp.openById(id);
}

function getConfigSheet_() {
  const sheet = getSpreadsheet_().getSheetByName(SERVER_SETTINGS.CONFIG_SHEET_NAME);
  if (!sheet) {
    throw new Error("Лист конфигурации не найден. Повторите первичную настройку.");
  }
  return sheet;
}

function ensureConfigSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SERVER_SETTINGS.CONFIG_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SERVER_SETTINGS.CONFIG_SHEET_NAME);

  const headers = FIELD_DEFINITIONS.map((definition) => definition.key);
  const defaults = FIELD_DEFINITIONS.map((definition) => definition.defaultValue);
  const hasHeaders = sheet.getLastRow() >= 1 && sheet.getLastColumn() >= headers.length;

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, 1, defaults.length).setValues([defaults]);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (sheet.getLastRow() < 2) {
      sheet.getRange(2, 1, 1, defaults.length).setValues([defaults]);
    }
  }

  sheet.setFrozenRows(1);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setBackground("#24152D")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setWrap(true);
  sheet.getRange(2, 1, 1, headers.length).setNumberFormat("@");
  sheet.autoResizeColumns(1, headers.length);
  sheet.setColumnWidths(1, headers.length, 150);
  sheet.setColumnWidth(headers.indexOf("game_title") + 1, 220);
  sheet.setColumnWidth(headers.indexOf("address") + 1, 260);
  sheet.setColumnWidths(headers.indexOf("image_url") + 1, 3, 320);
  return sheet;
}

function ensureAuditSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SERVER_SETTINGS.AUDIT_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SERVER_SETTINGS.AUDIT_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, 4)
      .setValues([["timestamp", "editor", "changed_fields", "updated_at"]])
      .setBackground("#24152D")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readConfigRow_(sheet) {
  const headers = sheet
    .getRange(1, 1, 1, Math.max(1, sheet.getLastColumn()))
    .getDisplayValues()[0];
  const values = sheet
    .getRange(2, 1, 1, Math.max(1, sheet.getLastColumn()))
    .getDisplayValues()[0];
  const raw = {};
  headers.forEach((header, index) => {
    if (header) raw[header] = values[index];
  });

  const normalized = {};
  FIELD_DEFINITIONS.forEach((definition) => {
    const value =
      raw[definition.key] !== undefined && raw[definition.key] !== ""
        ? raw[definition.key]
        : definition.defaultValue;

    if (definition.type === "boolean") {
      normalized[definition.key] = String(value).toLowerCase() === "true";
    } else if (definition.type === "number01" || definition.type === "duration") {
      normalized[definition.key] = Number(value);
    } else {
      normalized[definition.key] = value;
    }
  });
  return normalized;
}

function writeConfigRow_(sheet, config) {
  const row = FIELD_DEFINITIONS.map((definition) => {
    return config[definition.key] !== undefined
      ? config[definition.key]
      : definition.defaultValue;
  });
  sheet.getRange(2, 1, 1, row.length).setValues([row]).setNumberFormat("@");
}

function appendAudit_(previous, next) {
  const changed = FIELD_DEFINITIONS.filter((definition) => {
    if (definition.key === "updated_at") return false;
    return String(previous[definition.key]) !== String(next[definition.key]);
  }).map((definition) => definition.key);

  const spreadsheet = getSpreadsheet_();
  const sheet =
    spreadsheet.getSheetByName(SERVER_SETTINGS.AUDIT_SHEET_NAME) ||
    ensureAuditSheet_(spreadsheet);
  const editor = Session.getActiveUser().getEmail() || "web-admin";
  sheet.appendRow([new Date(), editor, changed.join(", "), next.updated_at]);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

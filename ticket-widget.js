/**
 * NEXT GAME TICKET — независимый web-component для Tilda Zero Block.
 * Зависимостей нет. Стили изолированы Shadow DOM и не конфликтуют со стилями Tilda.
 *
 * ВАЖНО: контент и цвета меняются через админку Google Apps Script.
 * Все локальные значения по умолчанию и технические параметры собраны ниже.
 */
(() => {
  "use strict";

  /* ==========================================================================
     РЕДАКТИРУЕМЫЕ ПАРАМЕТРЫ ПО УМОЛЧАНИЮ
     Используются до ответа API и как безопасный fallback.
     ========================================================================== */
  const EDITABLE_DEFAULTS = Object.freeze({
    price: "800₽",
    game_title: "МЕЛОМАНИЯ",
    address: "ул. Квизалендова, 19",
    image_url: "",
    image_alt: "Иллюстрация ближайшей игры",
    date_iso: "2026-07-13",
    date_day: "13",
    date_month: "ИЮЛЯ",
    time: "13:00",
    button_label: "ИДУ ИГРАТЬ",
    button_url: "https://example.com/",
    share_url: "https://example.com/",
    geo_icon_url: "",
    ticket_background_color: "#F5F6F8",
    price_color: "#7E0AD1",
    title_color: "#7E0AD1",
    address_color: "#7E0AD1",
    date_background_color: "#7E0AD1",
    date_text_color: "#FFFFFF",
    button_background_color: "#7E0AD1",
    button_text_color: "#D9FF62",
    share_background_color: "#7E0AD1",
    share_icon_color: "#D9FF62",
    image_background_color: "transparent",
    texture_url: "",
    texture_opacity: 0.32,
    font_family: "Arial, Helvetica, sans-serif",
    animation_enabled: true,
    animation_duration_ms: 1200,
    updated_at: ""
  });

  /* ==========================================================================
     РЕДАКТИРУЕМЫЕ ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ
     Размеры указаны в vw; max-width только защищает макет на сверхшироких экранах.
     Брейкпоинты совпадают со стандартной логикой Tilda: 1200 / 960 / 640 / 480.
     ========================================================================== */
  const WIDGET_SETTINGS = Object.freeze({
    desktop_width_vw: 82,
    tablet_width_vw: 90,
    mobile_width_vw: 92,
    desktop_max_width_px: 1180,
    mobile_max_width_px: 430,
    mobile_breakpoint_px: 639,
    jsonp_timeout_ms: 9000,
    local_cache_hours: 24,
    custom_element_name: "next-game-ticket"
  });

  /* Точный path из переданного файла «Вектор билета.svg», без упрощения. */
  const TICKET_PATH =
    "M690 0C690 5.52285 694.477 10 700 10C705.523 10 710 5.52285 710 0H920C953.137 2.57704e-06 980 26.8629 980 60V160C957.909 160 940 177.909 940 200C940 222.091 957.909 240 980 240V350C980 377.614 957.614 400 930 400H710C710 394.477 705.523 390 700 390C694.477 390 690 394.477 690 400H60C26.8629 400 1.28869e-06 373.137 0 340V240C22.0914 240 40 222.091 40 200C40 177.909 22.0914 160 0 160V60C0 26.8629 26.8629 8.85858e-07 60 0H690ZM700 350C694.477 350 690 354.477 690 360C690 365.523 694.477 370 700 370C705.523 370 710 365.523 710 360C710 354.477 705.523 350 700 350ZM700 310C694.477 310 690 314.477 690 320C690 325.523 694.477 330 700 330C705.523 330 710 325.523 710 320C710 314.477 705.523 310 700 310ZM700 270C694.477 270 690 274.477 690 280C690 285.523 694.477 290 700 290C705.523 290 710 285.523 710 280C710 274.477 705.523 270 700 270ZM700 230C694.477 230 690 234.477 690 240C690 245.523 694.477 250 700 250C705.523 250 710 245.523 710 240C710 234.477 705.523 230 700 230ZM700 190C694.477 190 690 194.477 690 200C690 205.523 694.477 210 700 210C705.523 210 710 205.523 710 200C710 194.477 705.523 190 700 190ZM700 150C694.477 150 690 154.477 690 160C690 165.523 694.477 170 700 170C705.523 170 710 165.523 710 160C710 154.477 705.523 150 700 150ZM700 110C694.477 110 690 114.477 690 120C690 125.523 694.477 130 700 130C705.523 130 710 125.523 710 120C710 114.477 705.523 110 700 110ZM700 70C694.477 70 690 74.4772 690 80C690 85.5228 694.477 90 700 90C705.523 90 710 85.5228 710 80C710 74.4772 705.523 70 700 70ZM700 30C694.477 30 690 34.4772 690 40C690 45.5228 694.477 50 700 50C705.523 50 710 45.5228 710 40C710 34.4772 705.523 30 700 30Z";
  const MOBILE_TICKET_PATH =
    "M400 690C394.47715 690 390 694.477 390 700C390 705.523 394.47715 710 400 710L400 920C399.999997 953.137 373.1371 980 340 980L240 980C240 957.909 222.091 940 200 940C177.909 940 160 957.909 160 980L50 980C22.386 980 0 957.614 0 930L0 710C5.523 710 10 705.523 10 700C10 694.477 5.523 690 0 690L0 60C0 26.8629 26.863 0.000001 60 0L160 0C160 22.0914 177.909 40 200 40C222.091 40 240 22.0914 240 0L340 0C373.1371 0 399.999999 26.8629 400 60L400 690ZM50 700C50 694.477 45.523 690 40 690C34.477 690 30 694.477 30 700C30 705.523 34.477 710 40 710C45.523 710 50 705.523 50 700ZM90 700C90 694.477 85.523 690 80 690C74.477 690 70 694.477 70 700C70 705.523 74.477 710 80 710C85.523 710 90 705.523 90 700ZM130 700C130 694.477 125.523 690 120 690C114.477 690 110 694.477 110 700C110 705.523 114.477 710 120 710C125.523 710 130 705.523 130 700ZM170 700C170 694.477 165.523 690 160 690C154.477 690 150 694.477 150 700C150 705.523 154.477 710 160 710C165.523 710 170 705.523 170 700ZM210 700C210 694.477 205.523 690 200 690C194.477 690 190 694.477 190 700C190 705.523 194.477 710 200 710C205.523 710 210 705.523 210 700ZM250 700C250 694.477 245.523 690 240 690C234.477 690 230 694.477 230 700C230 705.523 234.477 710 240 710C245.523 710 250 705.523 250 700ZM290 700C290 694.477 285.523 690 280 690C274.477 690 270 694.477 270 700C270 705.523 274.477 710 280 710C285.523 710 290 705.523 290 700ZM330 700C330 694.477 325.5228 690 320 690C314.4772 690 310 694.477 310 700C310 705.523 314.4772 710 320 710C325.5228 710 330 705.523 330 700ZM370 700C370 694.477 365.5228 690 360 690C354.4772 690 350 694.477 350 700C350 705.523 354.4772 710 360 710C365.5228 710 370 705.523 370 700Z";

  const STYLE_TEXT = `
    :host {
      --ticket-desktop-width: ${WIDGET_SETTINGS.desktop_width_vw}vw;
      --ticket-tablet-width: ${WIDGET_SETTINGS.tablet_width_vw}vw;
      --ticket-mobile-width: ${WIDGET_SETTINGS.mobile_width_vw}vw;
      --ticket-desktop-max: ${WIDGET_SETTINGS.desktop_max_width_px}px;
      --ticket-mobile-max: ${WIDGET_SETTINGS.mobile_max_width_px}px;
      --ticket-bg: ${EDITABLE_DEFAULTS.ticket_background_color};
      --price-color: ${EDITABLE_DEFAULTS.price_color};
      --title-color: ${EDITABLE_DEFAULTS.title_color};
      --address-color: ${EDITABLE_DEFAULTS.address_color};
      --date-bg: ${EDITABLE_DEFAULTS.date_background_color};
      --date-text: ${EDITABLE_DEFAULTS.date_text_color};
      --button-bg: ${EDITABLE_DEFAULTS.button_background_color};
      --button-text: ${EDITABLE_DEFAULTS.button_text_color};
      --share-bg: ${EDITABLE_DEFAULTS.share_background_color};
      --share-icon: ${EDITABLE_DEFAULTS.share_icon_color};
      --image-bg: ${EDITABLE_DEFAULTS.image_background_color};
      --texture-opacity: ${EDITABLE_DEFAULTS.texture_opacity};
      --ticket-font: ${EDITABLE_DEFAULTS.font_family};
      --animation-duration: ${EDITABLE_DEFAULTS.animation_duration_ms}ms;
      display: block;
      width: 100%;
      min-width: 0;
      color: var(--title-color);
      font-family: var(--ticket-font);
      contain: layout style;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    .widget {
      position: relative;
      display: grid;
      place-items: center;
      width: 100%;
      padding: 2.5vw 0;
      isolation: isolate;
    }

    .ticket {
      position: relative;
      width: min(var(--ticket-desktop-width), var(--ticket-desktop-max));
      aspect-ratio: 980 / 400;
      container: ticket / inline-size;
      filter: drop-shadow(0 1.4cqw 2.4cqw rgba(20, 8, 32, 0.16));
      perspective: 1500px;
    }

    .ticket__surface {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: 40% 30% 30%;
      grid-template-rows: 100%;
      overflow: hidden;
      background: transparent;
      transform-origin: left center;
      backface-visibility: hidden;
      will-change: transform;
    }

    .ticket__shape {
      position: absolute;
      inset: 0;
      z-index: 0;
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    .ticket__shape--mobile {
      display: none;
    }

    .ticket__shape-fill {
      fill: var(--ticket-bg);
    }

    .ticket__shape image {
      mix-blend-mode: multiply;
      opacity: var(--texture-opacity);
    }

    .ticket__surface > :not(.ticket__shape) {
      position: relative;
      z-index: 1;
    }

    .ticket__info {
      grid-column: 1;
      grid-row: 1;
      display: grid;
      grid-template-rows: 26% 27% 47%;
      min-width: 0;
      min-height: 0;
      padding: 4.6cqw 1.8cqw 4.2cqw 5.4cqw;
    }

    .ticket__price-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 1.5cqw;
      min-width: 0;
    }

    .ticket__price {
      --fit-min: 24;
      --fit-max: 82;
      min-width: 0;
      height: 100%;
      overflow: hidden;
      color: var(--price-color);
      font-size: clamp(32px, 6.3cqw, 82px);
      font-weight: 900;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.055em;
      line-height: 0.9;
      white-space: nowrap;
    }

    .ticket__share {
      position: relative;
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      width: clamp(42px, 5.8cqw, 68px);
      aspect-ratio: 1;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--share-bg);
      color: var(--share-icon);
      box-shadow: none;
      cursor: pointer;
      transition:
        color 180ms ease,
        background-color 180ms ease,
        transform 180ms ease,
        filter 100ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .ticket__share svg {
      width: 48%;
      height: 48%;
      stroke: currentColor;
    }

    .ticket__share:hover {
      background: var(--share-icon);
      color: var(--share-bg);
      transform: translateY(-2px);
    }

    .ticket__share:active {
      background: var(--share-icon);
      color: var(--share-bg);
      filter: saturate(1.55) brightness(0.94);
      transform: translateY(1px) scale(0.97);
    }

    .ticket__share:focus-visible,
    .ticket__cta:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--button-text) 72%, white);
      outline-offset: 4px;
    }

    .ticket__address {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      align-self: center;
      gap: 1.15cqw;
      min-width: 0;
      min-height: 0;
      max-width: 28cqw;
      color: var(--address-color);
      font-style: normal;
    }

    .ticket__geo {
      display: grid;
      place-items: center;
      width: clamp(18px, 2.2cqw, 28px);
      height: clamp(18px, 2.2cqw, 28px);
      color: currentColor;
    }

    .ticket__geo img,
    .ticket__geo svg {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .ticket__geo img[hidden],
    .ticket__geo svg[hidden] {
      display: none;
    }

    .ticket__address-text {
      --fit-min: 12;
      --fit-max: 28;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-size: clamp(14px, 2cqw, 27px);
      font-weight: 800;
      line-height: 1.08;
      text-wrap: pretty;
      white-space: pre-line;
      word-break: normal;
      overflow-wrap: normal;
      hyphens: auto;
    }

    .ticket__title {
      --fit-min: 20;
      --fit-max: 78;
      align-self: end;
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      color: var(--title-color);
      font-size: clamp(34px, 6.4cqw, 78px);
      font-weight: 950;
      letter-spacing: -0.065em;
      line-height: 0.78;
      text-transform: uppercase;
      text-wrap: balance;
      white-space: pre-line;
      word-break: normal;
      overflow-wrap: normal;
      hyphens: auto;
    }

    .is-emergency-wrap {
      overflow-wrap: anywhere !important;
      word-break: normal !important;
    }

    .ticket__art {
      grid-column: 2;
      grid-row: 1;
      display: grid;
      place-items: center;
      min-width: 0;
      min-height: 0;
      margin: 3.2cqw 1.4cqw 3.2cqw 0;
      padding: 10px;
      overflow: hidden;
      border-radius: 2cqw;
      background: var(--image-bg);
    }

    .ticket__art img {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
    }

    .ticket__art-placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      border: 1px dashed color-mix(in srgb, var(--title-color) 30%, transparent);
      border-radius: 1.5cqw;
      color: color-mix(in srgb, var(--title-color) 56%, transparent);
      font-size: clamp(10px, 1.2cqw, 14px);
      font-weight: 800;
      letter-spacing: 0.08em;
      text-align: center;
      text-transform: uppercase;
    }

    .ticket__art.has-image .ticket__art-placeholder {
      display: none;
    }

    .ticket__date {
      grid-column: 3;
      grid-row: 1;
      align-self: start;
      justify-self: center;
      display: grid;
      grid-template-rows: auto 1fr auto;
      align-items: center;
      width: 69%;
      min-width: 0;
      height: 58%;
      margin-top: 0;
      padding: 3.4cqw 1.25cqw 2.6cqw;
      border-radius: 0 0 4.4cqw 4.4cqw;
      background: var(--date-bg);
      color: var(--date-text);
      text-align: center;
      text-transform: uppercase;
    }

    .ticket__time {
      font-size: clamp(18px, 3cqw, 38px);
      font-weight: 900;
      letter-spacing: -0.045em;
      line-height: 1;
    }

    .ticket__day {
      align-self: center;
      font-size: clamp(58px, 11cqw, 132px);
      font-weight: 950;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.1em;
      line-height: 0.74;
    }

    .ticket__month {
      font-size: clamp(18px, 3.4cqw, 40px);
      font-weight: 950;
      letter-spacing: -0.04em;
      line-height: 0.9;
    }

    .ticket__cta {
      grid-column: 3;
      grid-row: 1;
      align-self: end;
      justify-self: center;
      display: inline-grid;
      place-items: center;
      width: 76%;
      min-height: clamp(48px, 6.2cqw, 74px);
      margin-bottom: 4.2cqw;
      padding: 1.2cqw 1.7cqw;
      border: 0;
      border-radius: 999px;
      background: var(--button-bg);
      color: var(--button-text);
      font: inherit;
      font-size: clamp(12px, 1.65cqw, 21px);
      font-weight: 950;
      letter-spacing: -0.025em;
      line-height: 1;
      text-align: center;
      text-decoration: none;
      text-transform: uppercase;
      cursor: pointer;
      transition:
        color 180ms ease,
        background-color 180ms ease,
        transform 180ms ease,
        filter 100ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .ticket__cta:hover {
      background: var(--button-text);
      color: var(--button-bg);
      transform: translateY(-2px);
    }

    .ticket__cta:active {
      background: var(--button-text);
      color: var(--button-bg);
      filter: saturate(1.55) brightness(0.94);
      transform: translateY(1px) scale(0.985);
    }

    .ticket__cta[aria-disabled="true"] {
      pointer-events: none;
      opacity: 0.5;
    }

    .ticket__roller {
      position: absolute;
      top: -2%;
      bottom: -2%;
      left: -1.2cqw;
      z-index: 4;
      width: 2.5cqw;
      border-radius: 999px;
      background:
        linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.12),
          rgba(255, 255, 255, 0.86) 46%,
          rgba(55, 38, 72, 0.20) 100%
        ),
        var(--ticket-bg);
      box-shadow:
        0.55cqw 0 1.1cqw rgba(28, 13, 40, 0.2),
        inset -0.35cqw 0 0.5cqw rgba(18, 8, 27, 0.12);
      opacity: 0;
      pointer-events: none;
      will-change: transform, opacity;
    }

    .ticket:not(.is-revealed) .ticket__surface {
      transform: rotateY(-8deg) scaleX(0.04);
    }

    .ticket.is-revealed .ticket__surface {
      animation: ticket-unroll var(--animation-duration)
        cubic-bezier(0.22, 0.82, 0.24, 1) both;
    }

    .ticket.is-revealed .ticket__roller {
      animation: roller-travel var(--animation-duration)
        cubic-bezier(0.22, 0.82, 0.24, 1) both;
    }

    .ticket.is-revealed .ticket__surface > * {
      animation: content-settle 420ms ease both;
    }

    .ticket.is-revealed .ticket__info { animation-delay: calc(var(--animation-duration) * 0.54); }
    .ticket.is-revealed .ticket__art { animation-delay: calc(var(--animation-duration) * 0.64); }
    .ticket.is-revealed .ticket__date { animation-delay: calc(var(--animation-duration) * 0.74); }
    .ticket.is-revealed .ticket__cta { animation-delay: calc(var(--animation-duration) * 0.84); }

    @keyframes ticket-unroll {
      0% {
        transform: rotateY(-8deg) scaleX(0.04);
      }
      28% {
        transform: rotateY(-4deg) scaleX(0.34);
      }
      58% {
        transform: rotateY(-1.5deg) scaleX(0.69);
      }
      82% {
        transform: rotateY(0deg) scaleX(0.96);
      }
      100% {
        transform: rotateY(0deg) scaleX(1);
      }
    }

    @keyframes roller-travel {
      0% { opacity: 0; transform: translateX(0); }
      8% { opacity: 1; }
      84% { opacity: 1; }
      100% { opacity: 0; transform: translateX(80.8cqw); }
    }

    @keyframes content-settle {
      from { opacity: 0; transform: translateY(0.9cqw); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ticket.no-animation .ticket__surface,
    .ticket.no-animation .ticket__surface > *,
    .ticket.no-animation .ticket__roller {
      animation: none !important;
      opacity: 1;
      transform: none;
    }

    .ticket.no-animation .ticket__roller {
      display: none;
    }

    .ticket__status {
      position: absolute;
      left: 50%;
      bottom: -0.8rem;
      z-index: 10;
      max-width: min(88vw, 360px);
      padding: 0.62rem 0.9rem;
      border-radius: 999px;
      background: #17131B;
      color: #FFFFFF;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 8px);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .ticket__status.is-visible {
      opacity: 1;
      transform: translate(-50%, 0);
    }

    @media (max-width: 1199px) {
      .ticket {
        width: min(var(--ticket-tablet-width), var(--ticket-desktop-max));
      }
    }

    @media (max-width: 959px) {
      .widget {
        padding-block: 3vw;
      }

      .ticket {
        width: 94vw;
      }
    }

    @media (max-width: ${WIDGET_SETTINGS.mobile_breakpoint_px}px) {
      .widget {
        padding-block: 5vw;
      }

      .ticket {
        width: min(var(--ticket-mobile-width), var(--ticket-mobile-max));
        aspect-ratio: 400 / 980;
        filter: drop-shadow(0 4.5cqw 7cqw rgba(20, 8, 32, 0.18));
      }

      .ticket__surface {
        grid-template-columns: 48% 52%;
        grid-template-rows: 42% 29.43% 28.57%;
        transform-origin: top center;
      }

      .ticket__shape--desktop {
        display: none;
      }

      .ticket__shape--mobile {
        display: block;
      }

      .ticket__info {
        grid-column: 1 / -1;
        grid-row: 1;
        grid-template-rows: 28% 27% 45%;
        padding: 14cqw 6cqw 3cqw;
      }

      .ticket__price-row {
        align-items: start;
        gap: 4cqw;
      }

      .ticket__price {
        --fit-min: 28;
        --fit-max: 74;
        font-size: clamp(42px, 16cqw, 74px);
      }

      .ticket__share {
        width: clamp(50px, 16cqw, 70px);
      }

      .ticket__address {
        gap: 3.2cqw;
        max-width: 76cqw;
      }

      .ticket__geo {
        width: clamp(20px, 6cqw, 28px);
        height: clamp(20px, 6cqw, 28px);
      }

      .ticket__address-text {
        --fit-min: 13;
        --fit-max: 25;
        font-size: clamp(16px, 5.6cqw, 25px);
        line-height: 1.06;
      }

      .ticket__title {
        --fit-min: 21;
        --fit-max: 58;
        font-size: clamp(34px, 13.2cqw, 58px);
        line-height: 0.82;
      }

      .ticket__date {
        grid-column: 1;
        grid-row: 2;
        align-self: start;
        justify-self: center;
        width: 72%;
        height: 82%;
        margin-top: 0;
        padding: 7.5cqw 3cqw 5cqw;
        border-radius: 0 0 11cqw 11cqw;
      }

      .ticket__time {
        font-size: clamp(17px, 6.2cqw, 27px);
      }

      .ticket__day {
        font-size: clamp(56px, 21cqw, 92px);
      }

      .ticket__month {
        font-size: clamp(17px, 6.5cqw, 28px);
      }

      .ticket__art {
        grid-column: 2;
        grid-row: 2;
        margin: 0 5cqw 5cqw 0;
        padding: 10px;
        border-radius: 5cqw;
      }

      .ticket__art-placeholder {
        border-radius: 4cqw;
        font-size: clamp(9px, 2.8cqw, 12px);
      }

      .ticket__cta {
        grid-column: 1 / -1;
        grid-row: 3;
        align-self: center;
        width: 74%;
        min-height: clamp(60px, 17cqw, 76px);
        margin: 3cqw 0 0;
        padding: 4cqw 7cqw;
        font-size: clamp(14px, 4.6cqw, 20px);
      }

      .ticket__roller {
        top: -1.5cqw;
        right: -2%;
        bottom: auto;
        left: -2%;
        width: auto;
        height: 4cqw;
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.86) 46%,
            rgba(55, 38, 72, 0.20) 100%
          ),
          var(--ticket-bg);
        box-shadow:
          0 1.2cqw 2.2cqw rgba(28, 13, 40, 0.2),
          inset 0 -0.8cqw 1cqw rgba(18, 8, 27, 0.12);
      }

      .ticket:not(.is-revealed) .ticket__surface {
        transform: rotateX(8deg) scaleY(0.04);
      }

      @keyframes ticket-unroll {
        0% {
          transform: rotateX(8deg) scaleY(0.04);
        }
        28% {
          transform: rotateX(4deg) scaleY(0.34);
        }
        58% {
          transform: rotateX(1.5deg) scaleY(0.69);
        }
        82% {
          transform: rotateX(0deg) scaleY(0.96);
        }
        100% {
          transform: rotateX(0deg) scaleY(1);
        }
      }

      @keyframes roller-travel {
        0% { opacity: 0; transform: translateY(0); }
        8% { opacity: 1; }
        84% { opacity: 1; }
        100% { opacity: 0; transform: translateY(221cqw); }
      }
    }

    @media (max-width: 479px) {
      .ticket {
        width: var(--ticket-mobile-width);
      }

      .ticket__info {
        padding-inline: 5.6cqw;
      }

      .ticket__cta {
        width: 76%;
      }
    }

    @media (max-width: 359px) {
      .ticket {
        width: 94vw;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ticket__surface,
      .ticket__surface > *,
      .ticket__roller,
      .ticket__share,
      .ticket__cta,
      .ticket__status {
        animation: none !important;
        transition-duration: 0.01ms !important;
      }

      .ticket__surface {
        transform: none !important;
      }

      .ticket__roller {
        display: none;
      }
    }
  `;

  const TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML = `
    <style>${STYLE_TEXT}</style>
    <section class="widget" aria-label="Ближайшая игра">
      <div class="ticket" part="ticket">
        <div class="ticket__surface">
          <svg
            class="ticket__shape ticket__shape--desktop"
            viewBox="0 0 980 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="ticket-texture-clip-desktop">
                <path d="${TICKET_PATH}"/>
              </clipPath>
            </defs>
            <path
              class="ticket__shape-fill"
              d="${TICKET_PATH}"
            />
            <image
              data-field="texture"
              width="980"
              height="400"
              preserveAspectRatio="xMidYMid slice"
              clip-path="url(#ticket-texture-clip-desktop)"
              hidden
            />
          </svg>

          <svg
            class="ticket__shape ticket__shape--mobile"
            viewBox="0 0 400 980"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="ticket-texture-clip-mobile">
                <path d="${MOBILE_TICKET_PATH}"/>
              </clipPath>
            </defs>
            <path
              class="ticket__shape-fill"
              d="${MOBILE_TICKET_PATH}"
            />
            <image
              data-field="texture"
              width="400"
              height="980"
              preserveAspectRatio="xMidYMid slice"
              clip-path="url(#ticket-texture-clip-mobile)"
              hidden
            />
          </svg>

          <div class="ticket__info">
            <div class="ticket__price-row">
              <div class="ticket__price" data-field="price"></div>
              <button class="ticket__share" type="button" aria-label="Поделиться игрой">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 16V3M12 3 7.5 7.5M12 3l4.5 4.5" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5 12.5v6A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-6" stroke-width="2.1" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <address class="ticket__address">
              <span class="ticket__geo" aria-hidden="true">
                <img data-field="geo_icon" alt="" hidden>
                <svg data-field="geo_fallback" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 22s7-6.08 7-13A7 7 0 1 0 5 9c0 6.92 7 13 7 13Zm0-9.25A3.25 3.25 0 1 0 12 6.25a3.25 3.25 0 0 0 0 6.5Z" clip-rule="evenodd"/>
                </svg>
              </span>
              <span class="ticket__address-text" data-field="address" lang="ru"></span>
            </address>

            <h2 class="ticket__title" data-field="game_title" lang="ru"></h2>
          </div>

          <div class="ticket__art" data-field="art_frame">
            <img data-field="image" alt="" hidden>
            <span class="ticket__art-placeholder">Изображение<br>игры</span>
          </div>

          <time class="ticket__date" data-field="date">
            <span class="ticket__time" data-field="time"></span>
            <span class="ticket__day" data-field="date_day"></span>
            <span class="ticket__month" data-field="date_month"></span>
          </time>

          <a class="ticket__cta" data-field="button" target="_blank" rel="noopener noreferrer"></a>
        </div>
        <span class="ticket__roller" aria-hidden="true"></span>
      </div>
      <span class="ticket__status" role="status" aria-live="polite"></span>
    </section>
  `;

  const remotePromises = new Map();

  function asText(value, fallback, maxLength = 240) {
    const normalized = String(value ?? "").trim();
    return (normalized || String(fallback ?? "")).slice(0, maxLength);
  }

  function asBoolean(value, fallback) {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === "1" || value === 1) return true;
    if (value === "false" || value === "0" || value === 0) return false;
    return fallback;
  }

  function asNumber(value, fallback, min, max) {
    const normalized = Number(value);
    if (!Number.isFinite(normalized)) return fallback;
    return Math.min(max, Math.max(min, normalized));
  }

  function asColor(value, fallback, allowTransparent = false) {
    const normalized = String(value ?? "").trim();
    if (allowTransparent && normalized.toLowerCase() === "transparent") {
      return "transparent";
    }
    return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
  }

  function safeUrl(value, options = {}) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    try {
      const url = new URL(raw, document.baseURI);
      const isLocalHttp =
        url.protocol === "http:" &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1");
      const isAllowedData =
        options.allowImageData &&
        url.protocol === "data:" &&
        /^data:image\/(?:png|jpeg|webp|gif|svg\+xml);/i.test(raw);

      if (url.protocol === "https:" || isLocalHttp || isAllowedData) {
        return url.href;
      }
    } catch (_) {
      return "";
    }
    return "";
  }

  function normalizeConfig(input = {}) {
    const source = { ...EDITABLE_DEFAULTS, ...input };
    return {
      price: asText(source.price, EDITABLE_DEFAULTS.price, 40),
      game_title: asText(source.game_title, EDITABLE_DEFAULTS.game_title, 100),
      address: asText(source.address, EDITABLE_DEFAULTS.address, 180),
      image_url: safeUrl(source.image_url, { allowImageData: true }),
      image_alt: asText(source.image_alt, EDITABLE_DEFAULTS.image_alt, 180),
      date_iso: /^\d{4}-\d{2}-\d{2}$/.test(String(source.date_iso || ""))
        ? String(source.date_iso)
        : EDITABLE_DEFAULTS.date_iso,
      date_day: asText(source.date_day, EDITABLE_DEFAULTS.date_day, 2),
      date_month: asText(source.date_month, EDITABLE_DEFAULTS.date_month, 16).toUpperCase(),
      time: asText(source.time, EDITABLE_DEFAULTS.time, 10),
      button_label: asText(source.button_label, EDITABLE_DEFAULTS.button_label, 40),
      button_url: safeUrl(source.button_url),
      share_url: safeUrl(source.share_url),
      geo_icon_url: safeUrl(source.geo_icon_url, { allowImageData: true }),
      ticket_background_color: asColor(
        source.ticket_background_color,
        EDITABLE_DEFAULTS.ticket_background_color
      ),
      price_color: asColor(source.price_color, EDITABLE_DEFAULTS.price_color),
      title_color: asColor(source.title_color, EDITABLE_DEFAULTS.title_color),
      address_color: asColor(source.address_color, EDITABLE_DEFAULTS.address_color),
      date_background_color: asColor(
        source.date_background_color,
        EDITABLE_DEFAULTS.date_background_color
      ),
      date_text_color: asColor(source.date_text_color, EDITABLE_DEFAULTS.date_text_color),
      button_background_color: asColor(
        source.button_background_color,
        EDITABLE_DEFAULTS.button_background_color
      ),
      button_text_color: asColor(
        source.button_text_color,
        EDITABLE_DEFAULTS.button_text_color
      ),
      share_background_color: asColor(
        source.share_background_color,
        EDITABLE_DEFAULTS.share_background_color
      ),
      share_icon_color: asColor(
        source.share_icon_color,
        EDITABLE_DEFAULTS.share_icon_color
      ),
      image_background_color: asColor(
        source.image_background_color,
        EDITABLE_DEFAULTS.image_background_color,
        true
      ),
      texture_url: safeUrl(source.texture_url, { allowImageData: true }),
      texture_opacity: asNumber(
        source.texture_opacity,
        EDITABLE_DEFAULTS.texture_opacity,
        0,
        1
      ),
      font_family: asText(source.font_family, EDITABLE_DEFAULTS.font_family, 160),
      animation_enabled: asBoolean(
        source.animation_enabled,
        EDITABLE_DEFAULTS.animation_enabled
      ),
      animation_duration_ms: asNumber(
        source.animation_duration_ms,
        EDITABLE_DEFAULTS.animation_duration_ms,
        400,
        4000
      ),
      updated_at: asText(source.updated_at, "", 60)
    };
  }

  function cacheKey(endpoint) {
    let hash = 2166136261;
    for (let index = 0; index < endpoint.length; index += 1) {
      hash ^= endpoint.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `next-game-ticket:${(hash >>> 0).toString(16)}`;
  }

  function readCache(endpoint) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey(endpoint)) || "null");
      if (!cached || !cached.savedAt || !cached.data) return null;
      const ageMs = Date.now() - Number(cached.savedAt);
      const maxAgeMs = WIDGET_SETTINGS.local_cache_hours * 60 * 60 * 1000;
      return ageMs <= maxAgeMs ? normalizeConfig(cached.data) : null;
    } catch (_) {
      return null;
    }
  }

  function writeCache(endpoint, data) {
    try {
      localStorage.setItem(
        cacheKey(endpoint),
        JSON.stringify({ savedAt: Date.now(), data })
      );
    } catch (_) {
      // localStorage может быть отключен — виджет продолжит работать без кэша.
    }
  }

  function loadJsonp(endpoint) {
    if (remotePromises.has(endpoint)) return remotePromises.get(endpoint);

    const request = new Promise((resolve, reject) => {
      const callbackName =
        `__nextGameTicket_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const separator = endpoint.includes("?") ? "&" : "?";
      let settled = false;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        script.remove();
        try {
          delete window[callbackName];
        } catch (_) {
          window[callbackName] = undefined;
        }
      };

      const finish = (handler, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        handler(value);
      };

      window[callbackName] = (payload) => {
        if (!payload || payload.ok !== true || typeof payload.data !== "object") {
          finish(reject, new Error("Некорректный ответ API"));
          return;
        }
        finish(resolve, normalizeConfig(payload.data));
      };

      script.async = true;
      script.referrerPolicy = "strict-origin-when-cross-origin";
      script.src =
        `${endpoint}${separator}api=ticket` +
        `&callback=${encodeURIComponent(callbackName)}` +
        `&_=${Date.now()}`;
      script.onerror = () => finish(reject, new Error("API недоступен"));
      document.head.appendChild(script);

      const timeoutId = window.setTimeout(
        () => finish(reject, new Error("Превышено время ожидания API")),
        WIDGET_SETTINGS.jsonp_timeout_ms
      );
    });

    remotePromises.set(endpoint, request);
    request.catch(() => remotePromises.delete(endpoint));
    return request;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText =
      "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Копирование не поддерживается");
  }

  class NextGameTicket extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      this.config = normalizeConfig();
      this.resizeObserver = null;
      this.intersectionObserver = null;
      this.statusTimer = null;
      this.boundShare = this.handleShare.bind(this);
      this.boundImageError = this.handleImageError.bind(this);
      this.boundImageLoad = this.handleImageLoad.bind(this);
    }

    connectedCallback() {
      this.shareButton = this.shadowRoot.querySelector(".ticket__share");
      this.image = this.shadowRoot.querySelector('[data-field="image"]');
      this.ticket = this.shadowRoot.querySelector(".ticket");
      this.shareButton.addEventListener("click", this.boundShare);
      this.image.addEventListener("error", this.boundImageError);
      this.image.addEventListener("load", this.boundImageLoad);

      const globalOptions = window.NEXT_GAME_TICKET_CONFIG || {};
      const initial = normalizeConfig(globalOptions.fallback || {});
      this.applyConfig(initial);
      this.setupResizeHandling();
      this.setupReveal();

      const endpoint = safeUrl(
        this.getAttribute("endpoint") || globalOptions.endpoint || ""
      );
      if (endpoint) this.loadRemoteConfig(endpoint);
    }

    disconnectedCallback() {
      this.shareButton?.removeEventListener("click", this.boundShare);
      this.image?.removeEventListener("error", this.boundImageError);
      this.image?.removeEventListener("load", this.boundImageLoad);
      this.resizeObserver?.disconnect();
      this.intersectionObserver?.disconnect();
      window.clearTimeout(this.statusTimer);
    }

    setupResizeHandling() {
      const fit = () => this.fitDynamicText();
      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(() => {
          window.requestAnimationFrame(fit);
        });
        this.resizeObserver.observe(this.ticket);
      } else {
        window.addEventListener("resize", fit, { passive: true });
      }

      window.requestAnimationFrame(fit);
      if (document.fonts?.ready) {
        document.fonts.ready.then(fit).catch(() => {});
      }
    }

    setupReveal() {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!this.config.animation_enabled || reducedMotion) {
        this.ticket.classList.add("is-revealed", "no-animation");
        return;
      }

      if (!("IntersectionObserver" in window)) {
        this.ticket.classList.add("is-revealed");
        return;
      }

      this.intersectionObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.ticket.classList.add("is-revealed");
          observer.disconnect();
        },
        { threshold: 0.18, rootMargin: "0px 0px -5% 0px" }
      );
      this.intersectionObserver.observe(this);
    }

    async loadRemoteConfig(endpoint) {
      const cached = readCache(endpoint);
      if (cached) this.applyConfig(cached);

      try {
        const remote = await loadJsonp(endpoint);
        writeCache(endpoint, remote);
        this.applyConfig(remote);
        this.dispatchEvent(
          new CustomEvent("ticket-data-ready", {
            bubbles: true,
            detail: { updatedAt: remote.updated_at || null }
          })
        );
      } catch (error) {
        this.dispatchEvent(
          new CustomEvent("ticket-data-error", {
            bubbles: true,
            detail: { message: error.message }
          })
        );
      }
    }

    applyConfig(input) {
      this.config = normalizeConfig(input);
      const root = this.shadowRoot;

      root.querySelector('[data-field="price"]').textContent = this.config.price;
      root.querySelector('[data-field="game_title"]').textContent = this.config.game_title;
      root.querySelector('[data-field="address"]').textContent = this.config.address;
      root.querySelector('[data-field="time"]').textContent = this.config.time;
      root.querySelector('[data-field="date_day"]').textContent = this.config.date_day;
      root.querySelector('[data-field="date_month"]').textContent = this.config.date_month;

      const date = root.querySelector('[data-field="date"]');
      date.dateTime = `${this.config.date_iso}T${this.config.time || "00:00"}`;
      date.setAttribute(
        "aria-label",
        `${this.config.date_day} ${this.config.date_month}, ${this.config.time}`
      );

      const button = root.querySelector('[data-field="button"]');
      button.textContent = this.config.button_label;
      if (this.config.button_url) {
        button.href = this.config.button_url;
        button.removeAttribute("aria-disabled");
      } else {
        button.removeAttribute("href");
        button.setAttribute("aria-disabled", "true");
      }

      const geoImage = root.querySelector('[data-field="geo_icon"]');
      const geoFallback = root.querySelector('[data-field="geo_fallback"]');
      if (this.config.geo_icon_url) {
        geoImage.src = this.config.geo_icon_url;
        geoImage.hidden = false;
        geoFallback.hidden = true;
      } else {
        geoImage.removeAttribute("src");
        geoImage.hidden = true;
        geoFallback.hidden = false;
      }

      if (this.config.image_url) {
        this.image.alt = this.config.image_alt;
        if (this.image.src !== this.config.image_url) {
          this.image.hidden = true;
          this.image.src = this.config.image_url;
        }
      } else {
        this.handleImageError();
      }

      root.querySelectorAll('[data-field="texture"]').forEach((texture) => {
        if (this.config.texture_url) {
          texture.setAttribute("href", this.config.texture_url);
          texture.hidden = false;
        } else {
          texture.removeAttribute("href");
          texture.hidden = true;
        }
      });

      const styles = this.style;
      styles.setProperty("--ticket-bg", this.config.ticket_background_color);
      styles.setProperty("--price-color", this.config.price_color);
      styles.setProperty("--title-color", this.config.title_color);
      styles.setProperty("--address-color", this.config.address_color);
      styles.setProperty("--date-bg", this.config.date_background_color);
      styles.setProperty("--date-text", this.config.date_text_color);
      styles.setProperty("--button-bg", this.config.button_background_color);
      styles.setProperty("--button-text", this.config.button_text_color);
      styles.setProperty("--share-bg", this.config.share_background_color);
      styles.setProperty("--share-icon", this.config.share_icon_color);
      styles.setProperty("--image-bg", this.config.image_background_color);
      styles.setProperty("--texture-opacity", String(this.config.texture_opacity));
      styles.setProperty("--ticket-font", this.config.font_family);
      styles.setProperty(
        "--animation-duration",
        `${this.config.animation_duration_ms}ms`
      );

      if (this.ticket) {
        this.ticket.classList.toggle("no-animation", !this.config.animation_enabled);
        if (!this.config.animation_enabled) this.ticket.classList.add("is-revealed");
      }

      window.requestAnimationFrame(() => this.fitDynamicText());
    }

    handleImageLoad() {
      const frame = this.shadowRoot.querySelector('[data-field="art_frame"]');
      this.image.hidden = false;
      frame.classList.add("has-image");
    }

    handleImageError() {
      const frame = this.shadowRoot.querySelector('[data-field="art_frame"]');
      this.image?.removeAttribute("src");
      if (this.image) {
        this.image.hidden = true;
        this.image.alt = "";
      }
      frame?.classList.remove("has-image");
    }

    fitDynamicText() {
      if (!this.isConnected) return;
      [
        this.shadowRoot.querySelector('[data-field="game_title"]'),
        this.shadowRoot.querySelector('[data-field="address"]'),
        this.shadowRoot.querySelector('[data-field="price"]')
      ].forEach((element) => this.fitElement(element));
    }

    fitElement(element) {
      if (!element || element.clientWidth < 1 || element.clientHeight < 1) return;
      const computed = getComputedStyle(element);
      const minSize = Number.parseFloat(computed.getPropertyValue("--fit-min")) || 12;
      const maxSize = Number.parseFloat(computed.getPropertyValue("--fit-max")) || 72;
      const fits = () =>
        element.scrollWidth <= element.clientWidth + 1 &&
        element.scrollHeight <= element.clientHeight + 1;

      element.classList.remove("is-emergency-wrap");
      element.style.fontSize = `${maxSize}px`;

      let low = minSize;
      let high = maxSize;
      for (let iteration = 0; iteration < 10; iteration += 1) {
        const middle = (low + high) / 2;
        element.style.fontSize = `${middle}px`;
        if (fits()) low = middle;
        else high = middle;
      }

      element.style.fontSize = `${Math.max(minSize, Math.floor(low * 10) / 10)}px`;
      if (!fits()) {
        element.classList.add("is-emergency-wrap");
        element.style.fontSize = `${minSize}px`;
      }
    }

    async handleShare() {
      const url = this.config.share_url || this.config.button_url || window.location.href;
      const shareData = {
        title: this.config.game_title,
        text: `${this.config.game_title} — ${this.config.date_day} ${this.config.date_month}, ${this.config.time}`,
        url
      };
      const isMobileLike =
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;

      try {
        const canNativeShare =
          isMobileLike &&
          typeof navigator.share === "function" &&
          (typeof navigator.canShare !== "function" || navigator.canShare(shareData));

        if (canNativeShare) {
          await navigator.share(shareData);
          return;
        }

        await copyText(url);
        this.showStatus("Ссылка скопирована");
      } catch (error) {
        if (error?.name === "AbortError") return;
        try {
          await copyText(url);
          this.showStatus("Ссылка скопирована");
        } catch (_) {
          this.showStatus("Не удалось скопировать ссылку");
        }
      }
    }

    showStatus(message) {
      const status = this.shadowRoot.querySelector(".ticket__status");
      status.textContent = message;
      status.classList.add("is-visible");
      window.clearTimeout(this.statusTimer);
      this.statusTimer = window.setTimeout(
        () => status.classList.remove("is-visible"),
        2200
      );
    }
  }

  if (!customElements.get(WIDGET_SETTINGS.custom_element_name)) {
    customElements.define(WIDGET_SETTINGS.custom_element_name, NextGameTicket);
  }
})();

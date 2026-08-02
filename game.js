const PRODUCTS = [
  { id: "apple", name: "りんご", emoji: "🍎", cost: 120, reference: 210, popularity: 1.10, maxQty: 5 },
  { id: "orange", name: "みかん", emoji: "🍊", cost: 75, reference: 140, popularity: 1.18, maxQty: 6 },
  { id: "banana", name: "バナナ", emoji: "🍌", cost: 95, reference: 180, popularity: 1.12, maxQty: 4 },
  { id: "strawberry", name: "いちご", emoji: "🍓", cost: 280, reference: 480, popularity: 0.95, maxQty: 3 },
  { id: "cherry", name: "さくらんぼ", emoji: "🍒", cost: 350, reference: 620, popularity: 0.75, maxQty: 2 },
  { id: "melon", name: "メロン", emoji: "🍈", cost: 900, reference: 1600, popularity: 0.38, maxQty: 1 },
  { id: "grape", name: "巨峰", emoji: "🍇", cost: 1400, reference: 2400, popularity: 0.30, maxQty: 1 }
];

const EVENTS = [
  {
    title: "平穏な一日",
    text: "来店客数・需要ともに標準的です。",
    customerMultiplier: 1,
    demand: {}
  },
  {
    title: "暑い日",
    text: "さっぱりした果物が人気。みかん・バナナ・巨峰の需要が上がります。",
    customerMultiplier: 1.12,
    demand: { orange: 1.65, banana: 1.4, grape: 1.65 }
  },
  {
    title: "雨の日",
    text: "人通りが少なく、来店客数が大きく減りそうです。",
    customerMultiplier: 0.68,
    demand: {}
  },
  {
    title: "テレビで高級果物特集",
    text: "メロンと巨峰が話題です。贈答品や高級果物を探す客も増えます。",
    customerMultiplier: 1.12,
    budgetMultiplier: 1.25,
    customerTypeBoost: { "贈答品を探す客": 5, "高級品好きの客": 5, "飲食店の人": 2 },
    demand: { melon: 4.2, grape: 4.8 }
  },
  {
    title: "近所で運動会",
    text: "家族連れが増え、手頃な果物を複数買う人が増えそうです。",
    customerMultiplier: 1.4,
    customerTypeBoost: { "親子客": 3 },
    demand: { apple: 1.6, orange: 1.75, banana: 1.8 }
  },
  {
    title: "給料日後の週末",
    text: "客単価が上がり、高価格の商品も売れやすくなります。",
    customerMultiplier: 1.22,
    budgetMultiplier: 1.35,
    customerTypeBoost: { "贈答品を探す客": 2, "高級品好きの客": 2 },
    demand: { strawberry: 1.5, cherry: 1.65, melon: 1.9, grape: 2.0 }
  },
  {
    title: "競合店の特売",
    text: "価格に敏感なお客さんが増えています。割高な商品は強く敬遠されます。",
    customerMultiplier: 1.0,
    priceSensitivity: 1.55,
    demand: {}
  }
];

const CUSTOMER_TYPES = [
  { emoji: "🧑", name: "会社員", budget: [700, 3000], sensitivity: [0.65, 1.1], premiumBoost: 1.0, weight: 5 },
  { emoji: "👩", name: "買い物客", budget: [900, 4000], sensitivity: [0.75, 1.25], premiumBoost: 1.05, weight: 5 },
  { emoji: "👨", name: "会社員", budget: [700, 3400], sensitivity: [0.65, 1.1], premiumBoost: 1.0, weight: 5 },
  { emoji: "🧓", name: "近所の人", budget: [500, 2400], sensitivity: [0.8, 1.3], premiumBoost: 0.95, weight: 4 },
  { emoji: "👩‍👧", name: "親子客", budget: [1200, 5200], sensitivity: [0.7, 1.1], premiumBoost: 1.15, weight: 4 },
  { emoji: "🧑‍🎓", name: "学生", budget: [350, 1500], sensitivity: [1.05, 1.55], premiumBoost: 0.65, weight: 4 },
  { emoji: "👨‍🍳", name: "飲食店の人", budget: [2200, 8000], sensitivity: [0.5, 0.9], premiumBoost: 1.55, weight: 2 },
  { emoji: "🎁", name: "贈答品を探す客", budget: [3000, 9000], sensitivity: [0.45, 0.85], premiumBoost: 2.5, weight: 1 },
  { emoji: "🕴️", name: "高級品好きの客", budget: [2500, 7500], sensitivity: [0.45, 0.8], premiumBoost: 2.0, weight: 1 }
];

const FIXED_COSTS = {
  rent: 3500,
  utilities: 1000,
  labor: 3000
};

const state = {
  day: 1,
  cash: 100000,
  phase: "setup",
  event: EVENTS[0],
  inventory: {},
  prices: {},
  purchased: {},
  daySales: 0,
  dayCostOfGoods: 0,
  customers: 0,
  unitsSold: 0,
  dayStartCash: 100000,
  currentMinute: 0,
  timer: null,
  customerTimer: null,
  histories: [],
  productTotals: {},
  previousSetup: {}
};

const yen = value => `${Math.round(value).toLocaleString("ja-JP")}円`;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));

const refs = {
  dayLabel: document.getElementById("dayLabel"),
  cashLabel: document.getElementById("cashLabel"),
  phaseLabel: document.getElementById("phaseLabel"),
  forecastTitle: document.getElementById("forecastTitle"),
  forecastText: document.getElementById("forecastText"),
  fixedCostLabel: document.getElementById("fixedCostLabel"),
  purchaseTotalLabel: document.getElementById("purchaseTotalLabel"),
  cashAfterPurchaseLabel: document.getElementById("cashAfterPurchaseLabel"),
  productSetupBody: document.getElementById("productSetupBody"),
  setupMessage: document.getElementById("setupMessage"),
  openShopButton: document.getElementById("openShopButton"),
  setupPanel: document.getElementById("setupPanel"),
  shopPanel: document.getElementById("shopPanel"),
  clockLabel: document.getElementById("clockLabel"),
  timeProgress: document.getElementById("timeProgress"),
  salesLabel: document.getElementById("salesLabel"),
  customerCountLabel: document.getElementById("customerCountLabel"),
  unitsSoldLabel: document.getElementById("unitsSoldLabel"),
  shelves: document.getElementById("shelves"),
  inventoryGrid: document.getElementById("inventoryGrid"),
  salesLog: document.getElementById("salesLog"),
  customerLayer: document.getElementById("customerLayer"),
  dailyModal: document.getElementById("dailyModal"),
  dailyTitle: document.getElementById("dailyTitle"),
  dailyPlStatement: document.getElementById("dailyPlStatement"),
  dailyMetrics: document.getElementById("dailyMetrics"),
  dailyProductBody: document.getElementById("dailyProductBody"),
  dailyComment: document.getElementById("dailyComment"),
  nextDayButton: document.getElementById("nextDayButton"),
  finalModal: document.getElementById("finalModal"),
  finalTitle: document.getElementById("finalTitle"),
  finalPlHeading: document.getElementById("finalPlHeading"),
  finalPlStatement: document.getElementById("finalPlStatement"),
  finalMetrics: document.getElementById("finalMetrics"),
  finalProductBody: document.getElementById("finalProductBody"),
  finalAnalysis: document.getElementById("finalAnalysis"),
  restartButton: document.getElementById("restartButton")
};

function initializeProductTotals() {
  PRODUCTS.forEach(product => {
    state.productTotals[product.id] = {
      sold: 0,
      sales: 0,
      cost: 0,
      wasteCost: 0
    };
  });
}

function chooseEvent() {
  if (state.day === 1) return EVENTS[0];
  const pool = EVENTS.filter((_, index) => index !== 0);
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderSetup() {
  state.phase = "setup";
  state.event = chooseEvent();
  state.inventory = {};
  state.prices = {};
  state.purchased = {};
  state.daySales = 0;
  state.dayCostOfGoods = 0;
  state.customers = 0;
  state.unitsSold = 0;
  state.currentMinute = 0;
  state.dayStartCash = state.cash;

  refs.dayLabel.textContent = `${state.day} / 7日目`;
  refs.cashLabel.textContent = yen(state.cash);
  refs.phaseLabel.textContent = "営業準備";
  refs.forecastTitle.textContent = state.event.title;
  refs.forecastText.textContent = state.event.text;
  refs.fixedCostLabel.textContent = yen(Object.values(FIXED_COSTS).reduce((a, b) => a + b, 0));
  refs.setupPanel.classList.remove("hidden-phase");
  refs.shopPanel.classList.remove("active");
  refs.productSetupBody.innerHTML = "";

  const initialQuantities = {
    apple: 10,
    orange: 10,
    banana: 10,
    strawberry: 10,
    cherry: 10,
    melon: 10,
    grape: 10
  };

  PRODUCTS.forEach(product => {
    // 初期値は全商品10個。安価な商品は売り切れやすく、高級品は売れ残りやすい。
    const defaultQty = initialQuantities[product.id];
    const previous = state.previousSetup[product.id];
    const suggestedQty = previous ? previous.qty : defaultQty;
    const suggestedPrice = previous ? previous.price : product.reference;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="product-name">
          <span class="product-emoji">${product.emoji}</span>
          <span>${product.name}</span>
        </div>
      </td>
      <td>${yen(product.cost)}</td>
      <td>${yen(product.reference)}</td>
      <td><input class="qty-input" data-id="${product.id}" type="number" min="0" max="999" step="1" value="${suggestedQty}"></td>
      <td><input class="price-input" data-id="${product.id}" type="number" min="1" max="99999" step="10" value="${suggestedPrice}"></td>
      <td id="subtotal-${product.id}">${yen(product.cost * suggestedQty)}</td>
    `;
    refs.productSetupBody.appendChild(row);
  });

  document.querySelectorAll(".qty-input, .price-input").forEach(input => {
    input.addEventListener("input", updateSetupTotals);
  });

  updateSetupTotals();
}

function updateSetupTotals() {
  let total = 0;
  let valid = true;

  PRODUCTS.forEach(product => {
    const qtyInput = document.querySelector(`.qty-input[data-id="${product.id}"]`);
    const priceInput = document.querySelector(`.price-input[data-id="${product.id}"]`);
    const qty = Math.max(0, Number(qtyInput.value) || 0);
    const price = Math.max(1, Number(priceInput.value) || 0);
    const subtotal = qty * product.cost;
    total += subtotal;
    document.getElementById(`subtotal-${product.id}`).textContent = yen(subtotal);
    if (!Number.isInteger(qty) || price < 1) valid = false;
  });

  refs.purchaseTotalLabel.textContent = yen(total);
  refs.cashAfterPurchaseLabel.textContent = yen(state.cash - total);

  if (!valid) {
    refs.setupMessage.textContent = "仕入数は整数、販売価格は1円以上にしてください。";
    refs.openShopButton.disabled = true;
  } else if (total > state.cash) {
    refs.setupMessage.textContent = `資金が${yen(total - state.cash)}不足しています。仕入数を減らしてください。`;
    refs.openShopButton.disabled = true;
  } else if (total === 0) {
    refs.setupMessage.textContent = "商品を1つ以上仕入れてください。";
    refs.openShopButton.disabled = true;
  } else {
    refs.setupMessage.textContent = "仕入内容を確認して、開店してください。";
    refs.openShopButton.disabled = false;
  }
}

function openShop() {
  let purchaseTotal = 0;

  PRODUCTS.forEach(product => {
    const qty = Math.max(0, parseInt(document.querySelector(`.qty-input[data-id="${product.id}"]`).value, 10) || 0);
    const price = Math.max(1, parseInt(document.querySelector(`.price-input[data-id="${product.id}"]`).value, 10) || 1);

    state.inventory[product.id] = qty;
    state.purchased[product.id] = qty;
    state.prices[product.id] = price;
    state.previousSetup[product.id] = { qty, price };
    purchaseTotal += qty * product.cost;
  });

  if (purchaseTotal > state.cash || purchaseTotal <= 0) return;

  state.cash -= purchaseTotal;
  state.phase = "open";
  refs.cashLabel.textContent = yen(state.cash);
  refs.phaseLabel.textContent = "営業中";
  refs.setupPanel.classList.add("hidden-phase");
  refs.shopPanel.classList.add("active");
  refs.salesLog.innerHTML = "";
  refs.customerLayer.innerHTML = "";
  refs.inventoryGrid.innerHTML = "";

  renderShelves();
  updateLiveDisplay();
  addLog("10:00　開店しました。", false);
  startBusinessDay();
}

function renderShelves() {
  refs.shelves.innerHTML = "";
  PRODUCTS.forEach(product => {
    const stock = state.inventory[product.id] || 0;
    if (stock <= 0) return;

    const shelf = document.createElement("div");
    shelf.className = "shelf";
    shelf.innerHTML = `
      <div class="fruit">${product.emoji.repeat(Math.min(3, stock))}</div>
      <span>${product.name} ${yen(state.prices[product.id])}</span>
    `;
    refs.shelves.appendChild(shelf);
  });
}

function updateLiveDisplay() {
  refs.clockLabel.textContent = formatTime(state.currentMinute);
  refs.timeProgress.style.width = `${(state.currentMinute / 480) * 100}%`;
  refs.salesLabel.textContent = yen(state.daySales);
  refs.customerCountLabel.textContent = `${state.customers}人`;
  refs.unitsSoldLabel.textContent = `${state.unitsSold}点`;
  refs.cashLabel.textContent = yen(state.cash);
  PRODUCTS.forEach(product => {
    const purchased = state.purchased[product.id] || 0;
    if (purchased <= 0) {
      document.getElementById(`inventory-${product.id}`)?.remove();
      return;
    }

    const remaining = state.inventory[product.id] || 0;
    const sold = purchased - remaining;
    const remainingRate = clamp((remaining / purchased) * 100, 0, 100);
    let item = document.getElementById(`inventory-${product.id}`);

    if (!item) {
      item = document.createElement("div");
      item.id = `inventory-${product.id}`;
      item.className = "inventory-item";
      item.innerHTML = `
        <div class="icon">${product.emoji}</div>
        <div class="inventory-details">
          <div class="inventory-labels">
            <strong>${product.name}</strong>
            <small data-role="sold"></small>
          </div>
          <div class="inventory-bar" role="progressbar" aria-label="${product.name}の残り在庫" aria-valuemin="0" aria-valuemax="${purchased}">
            <div class="inventory-bar-fill" data-role="bar"></div>
          </div>
        </div>
        <strong class="inventory-count" data-role="remaining"></strong>
      `;
      refs.inventoryGrid.appendChild(item);
    }

    item.classList.toggle("sold-out", remaining === 0);
    item.querySelector('[data-role="sold"]').textContent = `販売 ${sold} / 仕入 ${purchased}`;
    item.querySelector('[data-role="bar"]').style.width = `${remainingRate}%`;
    const remainingLabel = item.querySelector('[data-role="remaining"]');
    remainingLabel.textContent = remaining === 0 ? "売り切れ" : `残 ${remaining}`;
    remainingLabel.classList.toggle("sold-out-label", remaining === 0);
    const progress = item.querySelector('[role="progressbar"]');
    progress.setAttribute("aria-valuenow", remaining);
    progress.setAttribute("aria-valuetext", `${purchased}個中${remaining}個`);
  });
}

function startBusinessDay() {
  clearInterval(state.timer);
  clearInterval(state.customerTimer);

  state.timer = setInterval(() => {
    state.currentMinute += 10;
    updateLiveDisplay();

    if (state.currentMinute >= 480) {
      closeShop();
    }
  }, 1000);

  scheduleNextCustomer();
}

function scheduleNextCustomer() {
  if (state.phase !== "open") return;

  const baseDelay = randomBetween(1050, 2400);
  const delay = baseDelay / ((state.event.customerMultiplier || 1) * 1.2);

  state.customerTimer = setTimeout(() => {
    if (state.phase === "open") {
      processCustomer();
      scheduleNextCustomer();
    }
  }, delay);
}

function processCustomer() {
  state.customers += 1;

  const typeBoosts = state.event.customerTypeBoost || {};
  const weightedTypes = CUSTOMER_TYPES.map(item => ({
    ...item,
    eventWeight: (item.weight || 1) * (typeBoosts[item.name] || 1)
  }));
  const totalWeight = weightedTypes.reduce((sum, item) => sum + item.eventWeight, 0);
  let roll = Math.random() * totalWeight;
  const type = weightedTypes.find(item => {
    roll -= item.eventWeight;
    return roll <= 0;
  }) || weightedTypes[0];
  const budgetMultiplier = state.event.budgetMultiplier || 1;
  const customer = {
    ...type,
    budget: Math.round(randomInt(type.budget[0], type.budget[1]) * budgetMultiplier),
    sensitivity: randomBetween(type.sensitivity[0], type.sensitivity[1])
  };

  const cart = decidePurchases(customer);
  const total = cart.reduce((sum, line) => sum + line.qty * state.prices[line.product.id], 0);

  if (cart.length > 0 && total > 0) {
    cart.forEach(line => {
      const subtotal = line.qty * state.prices[line.product.id];
      const cost = line.qty * line.product.cost;
      state.inventory[line.product.id] -= line.qty;
      state.daySales += subtotal;
      state.dayCostOfGoods += cost;
      state.unitsSold += line.qty;
      state.cash += subtotal;
      state.productTotals[line.product.id].sold += line.qty;
      state.productTotals[line.product.id].sales += subtotal;
      state.productTotals[line.product.id].cost += cost;
    });

    const summary = cart.map(line => `${line.product.name}${line.qty > 1 ? `×${line.qty}` : ""}`).join("・");
    addLog(`${formatTime(state.currentMinute)}　${customer.name}が${summary}を購入　+${yen(total)}`, false);
    animateCustomer(customer.emoji, `${summary} ${yen(total)}`);
  } else {
    addLog(`${formatTime(state.currentMinute)}　${customer.name}は何も買わずに退店`, true);
    animateCustomer(customer.emoji, "今回は見送り");
  }

  updateLiveDisplay();
}

function decidePurchases(customer) {
  const options = [];

  PRODUCTS.forEach(product => {
    const stock = state.inventory[product.id] || 0;
    if (stock <= 0) return;

    const price = state.prices[product.id];
    const priceRatio = price / product.reference;
    const eventPriceSensitivity = state.event.priceSensitivity || 1;
    let priceEffect;

    // 参考価格より安い商品は、値下げ幅が購買確率にはっきり反映される。
    // 参考価格を超える場合も、120％程度までは急激に売れなくならない。
    if (priceRatio <= 1) {
      priceEffect = 1 + (1 - priceRatio) * 2.4;
    } else {
      priceEffect = Math.exp(-(priceRatio - 1) * 1.65 * customer.sensitivity * eventPriceSensitivity);
    }

    const eventDemand = state.event.demand[product.id] || 1;
    const isPremium = ["cherry", "melon", "grape"].includes(product.id);
    const premiumDemand = isPremium ? (customer.premiumBoost || 1) : 1;
    const budgetFit = price <= customer.budget ? 1 : 0;
    const score = product.popularity * priceEffect * eventDemand * premiumDemand * budgetFit * randomBetween(0.85, 1.18);

    options.push({ product, score });
  });

  options.sort((a, b) => b.score - a.score);

  const desiredKindsRoll = Math.random();
  const desiredKinds = desiredKindsRoll < 0.42 ? 1 : desiredKindsRoll < 0.82 ? 2 : 3;
  const cart = [];
  let remainingBudget = customer.budget;

  for (const option of options.slice(0, 5)) {
    if (cart.length >= desiredKinds) break;

    const { product, score } = option;
    const price = state.prices[product.id];
    const purchaseChance = clamp(score * 0.78, 0.08, 0.97);

    if (price <= remainingBudget && Math.random() < purchaseChance) {
      const affordableQty = Math.floor(remainingBudget / price);
      const maxQty = Math.min(product.maxQty, affordableQty, state.inventory[product.id]);
      if (maxQty <= 0) continue;

      let qty = 1;
      if (maxQty > 1 && product.cost < 400) {
        qty = Math.min(maxQty, Math.random() < 0.46 ? randomInt(2, maxQty) : 1);
      }

      cart.push({ product, qty });
      remainingBudget -= qty * price;
    }
  }

  return cart;
}

function animateCustomer(emoji, bubbleText) {
  const element = document.createElement("div");
  element.className = "customer";
  element.innerHTML = `${emoji}<span class="basket">🧺</span><span class="bubble">${bubbleText}</span>`;
  refs.customerLayer.appendChild(element);
  setTimeout(() => element.remove(), 5400);
}

function addLog(text, noBuy) {
  const line = document.createElement("div");
  line.className = `log-line${noBuy ? " no-buy" : ""}`;
  line.textContent = text;
  refs.salesLog.prepend(line);
}

function closeShop() {
  if (state.phase !== "open") return;
  state.phase = "closed";
  clearInterval(state.timer);
  clearTimeout(state.customerTimer);
  refs.phaseLabel.textContent = "営業終了";
  refs.clockLabel.textContent = "18:00";
  refs.timeProgress.style.width = "100%";

  const fixedCost = Object.values(FIXED_COSTS).reduce((a, b) => a + b, 0);
  let wasteCost = 0;
  let remainingUnits = 0;

  PRODUCTS.forEach(product => {
    const remaining = state.inventory[product.id] || 0;
    const loss = remaining * product.cost;
    remainingUnits += remaining;
    wasteCost += loss;
    state.productTotals[product.id].wasteCost += loss;
  });

  state.cash -= fixedCost;

  const totalCostOfSales = state.dayCostOfGoods + wasteCost;
  const grossProfit = state.daySales - totalCostOfSales;
  const operatingProfit = grossProfit - fixedCost;
  const purchaseTotal = PRODUCTS.reduce((sum, product) => sum + (state.purchased[product.id] || 0) * product.cost, 0);
  const inventorySellThrough = state.unitsSold / Math.max(1, state.unitsSold + remainingUnits);
  const averageSpend = state.daySales / Math.max(1, state.customers);

  const productBreakdown = PRODUCTS.map(product => {
    const purchased = state.purchased[product.id] || 0;
    const remaining = state.inventory[product.id] || 0;
    const sold = purchased - remaining;
    return {
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      purchased,
      sold,
      remaining,
      sales: sold * state.prices[product.id]
    };
  });

  const result = {
    day: state.day,
    startCash: state.dayStartCash,
    purchaseTotal,
    productBreakdown,
    sales: state.daySales,
    costOfGoods: state.dayCostOfGoods,
    totalCostOfSales,
    grossProfit,
    fixedCost,
    wasteCost,
    operatingProfit,
    endCash: state.cash,
    customers: state.customers,
    unitsSold: state.unitsSold,
    averageSpend,
    inventorySellThrough,
    event: state.event.title
  };

  state.histories.push(result);
  showDailyReport(result);
}

function showDailyReport(result) {
  refs.dailyTitle.textContent = `${result.day}日目の営業結果`;

  const plRows = [
    { label: "売上高", value: result.sales, className: "revenue" },
    {
      label: "売上原価",
      value: result.totalCostOfSales,
      className: "cost",
      details: [
        ["販売した商品の原価", result.costOfGoods],
        ["商品廃棄損", result.wasteCost]
      ]
    },
    { label: "売上総利益", value: result.grossProfit, className: result.grossProfit >= 0 ? "subtotal positive" : "subtotal negative" },
    {
      label: "固定費",
      value: result.fixedCost,
      className: "cost",
      details: [
        ["家賃", FIXED_COSTS.rent],
        ["光熱費", FIXED_COSTS.utilities],
        ["人件費", FIXED_COSTS.labor]
      ]
    },
    { label: "営業利益", value: result.operatingProfit, className: result.operatingProfit >= 0 ? "total positive" : "total negative" }
  ];

  refs.dailyPlStatement.innerHTML = plRows.map(row => `
    <div class="pl-row ${row.className}">
      <div class="pl-main">
        <span>${row.label}</span>
        <strong>${yen(row.value)}</strong>
      </div>
      ${row.details ? `<div class="pl-details">${row.details.map(([label, value]) => `
        <div><span>${label}</span><span>${yen(value)}</span></div>
      `).join("")}</div>` : ""}
    </div>
  `).join("");

  const metrics = [
    ["来店客数", `${result.customers}人`],
    ["平均客単価", yen(result.averageSpend)],
    ["在庫消化率", `${(result.inventorySellThrough * 100).toFixed(1)}%`],
    ["営業終了時資金", yen(result.endCash)]
  ];

  refs.dailyMetrics.innerHTML = metrics.map(([label, value]) => `
    <div class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  refs.dailyProductBody.innerHTML = result.productBreakdown.map(item => `
    <tr>
      <td>
        <div class="product-name">
          <span class="product-emoji">${item.emoji}</span>
          <span>${item.name}</span>
        </div>
      </td>
      <td>${item.purchased}</td>
      <td>${item.sold}</td>
      <td>${item.remaining}</td>
      <td>${yen(item.sales)}</td>
    </tr>
  `).join("");

  const comments = [];
  if (result.operatingProfit > 12000) comments.push("利益を大きく確保できた一日でした。");
  else if (result.operatingProfit > 0) comments.push("黒字を確保できました。");
  else comments.push("今日は赤字でした。価格・仕入量・固定費の関係を見直す必要があります。");

  if (result.inventorySellThrough > .82) comments.push("仕入れた商品の多くを販売できています。");
  else if (result.inventorySellThrough < .48) comments.push("売れ残りが多く、商品廃棄損が利益を圧迫しています。");

  if (result.averageSpend > 1300) comments.push("平均客単価は高めでした。");
  if (result.customers < 12) comments.push("来店客数が少ない日でも利益を出せる価格設計が重要です。");

  refs.dailyComment.textContent = comments.join(" ");
  refs.nextDayButton.textContent = state.cash <= 0
    ? "ゲームオーバー結果を見る"
    : state.day >= 7 ? "最終結果を見る" : "次の日へ";
  refs.dailyModal.classList.remove("hidden");
}

function proceedAfterDailyReport() {
  refs.dailyModal.classList.add("hidden");

  if (state.day >= 7 || state.cash <= 0) {
    showFinalReport();
    return;
  }

  state.day += 1;
  renderSetup();
}

function showFinalReport() {
  const isGameOver = state.cash <= 0;
  const operatedDays = state.histories.length;
  refs.finalTitle.textContent = isGameOver ? "ゲームオーバー" : "7日間の経営結果";
  refs.finalPlHeading.textContent = `${operatedDays}日間累計 損益計算書（P/L）`;

  const totalSales = state.histories.reduce((sum, day) => sum + day.sales, 0);
  const totalCostOfGoods = state.histories.reduce((sum, day) => sum + day.costOfGoods, 0);
  const totalWaste = state.histories.reduce((sum, day) => sum + day.wasteCost, 0);
  const totalCostOfSales = totalCostOfGoods + totalWaste;
  const totalGrossProfit = totalSales - totalCostOfSales;
  const totalFixedCost = state.histories.reduce((sum, day) => sum + day.fixedCost, 0);
  const totalOperatingProfit = totalGrossProfit - totalFixedCost;
  const totalCustomers = state.histories.reduce((sum, day) => sum + day.customers, 0);
  const totalUnits = state.histories.reduce((sum, day) => sum + day.unitsSold, 0);
  const totalPurchasedUnits = state.histories.reduce((sum, day) => {
    return sum + day.productBreakdown.reduce((sub, item) => sub + item.purchased, 0);
  }, 0);
  const averageSpend = totalSales / Math.max(1, totalCustomers);
  const inventorySellThrough = totalUnits / Math.max(1, totalPurchasedUnits);
  const profitableDays = state.histories.filter(day => day.operatingProfit > 0).length;

  const plRows = [
    { label: "売上高", value: totalSales, className: "revenue" },
    {
      label: "売上原価",
      value: totalCostOfSales,
      className: "cost",
      details: [
        ["販売した商品の原価", totalCostOfGoods],
        ["商品廃棄損", totalWaste]
      ]
    },
    { label: "売上総利益", value: totalGrossProfit, className: totalGrossProfit >= 0 ? "subtotal positive" : "subtotal negative" },
    {
      label: "固定費",
      value: totalFixedCost,
      className: "cost",
      details: [
        ["家賃", FIXED_COSTS.rent * operatedDays],
        ["光熱費", FIXED_COSTS.utilities * operatedDays],
        ["人件費", FIXED_COSTS.labor * operatedDays]
      ]
    },
    { label: "営業利益", value: totalOperatingProfit, className: totalOperatingProfit >= 0 ? "total positive" : "total negative" }
  ];

  refs.finalPlStatement.innerHTML = plRows.map(row => `
    <div class="pl-row ${row.className}">
      <div class="pl-main">
        <span>${row.label}</span>
        <strong>${yen(row.value)}</strong>
      </div>
      ${row.details ? `<div class="pl-details">${row.details.map(([label, value]) => `
        <div><span>${label}</span><span>${yen(value)}</span></div>
      `).join("")}</div>` : ""}
    </div>
  `).join("");

  const metrics = [
    [isGameOver ? "終了時資金" : "最終資金", yen(state.cash)],
    ["総来店客数", `${totalCustomers}人`],
    ["平均客単価", yen(averageSpend)],
    ["在庫消化率", `${(inventorySellThrough * 100).toFixed(1)}%`],
    ["総販売点数", `${totalUnits}点`],
    ["黒字日数", `${profitableDays} / ${operatedDays}日`]
  ];

  refs.finalMetrics.innerHTML = metrics.map(([label, value]) => `
    <div class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  const productResults = PRODUCTS.map(product => {
    const aggregate = state.histories.reduce((acc, day) => {
      const item = day.productBreakdown.find(entry => entry.id === product.id);
      if (item) {
        acc.purchased += item.purchased;
        acc.sold += item.sold;
        acc.remaining += item.remaining;
        acc.sales += item.sales;
      }
      return acc;
    }, { purchased: 0, sold: 0, remaining: 0, sales: 0 });

    return {
      ...product,
      ...aggregate,
      wasteCost: aggregate.remaining * product.cost,
      contribution: aggregate.sales - (aggregate.purchased * product.cost)
    };
  });

  refs.finalProductBody.innerHTML = productResults.map(item => `
    <tr>
      <td>
        <div class="product-name">
          <span class="product-emoji">${item.emoji}</span>
          <span>${item.name}</span>
        </div>
      </td>
      <td>${item.purchased}</td>
      <td>${item.sold}</td>
      <td>${item.remaining}</td>
      <td>${yen(item.sales)}</td>
      <td>${yen(item.wasteCost)}</td>
    </tr>
  `).join("");

  const topContribution = [...productResults].sort((a, b) => b.contribution - a.contribution)[0];
  const mostSold = [...productResults].sort((a, b) => b.sold - a.sold)[0];
  const mostWasted = [...productResults].sort((a, b) => b.wasteCost - a.wasteCost)[0];
  const analyses = [];

  if (isGameOver) {
    analyses.push(`手元資金が0円以下となり、${operatedDays}日目で営業を継続できなくなりました。`);
  } else if (totalOperatingProfit > 30000) {
    analyses.push("7日間を通じて高い営業利益を確保できました。");
  } else if (totalOperatingProfit > 0) {
    analyses.push("7日間の累計では黒字を確保できました。");
  } else {
    analyses.push("7日間の累計は赤字となりました。仕入量と価格設定を見直す余地があります。");
  }

  if (inventorySellThrough >= .85) analyses.push("在庫消化率が高く、発注量を効率よく販売できています。");
  else if (inventorySellThrough < .6) analyses.push("在庫消化率が低く、商品廃棄損が利益を圧迫しています。");

  if (averageSpend >= 1500) analyses.push("平均客単価は高めで、高価格帯の商品も売上に貢献しました。");
  else if (averageSpend < 800) analyses.push("平均客単価は低めです。値下げによる販売増と利益率のバランスが課題です。");

  analyses.push(`最も販売数が多かった商品は${mostSold.name}（${mostSold.sold}点）でした。`);
  analyses.push(`商品別の利益貢献が最も大きかったのは${topContribution.name}でした。`);
  if (mostWasted.wasteCost > 0) analyses.push(`商品廃棄損が最も大きかったのは${mostWasted.name}（${yen(mostWasted.wasteCost)}）でした。`);

  refs.finalAnalysis.textContent = analyses.join(" ");
  refs.finalModal.classList.remove("hidden");
}

function formatTime(minutesFromOpen) {
  const totalMinutes = 10 * 60 + Math.min(minutesFromOpen, 480);
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function restartGame() {
  clearInterval(state.timer);
  clearTimeout(state.customerTimer);
  Object.assign(state, {
    day: 1,
    cash: 100000,
    phase: "setup",
    event: EVENTS[0],
    inventory: {},
    prices: {},
    purchased: {},
    daySales: 0,
    dayCostOfGoods: 0,
    customers: 0,
    unitsSold: 0,
    dayStartCash: 100000,
    currentMinute: 0,
    timer: null,
    customerTimer: null,
    histories: [],
    productTotals: {},
    previousSetup: {}
  });
  initializeProductTotals();
  refs.finalModal.classList.add("hidden");
  renderSetup();
}

refs.openShopButton.addEventListener("click", openShop);
refs.nextDayButton.addEventListener("click", proceedAfterDailyReport);
refs.restartButton.addEventListener("click", restartGame);

initializeProductTotals();
renderSetup();

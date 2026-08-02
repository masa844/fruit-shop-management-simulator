const PRODUCTS = [
  { id: "apple", name: "りんご", emoji: "🍎", cost: 120, reference: 210, popularity: 1.10, maxQty: 5 },
  { id: "orange", name: "みかん", emoji: "🍊", cost: 75, reference: 140, popularity: 1.18, maxQty: 6 },
  { id: "banana", name: "バナナ", emoji: "🍌", cost: 95, reference: 180, popularity: 1.12, maxQty: 4 },
  { id: "strawberry", name: "いちご", emoji: "🍓", cost: 280, reference: 480, popularity: 0.95, maxQty: 3 },
  { id: "cherry", name: "さくらんぼ", emoji: "🍒", cost: 350, reference: 620, popularity: 0.75, maxQty: 2 },
  { id: "melon", name: "メロン", emoji: "🍈", cost: 900, reference: 1600, popularity: 0.38, maxQty: 1 },
  { id: "grape", name: "シャインマスカット", emoji: "🍇", cost: 1400, reference: 2400, popularity: 0.30, maxQty: 1 }
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
    text: "さっぱりした果物が人気。みかん・バナナ・ぶどう系の需要が上がります。",
    customerMultiplier: 1.08,
    demand: { orange: 1.35, banana: 1.18, grape: 1.28 }
  },
  {
    title: "雨の日",
    text: "人通りが少なく、来店客数が減りそうです。",
    customerMultiplier: 0.85,
    demand: {}
  },
  {
    title: "テレビで高級果物特集",
    text: "メロンとシャインマスカットに注目が集まっています。",
    customerMultiplier: 1.05,
    demand: { melon: 1.8, grape: 1.9 }
  },
  {
    title: "近所で運動会",
    text: "家族連れが増え、手頃な果物を複数買う人が増えそうです。",
    customerMultiplier: 1.28,
    demand: { apple: 1.18, orange: 1.22, banana: 1.25 }
  },
  {
    title: "給料日後の週末",
    text: "客単価が上がり、高価格の商品も売れやすくなります。",
    customerMultiplier: 1.16,
    demand: { strawberry: 1.22, cherry: 1.28, melon: 1.3, grape: 1.35 }
  },
  {
    title: "競合店の特売",
    text: "価格に敏感なお客さんが増えています。割高な商品は敬遠されます。",
    customerMultiplier: 1.00,
    priceSensitivity: 1.28,
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
  rent: 4000,
  utilities: 1500,
  labor: 3500
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
  dailyReportGrid: document.getElementById("dailyReportGrid"),
  dailyProductBody: document.getElementById("dailyProductBody"),
  dailyComment: document.getElementById("dailyComment"),
  nextDayButton: document.getElementById("nextDayButton"),
  finalModal: document.getElementById("finalModal"),
  finalCashLabel: document.getElementById("finalCashLabel"),
  finalReportGrid: document.getElementById("finalReportGrid"),
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

  renderShelves();
  updateLiveDisplay();
  addLog("10:00　開店しました。", false);
  startBusinessDay();
}

function renderShelves() {
  refs.shelves.innerHTML = "";
  PRODUCTS.forEach(product => {
    const shelf = document.createElement("div");
    shelf.className = "shelf";
    shelf.innerHTML = `
      <div class="fruit">${product.emoji.repeat(Math.min(3, Math.max(1, state.inventory[product.id])))}</div>
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
  refs.inventoryGrid.innerHTML = "";

  PRODUCTS.forEach(product => {
    const item = document.createElement("div");
    item.className = "inventory-item";
    const purchased = state.purchased[product.id] || 0;
    const remaining = state.inventory[product.id] || 0;
    const sold = purchased - remaining;
    item.innerHTML = `
      <div class="icon">${product.emoji}</div>
      <div><strong>${product.name}</strong><small>販売 ${sold} / 仕入 ${purchased}</small></div>
      <strong>残 ${remaining}</strong>
    `;
    refs.inventoryGrid.appendChild(item);
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

  const totalWeight = CUSTOMER_TYPES.reduce((sum, item) => sum + (item.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  const type = CUSTOMER_TYPES.find(item => {
    roll -= item.weight || 1;
    return roll <= 0;
  }) || CUSTOMER_TYPES[0];
  const customer = {
    ...type,
    budget: randomInt(type.budget[0], type.budget[1]),
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

  const grossProfit = state.daySales - state.dayCostOfGoods;
  const operatingProfit = grossProfit - fixedCost - wasteCost;
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
  const reportItems = [
    ["売上高", yen(result.sales), "highlight"],
    ["売上原価", yen(result.costOfGoods), ""],
    ["売上総利益", yen(result.grossProfit), "highlight"],
    ["固定費", yen(result.fixedCost), ""],
    ["売れ残り原価", yen(result.wasteCost), result.wasteCost > result.sales * .2 ? "negative" : ""],
    ["営業利益", yen(result.operatingProfit), result.operatingProfit >= 0 ? "highlight" : "negative"],
    ["来店客数", `${result.customers}人`, ""],
    ["平均客単価", yen(result.averageSpend), ""],
    ["在庫消化率", `${(result.inventorySellThrough * 100).toFixed(1)}%`, ""],
    ["営業終了時資金", yen(result.endCash), result.endCash >= result.startCash ? "highlight" : "negative"]
  ];

  refs.dailyReportGrid.innerHTML = reportItems.map(([label, value, cls]) => `
    <div class="report-item ${cls}">
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
  else if (result.inventorySellThrough < .48) comments.push("売れ残りが多く、過剰仕入れの影響が出ています。");

  if (result.averageSpend > 1300) comments.push("平均客単価は高めでした。");
  if (result.customers < 12) comments.push("来店客数が少ない日でも利益を出せる価格設計が重要です。");

  refs.dailyComment.textContent = comments.join(" ");
  refs.nextDayButton.textContent = state.day >= 7 ? "最終結果を見る" : "次の日へ";
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
  const totalSales = state.histories.reduce((sum, day) => sum + day.sales, 0);
  const totalOperatingProfit = state.histories.reduce((sum, day) => sum + day.operatingProfit, 0);
  const totalWaste = state.histories.reduce((sum, day) => sum + day.wasteCost, 0);
  const totalCustomers = state.histories.reduce((sum, day) => sum + day.customers, 0);
  const totalUnits = state.histories.reduce((sum, day) => sum + day.unitsSold, 0);
  const totalPurchasedUnits = state.histories.reduce((sum, day) => {
    const sold = day.unitsSold;
    const denominator = Math.max(day.inventorySellThrough, .0001);
    return sum + sold / denominator;
  }, 0);
  const averageSpend = totalSales / Math.max(1, totalCustomers);
  const wasteRate = totalWaste / Math.max(1, state.histories.reduce((sum, day) => sum + day.purchaseTotal, 0));

  const productRanking = PRODUCTS.map(product => {
    const total = state.productTotals[product.id];
    return {
      ...product,
      contribution: total.sales - total.cost - total.wasteCost,
      ...total
    };
  }).sort((a, b) => b.contribution - a.contribution);

  const topProduct = productRanking[0];
  const mostSold = [...productRanking].sort((a, b) => b.sold - a.sold)[0];

  refs.finalCashLabel.textContent = yen(state.cash);
  refs.finalReportGrid.innerHTML = [
    ["7日間の総売上", yen(totalSales), "highlight"],
    ["7日間の営業利益", yen(totalOperatingProfit), totalOperatingProfit >= 0 ? "highlight" : "negative"],
    ["廃棄・売れ残り原価", yen(totalWaste), wasteRate > .25 ? "negative" : ""],
    ["廃棄率", `${(wasteRate * 100).toFixed(1)}%`, wasteRate < .15 ? "highlight" : ""],
    ["総来店客数", `${totalCustomers}人`, ""],
    ["平均客単価", yen(averageSpend), ""],
    ["最も売れた商品", `${mostSold.emoji} ${mostSold.name} ${mostSold.sold}点`, ""],
    ["利益貢献トップ", `${topProduct.emoji} ${topProduct.name} ${yen(topProduct.contribution)}`, "highlight"]
  ].map(([label, value, cls]) => `
    <div class="report-item ${cls}">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  const analyses = [];
  const capitalGrowth = state.cash - 100000;

  if (capitalGrowth >= 60000) analyses.push("非常に高い収益性を実現しました。価格と仕入量の調整がうまく機能しています。");
  else if (capitalGrowth >= 20000) analyses.push("安定して利益を積み上げられました。");
  else if (capitalGrowth >= 0) analyses.push("元手を維持しながら黒字で終了しました。");
  else analyses.push("元手を減らして終了しました。売れ残りと価格設定を中心に検討してみましょう。");

  if (wasteRate > .3) analyses.push("売れ残り原価が大きく、在庫管理が利益を圧迫しています。");
  else if (wasteRate < .12) analyses.push("廃棄率を低く抑え、効率よく在庫を回せました。");

  if (averageSpend < 700) analyses.push("客単価は低めです。安売りによる販売数量と利益率のバランスが論点になります。");
  else if (averageSpend > 1600) analyses.push("客単価は高めです。高価格でも買う顧客を捉えられています。");

  analyses.push(`7日間で最も利益に貢献した商品は${topProduct.name}でした。`);
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

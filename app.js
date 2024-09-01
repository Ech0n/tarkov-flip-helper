async function querryTraders(levels = { intCntr: 0 }) {
  return fetch("https://api.tarkov.dev/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `{
    traders(lang: en) {
        id
        name
    		cashOffers {
    		  minTraderLevel
    		  currency
    		  priceRUB
    		  buyLimit
  				item{
            name
            avg24hPrice
            iconLink
          }
    		}
    }
    }`,
    }),
  })
    .then((r) => r.json())
    .then((d) => processData(d));
}

const out = document.getElementById("myOutput");

function outputObjectToDOM(content) {
  out.innerHTML += JSON.stringify(content);
}

querryTraders();

function getProfits(item) {
  const singleItemProfit = item["item"]["avg24hPrice"] - item["priceRUB"];
  return singleItemProfit * item["buyLimit"];
}

function createItemMap(items) {
  //create map

  let itemMap = new Map(
    items.map((item) => [
      item["item"]["name"],
      {
        profit: getProfits(item),
        minTraderLevel: item["minTraderLevel"],
        priceRUB: item["priceRUB"],
        buyLimit: item["buyLimit"],
        fleaPrice: item["item"]["avg24hPrice"],
        lastOfferCount: item["item"]["lastOfferCount"],
        img: item["item"]["iconLink"],
      },
    ])
  );
  //sort map
  let sortedMap = new Map(
    [...itemMap.entries()].sort((a, b) => b[1]["profit"] - a[1]["profit"])
  );
  return sortedMap;
}

function processData(data) {
  let traders = {};
  data["data"]["traders"].forEach((trader) => {
    traders[trader["name"]] = createItemMap(trader["cashOffers"]);
  });
  let loadingCircle = document.getElementById("loading-circle");
  loadingCircle.style.display = "none";
  createTabs(traders);
}

function createTabs(traders) {
  let tabs = document.createElement("div");
  tabs.className = "tab";
  for (let traderName in traders) {
    tabs.appendChild(createTraderTabButton(traderName));
  }
  out.appendChild(tabs);
  for (let traderName in traders) {
    out.appendChild(createTraderTab(traderName, traders[traderName]));
  }
}

function createTraderTabButton(traderName) {
  let button = document.createElement("button");
  button.className = "tablinks";
  button.onclick = (e) => openTab(e, traderName);
  button.innerHTML = traderName;
  return button;
}

function createTraderTab(traderName, trader) {
  let content = document.createElement("div");
  content.setAttribute("id", traderName);
  content.setAttribute("class", "tabcontent");

  content.appendChild(createTraderTable(trader));
  return content;
}
const headers = [
  "profit",
  "minTraderLevel",
  "priceRUB",
  "buyLimit",
  "fleaPrice",
];

function createTraderTable(trader) {
  let table = document.createElement("table");
  let tableHead = document.createElement("thead");
  let headerRow = document.createElement("tr");
  let col = document.createElement("th");
  col.innerHTML = "";
  headerRow.appendChild(col);
  col = document.createElement("th");
  col.innerHTML = "item name";
  headerRow.appendChild(col);
  for (header in headers) {
    let col = document.createElement("th");
    col.innerHTML = headers[header];
    headerRow.appendChild(col);
  }
  tableHead.appendChild(headerRow);
  table.appendChild(tableHead);
  for (let [key, value] of trader.entries()) {
    let row = document.createElement("tr");

    let col = document.createElement("th");
    let img = document.createElement("img");
    img.src = value["img"];
    img.setAttribute("lazy", true);
    col.appendChild(img);
    row.appendChild(col);
    col = document.createElement("th");
    col.innerHTML += key;
    row.appendChild(col);
    for (columnName of headers) {
      col = document.createElement("th");
      col.innerHTML += String(value[columnName]);
      row.appendChild(col);
    }

    table.appendChild(row);
  }

  return table;
}

//snipet from w3school
function openTab(evt, traderName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(traderName).style.display = "block";
  evt.currentTarget.className += " active";
}

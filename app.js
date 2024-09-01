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

function createProfitMap(items) {
  //create map
  let itemMap = new Map(
    items.map((item) => [item["item"]["name"], getProfits(item)])
  );
  //sort map
  let sortedMap = new Map([...itemMap.entries()].sort((a, b) => b[1] - a[1]));
  return sortedMap;
}

function processData(data) {
  let traders = {};
  data["data"]["traders"].forEach((trader) => {
    traders[trader["name"]] = createProfitMap(trader["cashOffers"]);
  });
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

function createTraderTable(trader) {
  let table = document.createElement("table");
  for (let [key, value] of trader.entries()) {
    console.log(key);
    let row = document.createElement("tr");
    let col1 = document.createElement("th");
    let col2 = document.createElement("th");
    col1.innerHTML += key;
    col2.innerHTML += value;
    row.appendChild(col1);
    row.appendChild(col2);
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

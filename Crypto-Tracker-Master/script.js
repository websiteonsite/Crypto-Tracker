document.addEventListener("DOMContentLoaded", function () {
  const cryptoContainer = document.querySelector(".crypto-list");
  const searchInput = document.getElementById("search");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const pageNumber = document.getElementById("page-number");

  const apiKey = "coinranking9a90c02e6f7e04e10a85e3f11d1b823bebaf7ed3de7fa07f";
  const coinsPerPage = 5;
  let currentPage = 1;
  let filteredCoins = [];
  let allCoins = [];
  const coinsUUID = [
    "Qwsogvtv82FCd",
    "razxDUgYGNAdQ",
    "HIVsRcGKkPFtW",
    "KNS7lFwBX",
    "WcwrkfNI4FUAe",
    "-l8Mn2pVlRs-p",
    "zNZHO_Sjf",
    "aKzUVe4Hh_CON",
    "qzawljRxB5bYu",
    "dvUj0CzDZ",
    "PDKcptVnzJTmN-sV8",
    "a91GCGd_u96cF",
    "25W7FG7om",
    "qUhEFk1I61atv",
    "CiixT63n3",
    "VLqpJwogdhHNb",
    "uW2tk-ILY0ii",
    "Mtfb0obXVh59u",
    "x4WXHge-vvFY",
    "xz24e0BjL",
    "_H5FVG9iW",
    "D7B1x_ks7WhV5",
    "ZlZpzOJo43mIo",
    "Z96jIvLU7",
    "08CsQa-Ov",
    "Knsels4_Ol-Ny",
    "MoTuySvg7",
    "ncYFcP709",
  ];

  function fetchCryptoData() {
    allCoins = [];
    filteredCoins = [];
    let promises = coinsUUID.map((uuid) => {
      return fetchWithRetry(`https://api.coinranking.com/v2/coin/${uuid}`, {
        headers: { "x-access-token": apiKey },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.error("Error fetching coin data:", error);
          return { status: "fail" };
        });
    });

    Promise.all(promises)
      .then((dataArray) => {
        dataArray.forEach((data) => {
          if (data.status !== "fail") {
            allCoins.push(data.data.coin);
          }
        });
        filteredCoins = allCoins;
        renderCryptoList();
      })
      .catch((error) => console.error("Fetch error:", error));
  }

  function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    return fetch(url, options).then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          console.error(`Resource not found: ${url}`);
          return Promise.resolve({ status: "fail" });
        }
        if (response.status === 429 && retries > 0) {
          console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
          return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
            fetchWithRetry(url, options, retries - 1, delay)
          );
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response;
    });
  }

  function renderCryptoList() {
    cryptoContainer.innerHTML = "";
    const start = (currentPage - 1) * coinsPerPage;
    const end = start + coinsPerPage;
    const coinsToRender = filteredCoins.slice(start, end);

    coinsToRender.forEach((coin) => {
      const changeColor = coin.change < 0 ? "red" : "green";
      const cryptoDiv = document.createElement("div");
      cryptoDiv.className = "crypto";
      cryptoDiv.innerHTML = `
      <div class="crypto-icon">
        <img src="${coin.iconUrl}" />
        <span>${coin.name}</span>
        <small>${coin.symbol}</small>
      </div>
      <div class="crypto-price">
        <span>$${parseFloat(coin.price).toFixed(2)}</span>
      </div>
      <div class="change" style="color: ${changeColor}">
        <span>${coin.change}%</span>
      </div>
      <div class="volume">
        <span>$${parseFloat(coin["24hVolume"]).toFixed(2)}</span>
      </div>
      <div class="market-cap">
        <span>$${parseFloat(coin.marketCap).toFixed(2)}</span>
      </div>
      <div class="action">
        <a href="${coin.websiteUrl}" target="_blank">View</a>
      </div>
    `;
      cryptoContainer.appendChild(cryptoDiv);
    });

    updatePagination();
  }

  function updatePagination() {
    pageNumber.textContent = currentPage;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled =
      currentPage === Math.ceil(filteredCoins.length / coinsPerPage) ||
      filteredCoins.length === 0;
  }

  function searchCoins(searchTerm) {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    filteredCoins = allCoins.filter((coin) => {
      return (
        coin.name.toLowerCase().includes(normalizedSearchTerm) ||
        coin.symbol.toLowerCase().includes(normalizedSearchTerm)
      );
    });
    currentPage = 1;
    renderCryptoList();
  }

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value.trim();
    searchCoins(searchTerm);
  });

  prevButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderCryptoList();
    }
  });

  nextButton.addEventListener("click", function () {
    if (currentPage < Math.ceil(filteredCoins.length / coinsPerPage)) {
      currentPage++;
      renderCryptoList();
    }
  });

  fetchCryptoData();
});

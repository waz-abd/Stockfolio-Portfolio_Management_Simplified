function loadCryptoData() {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd')
        .then(response => response.json())
        .then(data => {
            let cryptoTable = document.getElementById('cryptoDataContainer');
            cryptoTable.innerHTML = '';
            data.forEach(crypto => {
                let isInWatchlist = isTickerInWatchlist(crypto.id);
                let row = cryptoTable.insertRow();
                row.insertCell(0).innerHTML = crypto.name;
                row.insertCell(1).innerHTML = crypto.symbol.toUpperCase();
                row.insertCell(2).innerHTML = `$${crypto.current_price.toLocaleString()}`;
                row.insertCell(3).innerHTML = `$${crypto.market_cap.toLocaleString()}`;
                row.insertCell(4).innerHTML = `${crypto.price_change_percentage_24h.toFixed(2)}%`;
                row.insertCell(5).innerHTML = `
                    <button class="btn ${isInWatchlist ? 'btn-success' : 'btn-primary'}" onclick="toggleWatchlist('${crypto.id}', this)">
                        ${isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>
                `;
            });
        })
        .catch(error => console.error('Error fetching crypto data:', error));
}

function getWatchlist() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.username) return [];

    return JSON.parse(localStorage.getItem(`${currentUser.username}_cryptoWatchlist`)) || [];
}

function setWatchlist(watchlist) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.username) {
        localStorage.setItem(`${currentUser.username}_cryptoWatchlist`, JSON.stringify(watchlist));
    }
}

function isTickerInWatchlist(id) {
    let watchlist = getWatchlist();
    return watchlist.includes(id);
}

function toggleWatchlist(id, element) {
    let watchlist = getWatchlist();

    if (watchlist.includes(id)) {
        if (confirm("Do you want to remove this cryptocurrency from your watchlist?")) {
            watchlist = watchlist.filter(item => item !== id);
            element.textContent = 'Add to Watchlist';
            element.className = 'btn btn-primary';
            loadCryptoData();
        }
    } else {
        watchlist.push(id);
        element.textContent = 'In Watchlist';
        element.className = 'btn btn-success';
    }

    setWatchlist(watchlist);
    displayWatchlist();
}

function displayWatchlist() {
    let watchlist = getWatchlist();
    let watchlistContainer = document.getElementById('watchlistContainer');
    watchlistContainer.innerHTML = '';

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = '<tr><td colspan="6">No cryptocurrencies in your watchlist.</td></tr>';
    } else {
        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${watchlist.join(',')}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(crypto => {
                    let isInWatchlist = isTickerInWatchlist(crypto.id);
                    let row = watchlistContainer.insertRow();
                    row.insertCell(0).innerHTML = crypto.name;
                    row.insertCell(1).innerHTML = crypto.symbol.toUpperCase();
                    row.insertCell(2).innerHTML = `$${crypto.current_price.toLocaleString()}`;
                    row.insertCell(3).innerHTML = `$${crypto.market_cap.toLocaleString()}`;
                    row.insertCell(4).innerHTML = `${crypto.price_change_percentage_24h.toFixed(2)}%`;
                    row.insertCell(5).innerHTML = `
                        <button class="btn btn-danger" onclick="toggleWatchlist('${crypto.id}', this)">
                            Remove from Watchlist
                        </button>
                    `;
                });
            })
            .catch(error => {
                console.error('Error fetching watchlist data:', error);
                watchlistContainer.innerHTML = '<tr><td colspan="6">Error fetching data from API.</td></tr>';
            });
    }
}

document.getElementById('watchlistModal').addEventListener('show.bs.modal', displayWatchlist);

document.addEventListener("DOMContentLoaded", () => {
    loadCryptoData();
    getCoinName();
    displayCryptoPortfolio();
    displayTotalCryptoValue();
});

let cryptoList = [];

function getCoinName() {
    fetch('https://api.coingecko.com/api/v3/coins/list')
        .then(response => response.json())
        .then(data => {
            let coinNamesList = document.getElementById('coinNamesList');
            coinNamesList.innerHTML = '';

            data.forEach(crypto => {
                cryptoList.push({ id: crypto.id, name: crypto.name });
                let option = document.createElement("option");
                option.value = crypto.name;
                option.dataset.id = crypto.id;
                coinNamesList.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching crypto data:', error));
}

function updatePrice() {
    let coinName = document.getElementById('coinName').value;
    let coin = cryptoList.find(c => c.name.toLowerCase() === coinName.toLowerCase());

    let pricePerCoin = document.getElementById('pricePerCoin');

    if (coin) {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`)
            .then(response => response.json())
            .then(data => {
                if (data[coin.id] && data[coin.id].usd) {
                    pricePerCoin.value = data[coin.id].usd;
                } else {
                    pricePerCoin.value = '';
                    alert('Price not available for the selected cryptocurrency.');
                }
            })
            .catch(error => {
                console.error('Error fetching price data:', error);
                pricePerCoin.value = '';
                alert('Error fetching price. Please try again later.');
            });
    } else {
        pricePerCoin.value = '';
    }
}

document.getElementById('coinName').addEventListener('input', updatePrice);

function getUserCrypto() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return JSON.parse(localStorage.getItem(`${currentUser.username}_crypto`)) || [];
}

function setUserCrypto(cryptoPortfolio) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`${currentUser.username}_crypto`, JSON.stringify(cryptoPortfolio));
}

function displayCryptoPortfolio() {
    let cryptoPortfolio = getUserCrypto();
    let cryptoList = document.getElementById("portfolioContainer");
    cryptoList.innerHTML = "";

    cryptoPortfolio.forEach((crypto, index) => {
        let totalValue = crypto.quantity * parseFloat(crypto.pricePerCoin);
        let row = cryptoList.insertRow();
        row.insertCell(0).innerHTML = crypto.name;
        row.insertCell(1).innerHTML = crypto.quantity.toLocaleString();
        row.insertCell(2).innerHTML = `$${parseFloat(crypto.pricePerCoin).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(3).innerHTML = crypto.dateOfPurchase;
        row.insertCell(4).innerHTML = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(5).innerHTML = `
            <button class="btn btn-warning editCrypto" onclick="editCrypto(this)">Edit</button>
            <button class="btn btn-danger deleteCrypto" onclick="deleteCrypto(this)">Delete</button>
        `;
    });

    displayTotalCryptoValue();
}

function insertCryptoData(data) {
    let cryptoPortfolio = getUserCrypto();
    cryptoPortfolio.push(data);
    setUserCrypto(cryptoPortfolio);
    displayCryptoPortfolio();
}

function updateCryptoData(data) {
    let cryptoPortfolio = getUserCrypto();
    cryptoPortfolio[selectedRow.rowIndex - 1] = data;
    setUserCrypto(cryptoPortfolio);
    displayCryptoPortfolio();
    selectedRow = null;
}

function editCrypto(td) {
    selectedRow = td.parentElement.parentElement;
    document.getElementById("coinName").value = selectedRow.cells[0].innerHTML;
    document.getElementById("quantity").value = selectedRow.cells[1].innerHTML;
    document.getElementById("pricePerCoin").value = parseFloat(selectedRow.cells[2].innerHTML.replace('$', '').replace(',', '')).toFixed(2);
    document.getElementById("dateOfPurchase").value = selectedRow.cells[3].innerHTML;
}

function deleteCrypto(td) {
    if (confirm("Do you want to delete this record?")) {
        let row = td.parentElement.parentElement;
        let index = row.rowIndex - 1;
        let cryptoPortfolio = getUserCrypto();
        cryptoPortfolio.splice(index, 1);
        setUserCrypto(cryptoPortfolio);
        displayCryptoPortfolio();
    }
}

function submitCryptoData() {
    let cryptoData = {
        name: document.getElementById("coinName").value,
        quantity: parseFloat(document.getElementById("quantity").value),
        pricePerCoin: parseFloat(document.getElementById("pricePerCoin").value),
        dateOfPurchase: document.getElementById("dateOfPurchase").value
    };

    if (!cryptoData.name || isNaN(cryptoData.quantity) || isNaN(cryptoData.pricePerCoin) || !cryptoData.dateOfPurchase) {
        alert("Please fill out all fields correctly.");
        return;
    }

    if (selectedRow === null) {
        insertCryptoData(cryptoData);
    } else {
        updateCryptoData(cryptoData);
    }

    document.getElementById('portfolioForm').reset();
    document.getElementById('pricePerCoin').value = '';
    selectedRow = null;

    displayTotalCryptoValue();
}

document.getElementById('portfolioForm').addEventListener('submit', function (event) {
    event.preventDefault();
    submitCryptoData();
});

document.getElementById('portfolioModal').addEventListener('show.bs.modal', displayCryptoPortfolio);

function calculateTotalCryptoValue() {
    let cryptoPortfolio = getUserCrypto();
    let totalValue = cryptoPortfolio.reduce((total, crypto) => {
        return total + (crypto.quantity * parseFloat(crypto.pricePerCoin));
    }, 0);
    return totalValue.toFixed(2);
}

function displayTotalCryptoValue() {
    let totalValue = calculateTotalCryptoValue();
    document.getElementById('totalCryptoValue').innerText = `Total Crypto Portfolio Value: $${Number(totalValue).toLocaleString()}`;
}

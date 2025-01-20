//Sign Up and Sign In
function generateId() {
    return Math.random().toString(36).substr(2, 9)
}

function displayError(message, elementId) {
    let errorElement = document.getElementById(elementId)
    errorElement.textContent = message
    errorElement.classList.remove('d-none')
}

function clearError(elementId) {
    let errorElement = document.getElementById(elementId);
    errorElement.classList.add('d-none')
    errorElement.textContent = '';
}

function registerUser() {
    clearError('registerError');

    let username = document.getElementById('registerUsername').value;
    let password = document.getElementById('registerPassword').value;
    let confirmPassword = document.getElementById('confirmPassword').value;

    if (username && password && confirmPassword) {
        if (password !== confirmPassword) {
            displayError('Passwords do not match.', 'registerError');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.username === username)) {
            displayError('Username already exists.', 'registerError');
            return;
        }

        let newUser = { id: generateId(), username: username, password: password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please sign in.');
        window.location.href = 'index.html';
    } else {
        displayError('Please fill in all fields.', 'registerError');
    }
}

function loginUser() {
    clearError('loginError');

    let username = document.getElementById('loginUsername').value;
    let password = document.getElementById('loginPassword').value;

    if (username && password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let user = users.find(user => user.username === username);

        if (!user) {
            displayError('Username does not exist.', 'loginError');
        } else if (user.password !== password) {
            displayError('Incorrect password.', 'loginError');
        } else {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert('Login successful!');
            window.location.href = 'home.html';
        }
    } else {
        displayError('Please fill in all fields.', 'loginError');
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    setInterval(() => {
        window.location.href = 'index.html';
    }, 2000);
}


//Stocks and Bonds

let selectedRow = null;

document.addEventListener("DOMContentLoaded", function () {
    populateBondSelection();
    displayStocks();
    displayBonds();
    loadStockSymbols();
    displayPortfolioChart();
    displayRealEstate();
    calculateAndDisplayRealEstateSummary();
});

function retrieveStockData() {
    let stockName = document.getElementById("stockName").value;
    let stockQuantity = document.getElementById("stockQuantity").value;
    let stockPrice = document.getElementById("stockPrice").value;
    let stockDate = document.getElementById("stockDate").value;

    if (!stockName || !stockQuantity || !stockPrice || !stockDate) {
        return false;
    }

    stockPrice = parseFloat(stockPrice).toFixed(2);

    return { stockName, stockQuantity, stockPrice, stockDate };
}

function retrieveBondData() {
    let bondName = document.getElementById("bondSelect").value;
    let faceValue = parseFloat(document.getElementById("faceValue").value).toFixed(2);
    let couponRate = parseFloat(document.getElementById("couponRate").value).toFixed(2);
    let marketRate = parseFloat(document.getElementById("marketRate").value).toFixed(2);
    let periods = parseInt(document.getElementById("periods").value);
    let bondDate = document.getElementById("bondDate").value;

    if (!bondName || isNaN(faceValue) || isNaN(couponRate) || isNaN(marketRate) || isNaN(periods) || !bondDate) {
        console.error("Missing or invalid bond data:", { bondName, faceValue, couponRate, marketRate, periods, bondDate });
        return false;
    }

    let bondPrice = calculateBondPrice(parseFloat(faceValue), parseFloat(couponRate), parseFloat(marketRate), periods);

    return { bondName, faceValue, couponRate, marketRate, periods, bondPrice, bondDate };
}

function insertStockData(data) {
    let stocks = getUserStocks();
    stocks.push(data);
    setUserStocks(stocks);
    displayStocks();
    displayPortfolioChart();
}

function insertBondData(data) {
    let bonds = getUserBonds();
    bonds.push(data);
    setUserBonds(bonds);
    displayBonds();
    displayPortfolioChart();
}

function updateStockData(data) {
    let stocks = getUserStocks();
    stocks[selectedRow.rowIndex - 1] = data;
    setUserStocks(stocks);
    displayStocks();
    selectedRow = null;
}

function updateBondData(data) {
    let bonds = getUserBonds();
    bonds[selectedRow.rowIndex - 1] = data;
    setUserBonds(bonds);
    displayBonds();
    selectedRow = null;
}

function displayStocks() {
    let stocks = getUserStocks();
    let stockList = document.getElementById("stocksDataContainer");
    stockList.innerHTML = "";

    stocks.forEach((stock, index) => {
        let totalValue = stock.stockQuantity * parseFloat(stock.stockPrice);
        let row = stockList.insertRow();
        row.insertCell(0).innerHTML = stock.stockName;
        row.insertCell(1).innerHTML = stock.stockQuantity.toLocaleString();
        row.insertCell(2).innerHTML = `$${parseFloat(stock.stockPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(3).innerHTML = stock.stockDate;
        row.insertCell(4).innerHTML = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(5).innerHTML = `
            <button class="btn btn-warning editStock" onclick="editStock(this)">Edit</button>
            <button class="btn btn-danger deleteStock" onclick="deleteStock(this)">Delete</button>
        `;
    });
}

function displayBonds() {
    let bonds = getUserBonds();
    let bondList = document.getElementById("bondsDataContainer");
    bondList.innerHTML = "";

    bonds.forEach((bond, index) => {
        let row = bondList.insertRow();
        row.insertCell(0).innerHTML = bond.bondName;
        row.insertCell(1).innerHTML = `$${parseFloat(bond.faceValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(2).innerHTML = `${parseFloat(bond.couponRate).toFixed(2)}%`;
        row.insertCell(3).innerHTML = `${parseFloat(bond.marketRate).toFixed(2)}%`;
        row.insertCell(4).innerHTML = bond.periods.toLocaleString();
        row.insertCell(5).innerHTML = bond.bondDate;
        row.insertCell(6).innerHTML = `$${parseFloat(bond.bondPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(7).innerHTML = `
            <button class="btn btn-warning editBond" onclick="editBond(this)">Edit</button>
            <button class="btn btn-danger deleteBond" onclick="deleteBond(this)">Delete</button>
        `;
    });
}


function getUserStocks() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return JSON.parse(localStorage.getItem(`${currentUser.username}_stocks`)) || [];
}

function setUserStocks(stocks) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`${currentUser.username}_stocks`, JSON.stringify(stocks));
}

function getUserBonds() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return JSON.parse(localStorage.getItem(`${currentUser.username}_bonds`)) || [];
}

function setUserBonds(bonds) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`${currentUser.username}_bonds`, JSON.stringify(bonds));
}


function editStock(td) {
    selectedRow = td.parentElement.parentElement;
    document.getElementById("stockName").value = selectedRow.cells[0].innerHTML;
    document.getElementById("stockQuantity").value = selectedRow.cells[1].innerHTML;
    document.getElementById("stockPrice").value = parseFloat(selectedRow.cells[2].innerHTML.replace('$', '').replace(',', '')).toFixed(2);
    document.getElementById("stockDate").value = selectedRow.cells[3].innerHTML;
}



function editBond(td) {
    selectedRow = td.parentElement.parentElement;
    document.getElementById("bondSelect").value = selectedRow.cells[0].innerHTML;
    document.getElementById("faceValue").value = parseFloat(selectedRow.cells[1].innerHTML.replace('$', '').replace(',', '')).toFixed(2);
    document.getElementById("couponRate").value = parseFloat(selectedRow.cells[2].innerHTML.replace('%', '')).toFixed(2);
    document.getElementById("marketRate").value = parseFloat(selectedRow.cells[3].innerHTML.replace('%', '')).toFixed(2);
    document.getElementById("periods").value = selectedRow.cells[4].innerHTML;
    document.getElementById("bondDate").value = selectedRow.cells[5].innerHTML;
}


function deleteStock(td) {
    if (confirm("Do you want to delete this record?")) {
        let row = td.parentElement.parentElement;
        let index = row.rowIndex - 1;
        let stocks = getUserStocks();
        stocks.splice(index, 1);
        setUserStocks(stocks);
        displayStocks();
        displayPortfolioChart();

    }

}

function deleteBond(td) {
    if (confirm("Do you want to delete this record?")) {
        let row = td.parentElement.parentElement;
        let index = row.rowIndex - 1;
        let bonds = getUserBonds();
        bonds.splice(index, 1);
        setUserBonds(bonds);
        displayBonds();
        displayPortfolioChart();
    }
}

function submitStockData() {
    let stockData = retrieveStockData();
    if (stockData) {
        if (selectedRow === null) {
            insertStockData(stockData);
        } else {
            updateStockData(stockData);
        }
    }
    displayStocks();
    displayPortfolioChart();
}

function submitBondData() {
    let bondData = retrieveBondData();
    if (!bondData) {
        console.error("Bond data is invalid.");
        return;
    }

    if (selectedRow === null) {
        insertBondData(bondData);
    } else {
        updateBondData(bondData);
    }

    displayBonds();
    displayPortfolioChart();
}

function loadStockSymbols() {
    fetch('Tickers.JSON')
        .then(response => response.json())
        .then(data => {
            let stockSuggestions = Object.values(data).map(stock => ({
                symbol: stock.ticker,
                description: stock.title
            }));
            populateStockSuggestions(stockSuggestions);
        })
        .catch(error => console.error('Error loading stock symbols:', error));
}

function populateStockSuggestions(stockSuggestions) {
    let datalist = document.getElementById('stockSuggestions');
    datalist.innerHTML = '';

    stockSuggestions.forEach(stock => {
        let option = document.createElement('option');
        option.value = stock.description;
        option.label = stock.symbol;
        datalist.appendChild(option);
    });
}

function populateBondSelection() {
    let bonds = [
        "Government of Canada marketable bonds - 1 to 3 year",
        "Government of Canada marketable bonds - 3 to 5 year",
        "Government of Canada marketable bonds - 5 to 10 year",
        "Government of Canada marketable bonds - Over 10 years",
        "Government of Canada benchmark bond - 2 year",
        "Government of Canada benchmark bond - 3 year",
        "Government of Canada benchmark bond - 5 year",
        "Government of Canada benchmark bond - 7 year",
        "Government of Canada benchmark bond - 10 year",
        "Government of Canada benchmark bond - Long-term"
    ];

    let bondSelect = document.getElementById('bondSelect');
    bondSelect.innerHTML = '';

    bonds.forEach(bond => {
        let option = document.createElement('option');
        option.value = bond;
        option.textContent = bond;
        bondSelect.appendChild(option);
    });
}

function calculateBondPrice(faceValue, couponRate, marketRate, periods) {
    let bondPrice = 0;
    let couponPayment = faceValue * (couponRate / 100);

    for (let t = 1; t <= periods; t++) {
        bondPrice += couponPayment / Math.pow(1 + (marketRate / 100), t);
    }

    bondPrice += faceValue / Math.pow(1 + (marketRate / 100), periods);

    return bondPrice.toFixed(2);
}

function calculateAndDisplayBondPrice() {
    let faceValue = parseFloat(document.getElementById('faceValue').value);
    let couponRate = parseFloat(document.getElementById('couponRate').value);
    let marketRate = parseFloat(document.getElementById('marketRate').value);
    let periods = parseInt(document.getElementById('periods').value);

    if (isNaN(faceValue) || isNaN(couponRate) || isNaN(marketRate) || isNaN(periods)) {
        alert('Please enter valid values for all fields.');
        return;
    }

    let bondPrice = calculateBondPrice(faceValue, couponRate, marketRate, periods);
    document.getElementById('calculatedBondPrice').textContent = `Calculated Bond Price: $${bondPrice}`;
}

function calculateTotalValues() {
    let stocks = getUserStocks();
    let bonds = getUserBonds();

    let totalStockValue = stocks.reduce((total, stock) => {
        return total + (stock.stockQuantity * parseFloat(stock.stockPrice));
    }, 0);

    let totalBondValue = bonds.reduce((total, bond) => {
        return total + parseFloat(bond.bondPrice);
    }, 0);

    return { totalStockValue, totalBondValue };
}

let portfolioChart;

function displayPortfolioChart() {
    let ctx = document.getElementById('portfolioChart').getContext('2d');
    let { totalStockValue, totalBondValue } = calculateTotalValues();

    if (portfolioChart) {
        portfolioChart.destroy(); 
    }

    portfolioChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Stocks', 'Bonds'],
            datasets: [{
                label: 'Total Value',
                data: [Number(totalStockValue.toFixed(2)), Number(totalBondValue.toFixed(2))],
                backgroundColor: ['rgba(255, 199, 132, 0.7)', 'rgba(54, 205, 235, 0.7)'],
                hoverBackgroundColor: ['rgba(255, 199, 13, 1)', 'rgba(54, 205, 235, 1)'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    let totalPortfolioValue = (totalStockValue + totalBondValue).toFixed(2);
    document.getElementById('totalPortfolioValue').innerText = `Total Stocks and Bonds Value: $${Number(totalPortfolioValue).toLocaleString()}`;
    document.getElementById('stockValue').innerText = `Total Stock Value: $${Number(totalStockValue.toFixed(2)).toLocaleString()}`;
    document.getElementById('bondValue').innerText = `Total Bond Value: $${Number(totalBondValue.toFixed(2)).toLocaleString()}`;
}





//Real Estate
document.addEventListener("DOMContentLoaded", function () {
    displayRealEstate();
    calculateAndDisplayRealEstateSummary();
});

function retrieveRealEstateData() {
    let propertyName = document.getElementById("propertyName").value.trim();
    let propertyLocation = document.getElementById("propertyLocation").value.trim();
    let propertyValue = parseFloat(document.getElementById("propertyValue").value);
    let rentalIncome = parseFloat(document.getElementById("rentalIncome").value);
    let ownershipPercentage = parseFloat(document.getElementById("ownershipPercentage").value);

    if (ownershipPercentage > 100) {
        alert("Ownership percentage cannot exceed 100%");
        return false;
    }

    if (!propertyName || !propertyLocation || isNaN(propertyValue) || isNaN(ownershipPercentage) || propertyValue <= 0 || ownershipPercentage <= 0) {
        console.error("Form data is invalid or incomplete.");
        return false;
    }

    if (isNaN(rentalIncome) || rentalIncome < 0) {
        rentalIncome = 0;
    }

    console.log("Retrieved real estate data:", { propertyName, propertyLocation, propertyValue, rentalIncome, ownershipPercentage });
    return { propertyName, propertyLocation, propertyValue, rentalIncome, ownershipPercentage };
}



function insertRealEstateData(data) {
    let realEstate = getUserRealEstate()
    realEstate.push(data)
    setUserRealEstate(realEstate)
    displayRealEstate()
    calculateAndDisplayRealEstateSummary()

}

function updateRealEstateData(data) {
    let realEstate = getUserRealEstate()
    let index = selectedRow.rowIndex - 1
    realEstate[index] = data
    setUserRealEstate(realEstate)
    displayRealEstate()
    selectedRow = null
    calculateAndDisplayRealEstateSummary()

}

function displayRealEstate() {
    let realEstate = getUserRealEstate();

    let realEstateList = document.getElementById("realEstateDataContainer");

    realEstateList.innerHTML = "";

    realEstate.forEach((property, index) => {
        let row = realEstateList.insertRow();
        row.insertCell(0).innerHTML = property.propertyName
        row.insertCell(1).innerHTML = property.propertyLocation
        row.insertCell(2).innerHTML = `$${parseFloat(property.propertyValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        row.insertCell(3).innerHTML = `$${parseFloat(property.rentalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        row.insertCell(4).innerHTML = `${parseFloat(property.ownershipPercentage).toFixed(2)}%`;
        row.insertCell(5).innerHTML = `
            <button class="btn btn-warning editProperty" onclick="editRealEstate(this)">Edit</button>
            <button class="btn btn-danger deleteProperty" onclick="deleteRealEstate(this)">Delete</button>
        `;
    });
}



function editRealEstate(button) {
    selectedRow = button.parentElement.parentElement
    document.getElementById("propertyName").value = selectedRow.cells[0].innerHTML
    document.getElementById("propertyLocation").value = selectedRow.cells[1].innerHTML
    document.getElementById("propertyValue").value = parseFloat(selectedRow.cells[2].innerHTML.replace('$', '').replace(',', '')).toFixed(2);
    document.getElementById("rentalIncome").value = parseFloat(selectedRow.cells[3].innerHTML.replace('$', '').replace(',', '')).toFixed(2) || 0;
    document.getElementById("ownershipPercentage").value = parseFloat(selectedRow.cells[4].innerHTML.replace('%', '')).toFixed(2);
}


function deleteRealEstate(button) {
    if (confirm("Do you want to delete this property?")) {
        let row = button.parentElement.parentElement;
        let index = row.rowIndex - 1;
        let realEstate = getUserRealEstate()
        realEstate.splice(index, 1)
        setUserRealEstate(realEstate)
        displayRealEstate()
        calculateAndDisplayRealEstateSummary()
    }
}

function submitRealEstateData() {
    let realEstateData = retrieveRealEstateData();
    if (realEstateData) {
        if (selectedRow === null) {
            insertRealEstateData(realEstateData)
        } else {
            updateRealEstateData(realEstateData)
        }
    }
}

function getUserRealEstate() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return JSON.parse(localStorage.getItem(`${currentUser.username}_realEstate`)) || []
}

function setUserRealEstate(realEstate) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem(`${currentUser.username}_realEstate`, JSON.stringify(realEstate));
}

function calculateAndDisplayRealEstateSummary() {
    let realEstate = getUserRealEstate();
    let totalMarketValue = 0
    let totalRentalIncome = 0

    realEstate.forEach(property => {
        totalMarketValue += property.propertyValue * property.ownershipPercentage / 100;
        totalRentalIncome += property.rentalIncome || 0
    });

    document.getElementById("totalMarketValue").innerText = `$${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    document.getElementById("totalRentalIncome").innerText = `$${totalRentalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}



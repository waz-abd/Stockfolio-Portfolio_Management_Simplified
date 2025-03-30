//Sign Up and Sign In
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function displayError(message, elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.add('d-none');
    errorElement.textContent = '';
}

function registerUser() {
    clearError('registerError');

    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!username || !password || !confirmPassword) {
        displayError('Please fill in all fields.', 'registerError');
        return;
    }


    if (password !== confirmPassword) {
        displayError('Passwords do not match.', 'registerError');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.username === username)) {
        displayError('Username already exists.', 'registerError');
        return;
    }

    const newUser = { id: generateId(), username: username, password: password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please sign in.');
    window.location.href = 'index.html';
}

function loginUser() {
    clearError('loginError');

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        displayError('Please fill in all fields.', 'loginError');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);

    if (!user) {
        displayError('Username does not exist.', 'loginError');
        return;
    }

    if (user.password !== password) {
        displayError('Incorrect password.', 'loginError');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('Login successful!');
    window.location.href = 'home.html';
}

function logoutUser() {
    // Remove the current user from localStorage
    localStorage.removeItem('currentUser');

    // Redirect to the login page
    window.location.href = 'index.html';
}

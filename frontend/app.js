const API_URL = 'http://localhost:3000';
let token = localStorage.getItem('token');
let currentUser = localStorage.getItem('username');

// Check authentication status on page load
window.onload = () => {
    if (token) {
        showMainContent();
        updateUserProfile();
        loadGadgets();
    }
};

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            currentUser = username;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            showMainContent();
            updateUserProfile();
            loadGadgets();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            currentUser = data.username;
            localStorage.setItem('token', token);
            localStorage.setItem('username', data.username);
            showMainContent();
            updateUserProfile();
            loadGadgets();
        } else {
            alert(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('userProfile').style.display = 'none';
}

function showMainContent() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userProfile').style.display = 'flex';
}

function updateUserProfile() {
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser}!`;
}

async function loadGadgets(status = '') {
    try {
        const url = status ? `${API_URL}/gadgets?status=${status}` : `${API_URL}/gadgets`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.gadgets) {
                displayGadgets(data.gadgets);
            } else {
                console.error('Unexpected response structure:', data);
                alert('Failed to load gadgets. Unexpected response structure.');
            }
        } else {
            throw new Error('Failed to load gadgets');
        }
    } catch (error) {
        console.error('Error loading gadgets:', error);
        alert('Failed to load gadgets');
    }
}

function displayGadgets(gadgets) {
    const gadgetsList = document.getElementById('gadgetsList');
    gadgetsList.innerHTML = '';

    if (!Array.isArray(gadgets)) {
        console.error('Invalid gadgets data:', gadgets);
        alert('Failed to display gadgets. Invalid data format.');
        return;
    }

    gadgets.forEach(gadget => {
        const card = document.createElement('div');
        card.className = 'gadget-card';
        card.setAttribute('data-status', gadget.status);  // Add status attribute for glow effect

        card.innerHTML = `
            <h3>${gadget.name}</h3>
            <p>Codename: ${gadget.codename}</p>
            <p>Status: ${gadget.status}</p>
            <p>Success Probability: ${gadget.mission_success_probability}</p>
            <div class="actions">
                <button onclick="updateGadgetStatus('${gadget.id}', 'Deployed')">Deploy</button>
                <button class="danger" onclick="selfDestruct('${gadget.id}')">Self Destruct</button>
                <button class="danger" onclick="decommissionGadget('${gadget.id}')">Decommission</button>
            </div>
        `;
        gadgetsList.appendChild(card);
    });
}

async function addGadget() {
    const name = document.getElementById('gadgetName').value;
    if (!name) {
        alert('Please enter a gadget name');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/gadgets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            document.getElementById('gadgetName').value = '';
            loadGadgets();
        } else {
            throw new Error('Failed to add gadget');
        }
    } catch (error) {
        console.error('Error adding gadget:', error);
        alert('Failed to add gadget');
    }
}

async function updateGadgetStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/gadgets/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadGadgets();
        } else {
            throw new Error('Failed to update gadget');
        }
    } catch (error) {
        console.error('Error updating gadget:', error);
        alert('Failed to update gadget');
    }
}

function showPopup(title, message, onConfirm) {
    const overlay = document.getElementById('popupOverlay');
    const titleEl = document.getElementById('popupTitle');
    const messageEl = document.getElementById('popupMessage');
    const confirmBtn = document.getElementById('popupConfirm');
    const cancelBtn = document.getElementById('popupCancel');

    titleEl.textContent = title;
    messageEl.textContent = message;
    overlay.style.display = 'flex';

    confirmBtn.onclick = () => {
        overlay.style.display = 'none';
        onConfirm();
    };

    cancelBtn.onclick = () => {
        overlay.style.display = 'none';
    };
}

async function selfDestruct(id) {
    showPopup(
        'Self Destruct Confirmation',
        'Are you sure you want to initiate self-destruct sequence? This action cannot be undone.',
        async () => {
            try {
                const response = await fetch(`${API_URL}/gadgets/${id}/self-destruct`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    showPopup('Self Destruct Initiated', `Confirmation Code: ${data.confirmationCode}`, () => {
                        loadGadgets();
                    });
                } else {
                    throw new Error('Failed to initiate self-destruct');
                }
            } catch (error) {
                console.error('Error initiating self-destruct:', error);
                showPopup('Error', 'Failed to initiate self-destruct sequence', () => {});
            }
        }
    );
}

async function decommissionGadget(id) {
    showPopup(
        'Decommission Confirmation',
        'Are you sure you want to decommission this gadget? This action cannot be undone.',
        async () => {
            try {
                const response = await fetch(`${API_URL}/gadgets/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    loadGadgets();
                } else {
                    throw new Error('Failed to decommission gadget');
                }
            } catch (error) {
                console.error('Error decommissioning gadget:', error);
                showPopup('Error', 'Failed to decommission gadget', () => {});
            }
        }
    );
}

function filterGadgets() {
    const status = document.getElementById('statusFilter').value;
    loadGadgets(status);
}
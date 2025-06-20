// AI-Powered Menstrual Health Tracker JavaScript

// Global state
let currentUser = null;
let isAuthenticated = false;
let currentDate = new Date();
let selectedDate = null;
let currentFlow = 'medium';

// Sample data from JSON
const sampleData = {
  "sampleUser": {
    "name": "Sarah Johnson",
    "age": 26,
    "email": "sarah@example.com",
    "joinDate": "2024-01-15",
    "currentCycleDay": 12,
    "averageCycleLength": 28,
    "lastPeriod": "2024-06-08",
    "nextPeriodPrediction": "2024-07-06"
  },
  "cycleData": [
    {"date": "2024-06-08", "type": "period_start", "flow": "medium"},
    {"date": "2024-06-09", "type": "period", "flow": "heavy"},
    {"date": "2024-06-10", "type": "period", "flow": "heavy"},
    {"date": "2024-06-11", "type": "period", "flow": "medium"},
    {"date": "2024-06-12", "type": "period_end", "flow": "light"},
    {"date": "2024-06-22", "type": "ovulation", "flow": null},
    {"date": "2024-05-11", "type": "period_start", "flow": "medium"},
    {"date": "2024-05-12", "type": "period", "flow": "heavy"},
    {"date": "2024-05-13", "type": "period", "flow": "medium"},
    {"date": "2024-05-14", "type": "period", "flow": "light"},
    {"date": "2024-05-15", "type": "period_end", "flow": "light"}
  ],
  "symptoms": [
    {"date": "2024-06-08", "cramps": 7, "mood": "irritable", "acne": 3, "weight": 65.2, "notes": "Severe cramps in morning"},
    {"date": "2024-06-09", "cramps": 5, "mood": "sad", "acne": 3, "weight": 65.4, "notes": "Feeling bloated"},
    {"date": "2024-06-10", "cramps": 3, "mood": "neutral", "acne": 2, "weight": 65.1, "notes": "Much better today"},
    {"date": "2024-06-11", "cramps": 2, "mood": "happy", "acne": 2, "weight": 64.9, "notes": "Energy returning"},
    {"date": "2024-06-12", "cramps": 1, "mood": "happy", "acne": 1, "weight": 64.8, "notes": "Back to normal"}
  ],
  "pcosRisk": {
    "score": 0.35,
    "level": "Moderate",
    "factors": ["Irregular cycles occasionally", "Mild acne", "Some weight fluctuation"],
    "recommendations": ["Track cycles consistently", "Monitor symptoms", "Consider consulting healthcare provider"]
  },
  "chatMessages": [
    {"text": "Hello! I'm your personal health assistant. How can I help you today?", "isBot": true, "timestamp": "2024-06-20T10:00:00Z"},
    {"text": "I'm having severe cramps. What can I do?", "isBot": false, "timestamp": "2024-06-20T10:01:00Z"},
    {"text": "I understand cramps can be very uncomfortable. Here are some proven methods to help: 1) Apply heat to your lower abdomen, 2) Try gentle exercise like walking, 3) Stay hydrated, 4) Consider over-the-counter pain relievers like ibuprofen. If cramps are severe or interfere with daily activities, please consult your healthcare provider.", "isBot": true, "timestamp": "2024-06-20T10:01:30Z"}
  ],
  "predictions": {
    "nextPeriod": "2024-07-06",
    "ovulationWindow": "2024-06-22 to 2024-06-24",
    "fertileWindow": "2024-06-20 to 2024-06-26",
    "cycleLength": 28,
    "confidence": 0.89
  },
  "analytics": {
    "cycleLengths": [28, 29, 27, 28, 30, 28, 27],
    "symptomTrends": {
      "cramps": [7, 5, 3, 2, 1],
      "mood": ["irritable", "sad", "neutral", "happy", "happy"],
      "acne": [3, 3, 2, 2, 1]
    },
    "weightTrend": [65.2, 65.4, 65.1, 64.9, 64.8]
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateDashboard();
    initializeCharts();
    loadChatMessages();
    setupSymptomSliders();
    generateCalendar();
});

function initializeApp() {
    // Set current date for symptom tracking
    const today = new Date().toISOString().split('T')[0];
    const symptomDateInput = document.getElementById('symptomDate');
    if (symptomDateInput) {
        symptomDateInput.value = today;
    }
}

function setupEventListeners() {
    // Auth form submission
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }

    // Auth switching
    const authSwitchLink = document.getElementById('authSwitchLink');
    if (authSwitchLink) {
        authSwitchLink.addEventListener('click', (e) => {
            e.preventDefault();
            const isLogin = document.getElementById('authTitle').textContent === 'Login';
            toggleAuthMode(!isLogin);
        });
    }

    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Flow selector buttons
    const flowBtns = document.querySelectorAll('.flow-btn');
    flowBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            flowBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFlow = btn.dataset.flow;
        });
    });
}

// Authentication Functions
function showAuth(type) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmit');
    const nameGroup = document.getElementById('nameGroup');
    const switchText = document.getElementById('authSwitchText');
    const switchLink = document.getElementById('authSwitchLink');

    if (type === 'login') {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        nameGroup.style.display = 'none';
        switchText.innerHTML = 'Don\'t have an account? ';
        switchLink.textContent = 'Register here';
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        nameGroup.style.display = 'block';
        switchText.innerHTML = 'Already have an account? ';
        switchLink.textContent = 'Login here';
    }

    modal.classList.add('show');
}

function toggleAuthMode(isLogin) {
    showAuth(isLogin ? 'login' : 'register');
}

function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName').value;
    const isLogin = document.getElementById('authTitle').textContent === 'Login';

    // Simple validation
    if (!email || !password || (!isLogin && !name)) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Simulate authentication
    currentUser = {
        email: email,
        name: isLogin ? sampleData.sampleUser.name : name,
        ...sampleData.sampleUser
    };
    
    isAuthenticated = true;
    closeModal();
    
    if (!isLogin) {
        showOnboarding();
    } else {
        showApp();
    }
    
    showToast(`Welcome ${currentUser.name}!`, 'success');
}

function showOnboarding() {
    const modal = document.getElementById('onboardingModal');
    modal.classList.add('show');
}

function completeOnboarding() {
    const age = document.getElementById('userAge').value;
    const cycleLength = document.getElementById('cycleLength').value;
    const lastPeriod = document.getElementById('lastPeriod').value;

    if (!age || !lastPeriod) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Update user data
    currentUser.age = parseInt(age);
    currentUser.averageCycleLength = parseInt(cycleLength);
    currentUser.lastPeriod = lastPeriod;

    closeModal();
    showApp();
    showToast('Setup completed! Welcome to FlowAI', 'success');
}

function logout() {
    currentUser = null;
    isAuthenticated = false;
    showSection('landing');
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('registerBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('dashboardLink').style.display = 'none';
    showToast('Logged out successfully', 'info');
}

function showApp() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('dashboardLink').style.display = 'inline-block';
    
    // Update dashboard with user data
    updateDashboard();
}

// Navigation Functions
function showSection(sectionName) {
    if (sectionName === 'landing') {
        document.getElementById('landing').style.display = 'block';
        document.getElementById('app').style.display = 'none';
    } else if (sectionName === 'dashboard' && isAuthenticated) {
        showApp();
    }
}

function showAppSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar navigation
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Section-specific initialization
    if (sectionName === 'analytics') {
        setTimeout(() => initializeCharts(), 100);
    } else if (sectionName === 'calendar') {
        generateCalendar();
    } else if (sectionName === 'chatbot') {
        loadChatMessages();
    }
}

// Dashboard Functions
function updateDashboard() {
    if (!currentUser) return;

    // Update current day
    const currentDayElement = document.getElementById('currentDay');
    if (currentDayElement) {
        currentDayElement.textContent = currentUser.currentCycleDay;
    }

    // Update current phase
    const phase = getCurrentPhase(currentUser.currentCycleDay);
    const currentPhaseElement = document.getElementById('currentPhase');
    if (currentPhaseElement) {
        currentPhaseElement.textContent = phase.name;
    }

    // Update next event
    const nextEventElement = document.getElementById('nextEvent');
    if (nextEventElement) {
        nextEventElement.textContent = phase.nextEvent;
    }

    // Update predictions
    const nextPeriodElement = document.getElementById('nextPeriodDate');
    if (nextPeriodElement) {
        const date = new Date(sampleData.predictions.nextPeriod);
        nextPeriodElement.textContent = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    const ovulationElement = document.getElementById('ovulationDate');
    if (ovulationElement) {
        ovulationElement.textContent = sampleData.predictions.ovulationWindow;
    }

    // Update recent symptoms
    updateRecentSymptoms();
}

function getCurrentPhase(cycleDay) {
    if (cycleDay <= 5) {
        return {
            name: 'Menstrual Phase',
            nextEvent: 'Follicular phase starting soon'
        };
    } else if (cycleDay <= 13) {
        return {
            name: 'Follicular Phase',
            nextEvent: `Ovulation in ${14 - cycleDay} days`
        };
    } else if (cycleDay <= 16) {
        return {
            name: 'Ovulation Phase',
            nextEvent: 'Most fertile time!'
        };
    } else {
        return {
            name: 'Luteal Phase',
            nextEvent: `Next period in ${28 - cycleDay} days`
        };
    }
}

function updateRecentSymptoms() {
    const container = document.getElementById('recentSymptoms');
    if (!container || !sampleData.symptoms.length) return;

    const recentSymptom = sampleData.symptoms[0];
    container.innerHTML = `
        <div class="symptom-item">
            <span class="symptom-name">Cramps</span>
            <div class="symptom-scale">
                <div class="scale-fill" style="width: ${(recentSymptom.cramps / 10) * 100}%"></div>
            </div>
            <span class="symptom-value">${recentSymptom.cramps}/10</span>
        </div>
        <div class="symptom-item">
            <span class="symptom-name">Mood</span>
            <span class="symptom-value">${recentSymptom.mood}</span>
        </div>
        <div class="symptom-item">
            <span class="symptom-name">Acne</span>
            <div class="symptom-scale">
                <div class="scale-fill" style="width: ${(recentSymptom.acne / 10) * 100}%"></div>
            </div>
            <span class="symptom-value">${recentSymptom.acne}/10</span>
        </div>
    `;
}

function logPeriodStart() {
    const today = new Date().toISOString().split('T')[0];
    showToast('Period start logged for today', 'success');
    // In a real app, this would update the calendar and data
    generateCalendar();
}

// Calendar Functions
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarMonth = document.getElementById('calendarMonth');
    
    if (!calendarGrid || !calendarMonth) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    calendarMonth.textContent = now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Clear calendar
    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header-cell';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyCell);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        // Check if this is today
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate()) {
            dayCell.classList.add('today');
        }

        // Check for cycle events
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cycleEvent = sampleData.cycleData.find(event => event.date === dateStr);
        
        if (cycleEvent) {
            if (cycleEvent.type.includes('period')) {
                dayCell.classList.add('period');
                dayCell.title = `Period - ${cycleEvent.flow} flow`;
            } else if (cycleEvent.type === 'ovulation') {
                dayCell.classList.add('ovulation');
                dayCell.title = 'Ovulation';
            }
        }

        // Add fertile window (example)
        if (day >= 20 && day <= 26) {
            if (!dayCell.classList.contains('period') && !dayCell.classList.contains('ovulation')) {
                dayCell.classList.add('fertile');
                dayCell.title = 'Fertile window';
            }
        }

        // Add click handler
        dayCell.addEventListener('click', () => selectCalendarDay(dateStr, dayCell));
        
        calendarGrid.appendChild(dayCell);
    }
}

function selectCalendarDay(dateStr, dayCell) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    dayCell.classList.add('selected');
    selectedDate = dateStr;
    
    // Show period controls if not already marked
    const periodControls = document.querySelector('.period-controls');
    if (periodControls) {
        periodControls.style.display = 'block';
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar();
}

// Symptom Tracking Functions
function setupSymptomSliders() {
    const sliders = document.querySelectorAll('.symptom-slider');
    sliders.forEach(slider => {
        const valueDisplay = slider.parentNode.querySelector('.slider-value');
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
            
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        }
    });
}

function saveSymptoms() {
    const date = document.getElementById('symptomDate').value;
    const cramps = document.getElementById('cramps').value;
    const bloating = document.getElementById('bloating').value;
    const headache = document.getElementById('headache').value;
    const fatigue = document.getElementById('fatigue').value;
    const mood = document.getElementById('mood').value;
    const stress = document.getElementById('stress').value;
    const acne = document.getElementById('acne').value;
    const hairLoss = document.getElementById('hairLoss').value;
    const weight = document.getElementById('weight').value;
    const notes = document.getElementById('symptomNotes').value;

    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }

    const symptomData = {
        date,
        cramps: parseInt(cramps),
        bloating: parseInt(bloating),
        headache: parseInt(headache),
        fatigue: parseInt(fatigue),
        mood,
        stress: parseInt(stress),
        acne: parseInt(acne),
        hairLoss: parseInt(hairLoss),
        weight: parseFloat(weight),
        notes
    };

    // In a real app, this would save to backend
    console.log('Saving symptoms:', symptomData);
    showToast('Symptoms saved successfully!', 'success');
    
    // Reset form
    document.getElementById('symptomDate').value = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.symptom-slider').forEach(slider => {
        slider.value = 0;
        const valueDisplay = slider.parentNode.querySelector('.slider-value');
        if (valueDisplay) valueDisplay.textContent = '0';
    });
    document.getElementById('mood').value = 'happy';
    document.getElementById('weight').value = '';
    document.getElementById('symptomNotes').value = '';
}

// PCOS Assessment Functions
function updatePCOSRisk() {
    const cycleRegularity = document.getElementById('cycleRegularity').value;
    const excessHair = document.getElementById('excessHair').value;
    const acneSeverity = document.getElementById('acneSeverity').value;
    const weightIssues = document.getElementById('weightIssues').value;

    // Simple risk calculation (in a real app, this would be more sophisticated)
    let riskScore = 0;
    
    const scores = {
        'regular': 0, 'somewhat': 10, 'irregular': 25, 'very-irregular': 40,
        'none': 0, 'mild': 15, 'moderate': 30, 'severe': 45
    };

    riskScore += scores[cycleRegularity] || 0;
    riskScore += scores[excessHair] || 0;
    riskScore += scores[acneSeverity] || 0;
    riskScore += scores[weightIssues] || 0;

    const riskLevel = riskScore < 20 ? 'Low' : riskScore < 50 ? 'Moderate' : 'High';
    
    // Update display
    const scoreCircle = document.querySelector('.score-fill');
    const scoreNumber = document.querySelector('.score-number');
    const scoreLabel = document.querySelector('.score-label');
    
    if (scoreCircle && scoreNumber && scoreLabel) {
        scoreCircle.dataset.score = riskScore;
        scoreNumber.textContent = `${riskScore}%`;
        scoreLabel.textContent = `${riskLevel} Risk`;
    }

    showToast(`PCOS risk updated: ${riskLevel} (${riskScore}%)`, 'info');
}

// Chat Functions
function loadChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    
    sampleData.chatMessages.forEach(message => {
        addChatMessage(message.text, message.isBot, new Date(message.timestamp));
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addChatMessage(text, isBot = false, timestamp = new Date()) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
    
    const timeStr = timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.innerHTML = `
        <div class="chat-avatar">${isBot ? '🤖' : '👤'}</div>
        <div class="chat-content">
            <div class="chat-bubble">${text}</div>
            <div class="chat-timestamp">${timeStr}</div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput || !chatInput.value.trim()) return;

    const message = chatInput.value.trim();
    chatInput.value = '';

    // Add user message
    addChatMessage(message, false);

    // Simulate bot response
    setTimeout(() => {
        const response = generateBotResponse(message);
        addChatMessage(response, true);
    }, 1000);
}

function askQuickQuestion(topic) {
    const questions = {
        'cramps': 'How can I manage menstrual cramps?',
        'pcos': 'What should I know about PCOS?',
        'nutrition': 'What foods are good for menstrual health?'
    };

    const question = questions[topic];
    if (question) {
        document.getElementById('chatInput').value = question;
        sendMessage();
    }
}

function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('cramp')) {
        return "For menstrual cramps, try: 1) Heat therapy (heating pad or warm bath), 2) Gentle exercise like yoga, 3) Stay hydrated, 4) Anti-inflammatory medication like ibuprofen, 5) Magnesium supplements. If pain is severe, consult your healthcare provider.";
    } else if (message.includes('pcos')) {
        return "PCOS (Polycystic Ovary Syndrome) affects 5-10% of women. Common symptoms include irregular periods, weight gain, acne, and excess hair growth. Early detection and management through diet, exercise, and medical care can help manage symptoms effectively.";
    } else if (message.includes('nutrition') || message.includes('food')) {
        return "For menstrual health, focus on: 1) Iron-rich foods (leafy greens, lean meats), 2) Omega-3 fatty acids (fish, walnuts), 3) Complex carbohydrates, 4) Calcium and magnesium, 5) Stay hydrated. Limit caffeine, alcohol, and processed foods during your period.";
    } else if (message.includes('period') || message.includes('cycle')) {
        return "A normal menstrual cycle is 21-35 days long, with periods lasting 3-7 days. Track your cycle to identify patterns. Irregular cycles can indicate hormonal imbalances - consult a healthcare provider if you notice significant changes.";
    } else {
        return "I'm here to help with your menstrual health questions! You can ask me about periods, PCOS, nutrition, symptoms, or general women's health topics. Please remember that I provide general information and cannot replace professional medical advice.";
    }
}

// Analytics Functions
function initializeCharts() {
    initializeCycleLengthChart();
    initializeSymptomChart();
    initializeWeightChart();
}

function initializeCycleLengthChart() {
    const ctx = document.getElementById('cycleLengthChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4', 'Cycle 5', 'Cycle 6', 'Cycle 7'],
            datasets: [{
                label: 'Cycle Length (days)',
                data: sampleData.analytics.cycleLengths,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 25,
                    max: 32
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeSymptomChart() {
    const ctx = document.getElementById('symptomChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Cramps Intensity',
                data: sampleData.analytics.symptomTrends.cramps,
                backgroundColor: '#FFC185',
                borderColor: '#FFB366',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeWeightChart() {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Weight (kg)',
                data: sampleData.analytics.weightTrend,
                borderColor: '#B4413C',
                backgroundColor: 'rgba(180, 65, 60, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 64,
                    max: 66
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function exportData() {
    const data = {
        user: currentUser,
        cycleData: sampleData.cycleData,
        symptoms: sampleData.symptoms,
        pcosRisk: sampleData.pcosRisk,
        predictions: sampleData.predictions
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-data-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Health data exported successfully!', 'success');
}

// Settings Functions
function saveSettings() {
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const age = document.getElementById('settingsAge').value;
    const cycleLength = document.getElementById('settingsCycleLength').value;
    const periodLength = document.getElementById('settingsPeriodLength').value;

    if (currentUser) {
        currentUser.name = name;
        currentUser.email = email;
        currentUser.age = parseInt(age);
        currentUser.averageCycleLength = parseInt(cycleLength);
        currentUser.periodLength = parseInt(periodLength);
    }

    showToast('Settings saved successfully!', 'success');
}

function clearData() {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
        // In a real app, this would clear user data from backend
        showToast('All data cleared successfully', 'info');
    }
}

// Utility Functions
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up modal close functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Initialize with sample data for demo
    setTimeout(() => {
        currentUser = sampleData.sampleUser;
        isAuthenticated = true;
        // Don't auto-show app, let user authenticate first
    }, 100);
});
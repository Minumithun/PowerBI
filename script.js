// Game State Management
let gameState = {
    playerName: '',
    totalPoints: 0,
    badges: {
        data: false,
        visual: false,
        design: false,
        interactive: false,
        publisher: false
    },
    moduleProgress: {
        data: 0,
        visual: 0,
        format: 0,
        interactive: 0,
        publish: 0
    },
    completedSteps: new Set(),
    gameCompleted: false,
    completionDate: null
};

// Module Configuration
const moduleConfig = {
    data: { steps: 4, points: 25, badge: 'data' },
    visual: { steps: 5, points: 50, badge: 'visual' },
    format: { steps: 4, points: 30, badge: 'design' },
    interactive: { steps: 3, points: 75, badge: 'interactive' },
    publish: { steps: 3, points: 40, badge: 'publisher' }
};

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Power BI Quest Loading...');
    initializeGame();
});

function initializeGame() {
    loadGameState();
    setupEventListeners();
    updateAllUI();
    showNotification('Welcome to Power BI Quest! 🎮', 'success');
    console.log('✅ Game initialized successfully');
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const module = this.getAttribute('data-module');
            switchModule(module);
        });
    });

    // Player name input
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput) {
        playerNameInput.addEventListener('input', function() {
            gameState.playerName = this.value;
            saveGameState();
        });
        
        if (gameState.playerName) {
            playerNameInput.value = gameState.playerName;
        }
    }

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', showResetConfirmation);

    // Certificate button
    document.getElementById('certificateBtn').addEventListener('click', showCertificateModal);

    console.log('✅ Event listeners setup complete');
}

// Module Navigation
function switchModule(moduleId) {
    console.log(`🔄 Switching to module: ${moduleId}`);
    
    // Hide all modules
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    // Show target module
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-module="${moduleId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Step Completion
function completeStep(button) {
    const step = button.closest('.step');
    const stepNumber = step.getAttribute('data-step');
    const moduleType = step.getAttribute('data-module');
    const stepId = `${moduleType}-${stepNumber}`;
    
    // Check if already completed
    if (gameState.completedSteps.has(stepId)) {
        showNotification('Step already completed! ✅', 'success');
        return;
    }
    
    // Mark step as completed
    gameState.completedSteps.add(stepId);
    step.classList.add('completed');
    
    // Add points
    const points = moduleConfig[moduleType]?.points || 25;
    gameState.totalPoints += points;
    
    // Update module progress
    gameState.moduleProgress[moduleType]++;
    
    // Show points notification
    showNotification(`+${points} points earned! 🌟`, 'points');
    
    // Check for badge unlock
    checkBadgeUnlock(moduleType);
    
    // Update UI
    updateAllUI();
    
    // Save progress
    saveGameState();
    
    // Check game completion
    checkGameCompletion();
    
    console.log(`✅ Step completed: ${stepId}, Points: ${points}`);
}

// Badge System
function checkBadgeUnlock(moduleType) {
    const config = moduleConfig[moduleType];
    if (!config) return;
    
    const progress = gameState.moduleProgress[moduleType];
    const required = config.steps;
    
    if (progress >= required && !gameState.badges[config.badge]) {
        unlockBadge(config.badge);
    }
}

function unlockBadge(badgeId) {
    gameState.badges[badgeId] = true;
    
    const badgeElement = document.getElementById(`badge-${badgeId}`);
    if (badgeElement) {
        badgeElement.classList.remove('locked');
        badgeElement.classList.add('unlocked');
    }
    
    // Show badge unlock notification
    const badgeNames = {
        data: 'Data Master',
        visual: 'Visual Expert',
        design: 'Design Guru',
        interactive: 'Interactive Pro',
        publisher: 'Publishing Hero'
    };
    
    showNotification(`🏆 Badge Unlocked: ${badgeNames[badgeId]}!`, 'success');
    
    // Show module success message
    const successElement = document.getElementById(`${badgeId}Success`);
    if (successElement) {
        successElement.style.display = 'block';
    }
    
    // Create confetti effect
    createConfetti();
    
    console.log(`🏆 Badge unlocked: ${badgeId}`);
}

// UI Updates
function updateAllUI() {
    updatePointsDisplay();
    updateBadgesDisplay();
    updateProgressDisplay();
    updateModuleProgress();
    updateCertificateButton();
}

function updatePointsDisplay() {
    document.getElementById('totalPoints').textContent = gameState.totalPoints;
    document.getElementById('finalPoints').textContent = gameState.totalPoints;
}

function updateBadgesDisplay() {
    const unlockedCount = Object.values(gameState.badges).filter(badge => badge).length;
    document.getElementById('badgeCount').textContent = unlockedCount;
    
    // Update badge appearances
    Object.keys(gameState.badges).forEach(badgeId => {
        const badgeElement = document.getElementById(`badge-${badgeId}`);
        if (badgeElement) {
            if (gameState.badges[badgeId]) {
                badgeElement.classList.remove('locked');
                badgeElement.classList.add('unlocked');
            }
        }
    });
}

function updateProgressDisplay() {
    const totalSteps = Object.values(moduleConfig).reduce((sum, config) => sum + config.steps, 0);
    const completedSteps = gameState.completedSteps.size;
    const progressPercentage = (completedSteps / totalSteps) * 100;
    
    document.getElementById('overallProgress').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${Math.round(progressPercentage)}% Complete`;
}

function updateModuleProgress() {
    Object.keys(moduleConfig).forEach(moduleType => {
        const config = moduleConfig[moduleType];
        const progress = gameState.moduleProgress[moduleType];
        const percentage = (progress / config.steps) * 100;
        
        // Update progress bar
        const progressBar = document.getElementById(`${moduleType}Progress`);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        // Update status text
        const statusElement = document.getElementById(`${moduleType}Status`);
        if (statusElement) {
            statusElement.textContent = `${progress}/${config.steps} Steps Complete`;
        }
    });
}

function updateCertificateButton() {
    const allBadgesUnlocked = Object.values(gameState.badges).every(badge => badge);
    const hasName = gameState.playerName && gameState.playerName.trim();
    const certificateBtn = document.getElementById('certificateBtn');
    
    if (certificateBtn) {
        if (allBadgesUnlocked && hasName) {
            certificateBtn.style.display = 'flex';
        } else {
            certificateBtn.style.display = 'none';
        }
    }
}

// Game Completion Check
function checkGameCompletion() {
    const allBadgesUnlocked = Object.values(gameState.badges).every(badge => badge);
    
    if (allBadgesUnlocked && !gameState.gameCompleted) {
        gameState.gameCompleted = true;
        gameState.completionDate = new Date().toISOString();
        
        // Show final celebration
        const finalCelebration = document.getElementById('finalCelebration');
        if (finalCelebration) {
            finalCelebration.style.display = 'block';
        }
        
        // Massive confetti
        for (let i = 0; i < 50; i++) {
            setTimeout(() => createConfetti(), i * 100);
        }
        
        showNotification('🎉 Quest Completed! You are now a Power BI Master!', 'success');
        saveGameState();
    }
}

// Visual Effects
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a0e7e5'];
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'fixed';
        confetti.style.zIndex = '1000';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 3000);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Reset Functionality
function showResetConfirmation() {
    const confirmed = confirm(
        '🔄 Are you sure you want to reset your game progress?\n\n' +
        'This will:\n' +
        '• Reset all points to 0\n' +
        '• Remove all badges\n' +
        '• Mark all steps as incomplete\n' +
        '• Clear completion status\n\n' +
        'This action cannot be undone!'
    );
    
    if (confirmed) {
        resetGame();
    }
}

function resetGame() {
    // Reset game state
    gameState = {
        playerName: document.getElementById('playerName').value || '',
        totalPoints: 0,
        badges: {
            data: false,
            visual: false,
            design: false,
            interactive: false,
            publisher: false
        },
        moduleProgress: {
            data: 0,
            visual: 0,
            format: 0,
            interactive: 0,
            publish: 0
        },
        completedSteps: new Set(),
        gameCompleted: false,
        completionDate: null
    };
    
    // Reset UI elements
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('completed');
    });
    
    document.querySelectorAll('.badge').forEach(badge => {
        badge.classList.remove('unlocked');
        badge.classList.add('locked');
    });
    
    document.querySelectorAll('.success-box').forEach(box => {
        box.style.display = 'none';
    });
    
    const finalCelebration = document.getElementById('finalCelebration');
    if (finalCelebration) {
        finalCelebration.style.display = 'none';
    }
    
    // Update UI and save
    updateAllUI();
    saveGameState();
    
    // Go to overview
    switchModule('overview');
    
    showNotification('🎮 Game reset successfully! Start your quest again!', 'success');
    console.log('🔄 Game reset completed');
}

// Save/Load System
function saveGameState() {
    try {
        const stateToSave = {
            ...gameState,
            completedSteps: Array.from(gameState.completedSteps)
        };
        localStorage.setItem('powerbi-quest-state', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

function loadGameState() {
    try {
        const savedState = localStorage.getItem('powerbi-quest-state');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            gameState = {
                ...gameState,
                ...parsedState,
                completedSteps: new Set(parsedState.completedSteps || [])
            };
            
            // Restore completed steps visually
            gameState.completedSteps.forEach(stepId => {
                const [moduleType, stepNumber] = stepId.split('-');
                const stepElement = document.querySelector(`[data-step="${stepNumber}"][data-module="${moduleType}"]`);
                if (stepElement) {
                    stepElement.classList.add('completed');
                }
            });
            
            console.log('✅ Game state loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
    }
}

// Certificate System
function showCertificateModal() {
    if (!gameState.playerName || !gameState.playerName.trim()) {
        alert('Please enter your name in the header to generate your certificate!');
        document.getElementById('playerName').focus();
        return;
    }
    
    if (!Object.values(gameState.badges).every(badge => badge)) {
        alert('Complete all modules and earn all badges to unlock your certificate!');
        return;
    }
    
    // Update certificate content
    document.getElementById('certificateName').textContent = gameState.playerName;
    document.getElementById('certificateDate').textContent = new Date().toLocaleDateString();
    document.getElementById('certificateScore').textContent = gameState.totalPoints + ' Points';
    
    // Show modal
    document.getElementById('certificateModal').style.display = 'flex';
}

function closeCertificateModal() {
    document.getElementById('certificateModal').style.display = 'none';
}

function generateCertificate() {
    if (!gameState.playerName || !gameState.playerName.trim()) {
        alert('Please enter your name in the header first!');
        return;
    }
    
    showCertificateModal();
}

function downloadCertificateAsPDF() {
    if (typeof window.jsPDF === 'undefined') {
        alert('PDF library not loaded. Please try refreshing the page.');
        return;
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // Background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.setFont(undefined, 'bold');
    doc.text('🏆 CERTIFICATE OF COMPLETION 🏆', 148.5, 40, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(52, 152, 219);
    doc.text('Power BI Dashboard Mastery Quest', 148.5, 50, { align: 'center' });
    
    // Main content
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.setFont(undefined, 'normal');
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });
    
    // Name
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(231, 76, 60);
    doc.text(gameState.playerName.toUpperCase(), 148.5, 85, { align: 'center' });
    
    // Achievement text
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text('has successfully completed the Power BI Dashboard Mastery Quest', 148.5, 100, { align: 'center' });
    doc.text('and has demonstrated proficiency in dashboard creation', 148.5, 110, { align: 'center' });
    
    // Skills
    doc.setFontSize(10);
    doc.setTextColor(39, 174, 96);
    const skills = [
        '✓ Data Connection & Import',
        '✓ Professional Visualizations',
        '✓ Dashboard Design & Formatting',
        '✓ Interactive Elements & Filtering',
        '✓ Publishing & Sharing',
        '✓ HR Analytics Best Practices'
    ];
    
    let yPos = 130;
    for (let i = 0; i < skills.length; i += 2) {
        doc.text(skills[i], 60, yPos);
        if (skills[i + 1]) {
            doc.text(skills[i + 1], 180, yPos);
        }
        yPos += 8;
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(44, 62, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 180);
    doc.text(`Score: ${gameState.totalPoints} Points`, 200, 180);
    doc.text('Power BI Quest Certification Program', 148.5, 190, { align: 'center' });
    
    // Download
    doc.save(`PowerBI_Certificate_${gameState.playerName.replace(/\s+/g, '_')}.pdf`);
}

function downloadCertificateAsImage() {
    // Create canvas for certificate image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 CERTIFICATE OF COMPLETION 🏆', canvas.width / 2, 120);
    
    // Subtitle
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Power BI Dashboard Mastery Quest', canvas.width / 2, 160);
    
    // Main text
    ctx.fillStyle = '#2c3e50';
    ctx.font = '20px Arial';
    ctx.fillText('This is to certify that', canvas.width / 2, 220);
    
    // Name
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(gameState.playerName.toUpperCase(), canvas.width / 2, 280);
    
    // Achievement
    ctx.fillStyle = '#2c3e50';
    ctx.font = '20px Arial';
    ctx.fillText('has successfully completed the Power BI Dashboard Mastery Quest', canvas.width / 2, 340);
    
    // Skills
    ctx.fillStyle = '#27ae60';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    const skills = [
        '✓ Data Connection & Import',
        '✓ Professional Visualizations',
        '✓ Dashboard Design & Formatting',
        '✓ Interactive Elements & Filtering',
        '✓ Publishing & Sharing',
        '✓ HR Analytics Best Practices'
    ];
    
    let yPos = 420;
    for (let i = 0; i < skills.length; i += 2) {
        ctx.fillText(skills[i], 200, yPos);
        if (skills[i + 1]) {
            ctx.fillText(skills[i + 1], 650, yPos);
        }
        yPos += 30;
    }
    
    // Footer
    ctx.fillStyle = '#2c3e50';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 300, 680);
    ctx.fillText(`Score: ${gameState.totalPoints} Points`, 900, 680);
    ctx.fillText('Power BI Quest Certification Program', canvas.width / 2, 720);
    
    // Download
    const link = document.createElement('a');
    link.download = `PowerBI_Certificate_${gameState.playerName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Auto-save every 30 seconds
setInterval(saveGameState, 30000);

// Save when page is about to unload
window.addEventListener('beforeunload', saveGameState);

console.log('🎮 Power BI Quest Script Loaded Successfully! 🚀');

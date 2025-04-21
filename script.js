// Category suggestions for different tabs
const categorySuggestions = {
    "operations": [
        { text: "Track metrics & run analysis", query: "Update the QBR with the most recent metrics" },
        { text: "Document our processes", query: "Create processes based on our most recent onboarding calls" },
        { text: "Aggregate customer feedback", query: "Can aggregate customer feedback and prioritize it for the product team" }
    ],
    "product": [
        { text: "Aggregate customer insights", query: "What customer feedback haven't we actioned yet?" },
        { text: "Research and draft PRD", query: "Do some research then turn our product jam into a PRD" },
        { text: "Create JIRA tickets", query: "File the bugs we just discussed in the Standup meeting" }
    ],
    "engineering": [
        { text: "Chat with codebase", query: "What are the potential security vulnerabilities in our user data handling?" },
        { text: "Draft PRs in GitHub based on Jira tickets", query: "Triage our high priority bug tickets and draft a PR for each" },
        { text: "Write context-aware code", query: "Create a unified validation function referencing our security best practices" }
    ],
    "marketing": [
        { text: "Generate content", query: "Create landing page copy based on our most recent product releases" },
        { text: "Do market research", query: "Research how to position this release against similar offerings in market" },
        { text: "Analyze campaigns", query: "Analyze the impact that this campaign had on key business metrics" }
    ],
    "sales": [
        { text: "Score sales calls", query: "Score my team's 10 most recent sales calls" },
        { text: "Research today's prospects", query: "Research how today's prospects could use our product" },
        { text: "Draft follow-up email", query: "Draft follow ups for today's calls" }
    ],
    "customer-success": [
        { text: "Analyze Customer Conversations", query: "What are our most common support ticket issues this month?" },
        { text: "Track Customer Satisfaction", query: "Highlight any concerning trends in CSAT scores" },
        { text: "Support Team Performance", query: "Show resolution rates for each support agent" }
    ],
    "leadership": [
        { text: "Generate team updates", query: "Create a summary of what different teams got done this week" },
        { text: "Analyze company-wide trends", query: "What is slowing down our engineering team?" },
        { text: "Track OKRs & projects", query: "Analyze our progress towards Q1 OKRs" }
    ],
    "hr-people": [
        { text: "Draft team reviews", query: "Write comprehensive perf reviews by synthesizing last quarter's work and feedback" },
        { text: "Onboard a new hire", query: "Draft an onboarding plan for a front-end engineer" },
        { text: "Analyze recruiting funnel", query: "Track our funnel metrics. Where and why are we losing candidates?" }
    ]
};

// Global variables
let currentTypeInterval = null;
let currentBackspaceInterval = null;
let isTypingInProgress = false;
let cycleTimeout = null;

// Function to update the suggested tasks based on the category
function updateSuggestedTasks(category) {
    const suggestions = categorySuggestions[category] || categorySuggestions["engineering"];
    const taskList = document.querySelector('.task-list');
    
    if (!taskList) return;
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Add new tasks
    suggestions.forEach(suggestion => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        
        const title = document.createElement('h3');
        title.textContent = suggestion.text;
        
        taskCard.appendChild(title);
        
        // Add click event to fill the search input with the full query
        taskCard.addEventListener('click', () => {
            fillSearch(suggestion.query);
        });
        
        taskList.appendChild(taskCard);
    });
}

// Function to fill the search input with animation
function fillSearch(query) {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    // Clear any ongoing animations
    if (currentBackspaceInterval) {
        clearInterval(currentBackspaceInterval);
        currentBackspaceInterval = null;
    }
    if (currentTypeInterval) {
        clearInterval(currentTypeInterval);
        currentTypeInterval = null;
    }
    if (cycleTimeout) {
        clearTimeout(cycleTimeout);
        cycleTimeout = null;
    }
    
    // Set typing state
    isTypingInProgress = true;
    
    // Get current text
    const currentText = searchInput.value.replace('|', '');
    let currentLength = currentText.length;

    // First backspace the existing text
    if (currentLength > 0) {
        currentBackspaceInterval = setInterval(() => {
            if (currentLength > 0) {
                currentLength--;
                searchInput.value = currentText.substring(0, currentLength) + '|';
            } else {
                clearInterval(currentBackspaceInterval);
                currentBackspaceInterval = null;
                
                // Start typing the new text after a small delay
                setTimeout(() => startTypingNewText(query, searchInput), 80);
            }
        }, 12); // Smooth backspace speed
    } else {
        // If no existing text, start typing immediately
        startTypingNewText(query, searchInput);
    }
}

// Helper function to type new text
function startTypingNewText(query, searchInput) {
    let i = 0;
    currentTypeInterval = setInterval(() => {
        if (i < query.length) {
            searchInput.value = query.substring(0, i + 1) + '|';
            i++;
        } else {
            clearInterval(currentTypeInterval);
            currentTypeInterval = null;
            searchInput.value = query; // Remove cursor
            isTypingInProgress = false;
        }
    }, 12); // Smooth typing speed
}

// Function to cycle through suggestions
function cycleAutoSuggestions() {
    let currentCategory = 'engineering';
    let currentIndex = 0;
    
    function checkAndCycle() {
        // Get current category from active button
        const activeButton = document.querySelector('.category-btn.active');
        if (activeButton) {
            currentCategory = activeButton.textContent.toLowerCase().replace(/\s+/g, '-');
            // Fix mapped category name for HR / People
            if (currentCategory === "hr") currentCategory = "hr-people";
        }
        
        const suggestions = categorySuggestions[currentCategory] || categorySuggestions["engineering"];
        
        if (!isTypingInProgress) {
            isTypingInProgress = true;
            fillSearch(suggestions[currentIndex].query);
            currentIndex = (currentIndex + 1) % suggestions.length;
        }
        
        if (cycleTimeout) clearTimeout(cycleTimeout);
        cycleTimeout = setTimeout(checkAndCycle, 3000);
    }
    
    // Start first cycle soon after page load
    setTimeout(() => {
        const activeButton = document.querySelector('.category-btn.active');
        if (activeButton) {
            currentCategory = activeButton.textContent.toLowerCase().replace(/\s+/g, '-');
            // Fix mapped category name for HR / People
            if (currentCategory === "hr") currentCategory = "hr-people";
        }
        
        // Update suggested tasks based on initial category
        updateSuggestedTasks(currentCategory);
        
        const suggestions = categorySuggestions[currentCategory] || categorySuggestions["engineering"];
        
        if (!isTypingInProgress) {
            isTypingInProgress = true;
            fillSearch(suggestions[0].query);
            currentIndex = 1;
            cycleTimeout = setTimeout(checkAndCycle, 3000);
        }
    }, 800);
    
    // Update category when buttons are clicked
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Get new category
            const newCategory = this.textContent.toLowerCase().replace(/\s+/g, '-');
            const mappedCategory = newCategory === "hr" ? "hr-people" : newCategory;
            
            // Update suggested tasks for the new category
            updateSuggestedTasks(mappedCategory);
            
            if (mappedCategory !== currentCategory) {
                currentCategory = mappedCategory;
                currentIndex = 0;
                
                // Clear existing timeout
                if (cycleTimeout) {
                    clearTimeout(cycleTimeout);
                }
                
                // Start new cycle with first suggestion
                const suggestions = categorySuggestions[currentCategory] || categorySuggestions["engineering"];
                
                if (!isTypingInProgress) {
                    isTypingInProgress = true;
                    fillSearch(suggestions[0].query);
                    currentIndex = 1;
                    cycleTimeout = setTimeout(checkAndCycle, 3000);
                }
            }
        });
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the auto-suggestions cycle
    cycleAutoSuggestions();
    
    // Set up initial events for search input and buttons
    const searchInput = document.querySelector('.search-input');
    const sendButton = document.querySelector('.send-btn');
    const micButton = document.querySelector('.mic-btn');
    const orgMemoryToggle = document.querySelector('.toggle-switch input');
    const categoryNav = document.querySelector('.category-nav');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // OM1 Popup Elements
    const om1Toggle = document.getElementById('om1-toggle');
    const om1Popup = document.getElementById('om1-popup');
    const closePopupBtn = document.getElementById('close-popup');
    
    // Integrations Popup Elements
    const integrationsBtn = document.getElementById('integrations-btn');
    const integrationsPopup = document.getElementById('integrations-popup');
    const closeIntegrationsBtn = document.getElementById('close-integrations-popup');

    // Search functionality
    function handleSearch(query) {
        if (!query.trim()) return;
        
        // Animate the send button
        sendButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            sendButton.style.transform = '';
        }, 100);

        // Clear the input
        searchInput.value = '';
        
        // Log the query (replace with actual search implementation)
        console.log('Searching:', query);
    }

    // Event listeners for search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(e.target.value);
        }
    });

    sendButton.addEventListener('click', () => {
        handleSearch(searchInput.value);
    });

    // Voice input simulation
    micButton.addEventListener('click', () => {
        micButton.classList.add('active');
        
        // Simulate voice recording
        setTimeout(() => {
            micButton.classList.remove('active');
            searchInput.value = 'Voice input processing...';
            
            // Clear the simulation after 1.5s
            setTimeout(() => {
                searchInput.value = '';
            }, 1500);
        }, 1000);
    });

    // Organizational Memory toggle
    orgMemoryToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        console.log('Organizational Memory:', isEnabled ? 'enabled' : 'disabled');
        
        // Add visual feedback
        const toggleLabel = document.querySelector('.toggle-label');
        toggleLabel.style.opacity = '0.7';
        setTimeout(() => {
            toggleLabel.style.opacity = '';
        }, 200);
        
        // Show OM1 popup when toggled
        om1Popup.classList.add('active');
    });
    
    // OM1 Popup Close Button
    closePopupBtn.addEventListener('click', () => {
        om1Popup.classList.remove('active');
    });
    
    // Integrations Button
    integrationsBtn.addEventListener('click', () => {
        // Close OM1 popup if open
        om1Popup.classList.remove('active');
        
        // Toggle integrations popup
        integrationsPopup.classList.add('active');
    });
    
    // Close Integrations Popup Button
    closeIntegrationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        integrationsPopup.classList.remove('active');
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        // For OM1 popup
        if (om1Popup.classList.contains('active') && 
            !om1Popup.contains(e.target) && 
            !orgMemoryToggle.contains(e.target)) {
            om1Popup.classList.remove('active');
        }
        
        // For integrations popup
        if (integrationsPopup.classList.contains('active') && 
            !integrationsPopup.contains(e.target) && 
            !integrationsBtn.contains(e.target)) {
            integrationsPopup.classList.remove('active');
        }
    });
    
    // Close popups with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            om1Popup.classList.remove('active');
            integrationsPopup.classList.remove('active');
        }
    });

    // Add input animations
    searchInput.addEventListener('focus', () => {
        searchInput.style.transform = 'scale(1.005)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.transform = '';
    });
    
    // Mobile enhancements
    
    // Improve scrolling for category nav on mobile
    let isScrolling = false;
    
    // Helper function to check if device is mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }
    
    // Smooth scroll to centered active category button
    function scrollActiveCategoryIntoView() {
        if (!categoryNav) return;
        
        const activeBtn = categoryNav.querySelector('.active');
        if (!activeBtn) return;
        
        // Don't scroll on desktop
        if (!isMobile()) return;
        
        // Calculate the scroll position to center the active button
        const navWidth = categoryNav.offsetWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        const scrollPos = btnLeft - (navWidth / 2) + (btnWidth / 2);
        
        // Scroll smoothly to position
        categoryNav.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
        });
    }
    
    // Call on page load
    setTimeout(scrollActiveCategoryIntoView, 300);
    
    // Prevent accidental page zoom when tapping quickly on mobile
    document.addEventListener('touchend', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
            const now = Date.now();
            const timeSince = now - (e.target._lastTouch || 0);
            
            if (timeSince < 300) {
                e.preventDefault();
            }
            
            e.target._lastTouch = now;
        }
    }, false);
    
    // Add overscroll capability to category nav
    if (categoryNav && isMobile()) {
        categoryNav.style.WebkitOverflowScrolling = 'touch';
    }
    
    // Improve task card touch response
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.classList.add('touch-active');
        });
        
        card.addEventListener('touchend', () => {
            card.classList.remove('touch-active');
        });
        
        card.addEventListener('touchcancel', () => {
            card.classList.remove('touch-active');
        });
    });
}); 
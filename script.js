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
    "support": [
        { text: "Analyze support feedback", query: "Identify trends and recurring issues across our customers" },
        { text: "Track customer health", query: "Identify at risk accounts based on engagement metrics and comms" },
        { text: "Create FAQs", query: "Can you generate FAQs based on recent customer calls" }
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
    
    // Clear any ongoing animations and reset the input
    if (currentBackspaceInterval) clearInterval(currentBackspaceInterval);
    if (currentTypeInterval) clearInterval(currentTypeInterval);
    searchInput.value = '';
    
    // Type the new query
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
    }, 20);
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
            if (currentCategory === "hr-/-people") currentCategory = "hr-people";
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
            if (currentCategory === "hr-/-people") currentCategory = "hr-people";
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
            const mappedCategory = newCategory === "hr-/-people" ? "hr-people" : newCategory;
            
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
    });

    // Add input animations
    searchInput.addEventListener('focus', () => {
        searchInput.style.transform = 'scale(1.005)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.transform = '';
    });
}); 
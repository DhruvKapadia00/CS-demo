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
        { text: "Support Team Performance", query: "Show resolution rates for each support agent" },
        { text: "Churn Risk Analysis", query: "Which customers are at churn risk and why? Show me sentiment shifts in recent interactions." },
        { text: "Customer Health Scorecard", query: "Give me a complete customer health scorecard for - recent activity, open issues, sentiment, and next steps." },
        { text: "Feature Requests", query: "What are the top 10 feature requests we're hearing from customers and which customers want them?" },
        { text: "Customer Escalations", query: "Show me all customer escalations in the last 30 days - what are the patterns?" },
        { text: "QBR Preparation", query: "Prepare me for my customer QBR with . What happened since last QBR?" },
        { text: "Feature Adoption", query: "Which customers are adopting new features slowest and what's blocking them?" },
        { text: "At-Risk Battle Card", query: "Create a battle card for our top 5 at-risk accounts - why they might leave and how to save them." },
        { text: "NPS Detractors", query: "Show me our NPS detractors - what specifically are they unhappy about and what's our action plan?" }
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

// Function to cycle through Customer Success suggestions only
function cycleAutoSuggestions() {
    const currentCategory = 'customer-success';
    let currentIndex = 0;
    
    function checkAndCycle() {
        const suggestions = categorySuggestions[currentCategory];
        
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
        const suggestions = categorySuggestions[currentCategory];
        
        if (!isTypingInProgress) {
            isTypingInProgress = true;
            fillSearch(suggestions[0].query);
            currentIndex = 1;
            cycleTimeout = setTimeout(checkAndCycle, 3000);
        }
    }, 800);
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the auto-suggestions cycle
    cycleAutoSuggestions();
    
    // Set up initial events for search input and buttons
    const searchInput = document.querySelector('.search-input');
    const sendButton = document.querySelector('.send-btn');
    const micButton = document.querySelector('.mic-btn');
    
    // Customer Selector Dropdown
    const customerBtn = document.getElementById('customer-selector-btn');
    const customerDropdown = document.getElementById('customer-dropdown');
    const customerSearch = document.querySelector('.customer-search');
    const allCustomersCheckbox = document.getElementById('all-customers-checkbox');
    const customerCheckboxes = document.querySelectorAll('.customer-checkbox');
    
    // Connected Data Sources Dropdown
    const sourcesBtn = document.getElementById('connected-sources-btn');
    const sourcesDropdown = document.getElementById('sources-dropdown');
    const sourcesSearch = document.querySelector('.sources-search');
    
    // Integrations Popup Elements
    const integrationsBtn = document.getElementById('integrations-btn');
    const integrationsPopup = document.getElementById('integrations-popup');
    const closeIntegrationsBtn = document.getElementById('close-integrations-popup');

    // Toggle customer dropdown
    if (customerBtn && customerDropdown) {
        customerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            customerDropdown.classList.toggle('active');
            // Close sources dropdown if open
            if (sourcesDropdown) sourcesDropdown.classList.remove('active');
        });
        
        // Prevent dropdown from closing when clicking inside
        customerDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Search functionality
        if (customerSearch) {
            customerSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const customerItems = document.querySelectorAll('.customer-item:not(.all-customers)');
                
                customerItems.forEach(item => {
                    const text = item.querySelector('span').textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Handle "All Customers" checkbox
        if (allCustomersCheckbox) {
            allCustomersCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                customerCheckboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                });
                updateCustomerCount();
            });
        }
        
        // Handle individual customer checkboxes
        customerCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateCustomerCount();
                // Update "All Customers" checkbox state
                const allChecked = Array.from(customerCheckboxes).every(cb => cb.checked);
                if (allCustomersCheckbox) {
                    allCustomersCheckbox.checked = allChecked;
                }
            });
        });
        
        // Function to update customer count
        function updateCustomerCount() {
            const checkedBoxes = Array.from(customerCheckboxes).filter(cb => cb.checked);
            const checkedCount = checkedBoxes.length;
            const totalCount = customerCheckboxes.length;
            const customerBtn = document.getElementById('customer-selector-btn');
            
            if (customerBtn) {
                // Clear existing content
                customerBtn.innerHTML = '';
                
                if (checkedCount === totalCount) {
                    // Show "All Customers" when all are selected
                    const countSpan = document.createElement('span');
                    countSpan.className = 'customer-count';
                    countSpan.textContent = 'All Customers';
                    
                    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    arrow.setAttribute('width', '10');
                    arrow.setAttribute('height', '6');
                    arrow.setAttribute('viewBox', '0 0 10 6');
                    arrow.setAttribute('fill', 'none');
                    arrow.classList.add('dropdown-arrow');
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', 'M1 1L5 5L9 1');
                    path.setAttribute('stroke', 'currentColor');
                    path.setAttribute('stroke-width', '1.5');
                    path.setAttribute('stroke-linecap', 'round');
                    path.setAttribute('stroke-linejoin', 'round');
                    arrow.appendChild(path);
                    
                    customerBtn.appendChild(countSpan);
                    customerBtn.appendChild(arrow);
                } else if (checkedCount === 1) {
                    // Show single customer with logo and name
                    const checkedItem = checkedBoxes[0].closest('.customer-item');
                    const customerLogo = checkedItem.querySelector('.customer-logo');
                    const customerName = checkedItem.querySelector('span').textContent;
                    
                    // Clone the logo
                    const logoClone = customerLogo.cloneNode(true);
                    logoClone.style.width = '20px';
                    logoClone.style.height = '20px';
                    
                    // Create name span
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'customer-count';
                    nameSpan.textContent = customerName;
                    
                    // Create dropdown arrow
                    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    arrow.setAttribute('width', '10');
                    arrow.setAttribute('height', '6');
                    arrow.setAttribute('viewBox', '0 0 10 6');
                    arrow.setAttribute('fill', 'none');
                    arrow.classList.add('dropdown-arrow');
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', 'M1 1L5 5L9 1');
                    path.setAttribute('stroke', 'currentColor');
                    path.setAttribute('stroke-width', '1.5');
                    path.setAttribute('stroke-linecap', 'round');
                    path.setAttribute('stroke-linejoin', 'round');
                    arrow.appendChild(path);
                    
                    customerBtn.appendChild(logoClone);
                    customerBtn.appendChild(nameSpan);
                    customerBtn.appendChild(arrow);
                } else {
                    // Show count
                    const countSpan = document.createElement('span');
                    countSpan.className = 'customer-count';
                    countSpan.textContent = `${checkedCount} Customer${checkedCount !== 1 ? 's' : ''}`;
                    
                    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    arrow.setAttribute('width', '10');
                    arrow.setAttribute('height', '6');
                    arrow.setAttribute('viewBox', '0 0 10 6');
                    arrow.setAttribute('fill', 'none');
                    arrow.classList.add('dropdown-arrow');
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', 'M1 1L5 5L9 1');
                    path.setAttribute('stroke', 'currentColor');
                    path.setAttribute('stroke-width', '1.5');
                    path.setAttribute('stroke-linecap', 'round');
                    path.setAttribute('stroke-linejoin', 'round');
                    arrow.appendChild(path);
                    
                    customerBtn.appendChild(countSpan);
                    customerBtn.appendChild(arrow);
                }
            }
        }
    }
    
    // Toggle data sources dropdown
    if (sourcesBtn && sourcesDropdown) {
        sourcesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sourcesDropdown.classList.toggle('active');
            // Close customer dropdown if open
            if (customerDropdown) customerDropdown.classList.remove('active');
        });
        
        // Prevent dropdown from closing when clicking inside
        sourcesDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Search functionality
        if (sourcesSearch) {
            sourcesSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const sourceItems = document.querySelectorAll('.source-item');
                
                sourceItems.forEach(item => {
                    const text = item.querySelector('span').textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    }

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

    // Integrations Button
    if (integrationsBtn && integrationsPopup) {
        integrationsBtn.addEventListener('click', () => {
            // Close sources dropdown if open
            if (sourcesDropdown) sourcesDropdown.classList.remove('active');
            
            // Toggle integrations popup
            integrationsPopup.classList.add('active');
        });
    }
    
    // Close Integrations Popup Button
    if (closeIntegrationsBtn) {
        closeIntegrationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            integrationsPopup.classList.remove('active');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // For customer dropdown
        if (customerDropdown && customerDropdown.classList.contains('active') && 
            !customerDropdown.contains(e.target) && 
            !customerBtn.contains(e.target)) {
            customerDropdown.classList.remove('active');
        }
        
        // For data sources dropdown
        if (sourcesDropdown && sourcesDropdown.classList.contains('active') && 
            !sourcesDropdown.contains(e.target) && 
            !sourcesBtn.contains(e.target)) {
            sourcesDropdown.classList.remove('active');
        }
        
        // For integrations popup
        if (integrationsPopup && integrationsPopup.classList.contains('active') && 
            !integrationsPopup.contains(e.target) && 
            !integrationsBtn.contains(e.target)) {
            integrationsPopup.classList.remove('active');
        }
    });
    
    // Close dropdowns with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (customerDropdown) customerDropdown.classList.remove('active');
            if (sourcesDropdown) sourcesDropdown.classList.remove('active');
            if (integrationsPopup) integrationsPopup.classList.remove('active');
        }
    });

    // Add input animations
    searchInput.addEventListener('focus', () => {
        searchInput.style.transform = 'scale(1.005)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.transform = '';
    });
    
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
}); 
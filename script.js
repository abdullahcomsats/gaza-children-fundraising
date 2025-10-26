// Gaza Children Fundraising Website - JavaScript Functionality

// Initialize donation progress data
function initializeDonationData() {
    const existing = localStorage.getItem('donationProgress');
    if (!existing) {
        const initialData = {
            totalRaised: 100,
            donorCount: 23,
            target: 500,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('donationProgress', JSON.stringify(initialData));
    } else {
        try {
            const parsed = JSON.parse(existing);
            if (typeof parsed.totalRaised !== 'number' || parsed.totalRaised < 0) parsed.totalRaised = 0;
            if (typeof parsed.donorCount !== 'number' || parsed.donorCount < 0) parsed.donorCount = 0;
            if (typeof parsed.target !== 'number' || parsed.target <= 0) parsed.target = 500;
            parsed.lastUpdated = new Date().toISOString();
            localStorage.setItem('donationProgress', JSON.stringify(parsed));
        } catch (e) {
            localStorage.removeItem('donationProgress');
            initializeDonationData();
        }
    }
    if (!localStorage.getItem('transactionLog')) {
        localStorage.setItem('transactionLog', JSON.stringify({ transactions: [] }));
    }
}

// Update donation progress display
function updateDonationProgress() {
    const defaultData = { totalRaised: 100, donorCount: 23, target: 500 };
    const progressData = JSON.parse(localStorage.getItem('donationProgress') || JSON.stringify(defaultData));

    // Update total raised - handle both ID formats and currency symbol
    const totalRaisedElement = document.getElementById('total-raised') || document.getElementById('totalRaised');
    if (totalRaisedElement) {
        const existing = (totalRaisedElement.textContent || '').trim();
        const prefixMatch = existing.match(/^[^0-9\-]+/); // capture any currency or non-numeric prefix
        const prefix = prefixMatch ? prefixMatch[0] : '$';
        totalRaisedElement.textContent = `${prefix}${progressData.totalRaised.toLocaleString()}`;
    }

    // Update donor count - handle both ID formats
    const donorCountElement = document.getElementById('donor-count') || document.getElementById('donorCount');
    if (donorCountElement) {
        donorCountElement.textContent = progressData.donorCount.toLocaleString();
    }

    // Update progress circle and percentage text
    const circleEl = document.getElementById('progress-circle');
    const percentageText = document.getElementById('progress-percentage') || document.getElementById('progressPercentage');
    const rawPct = (progressData.totalRaised / progressData.target) * 100;
    const pct = Math.max(0, Math.min(rawPct, 100));

    if (circleEl) {
        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (pct / 100) * circumference;
        circleEl.style.strokeDasharray = `${circumference}`;
        circleEl.style.strokeDashoffset = `${offset}`;
    }
    if (percentageText) {
        percentageText.textContent = `${Math.round(pct)}%`;
    }

    // Update linear progress bar (impact page)
    const linearBar = document.getElementById('progressBar');
    if (linearBar) {
        linearBar.style.width = `${pct}%`;
    }
}

// Add donation to local storage
function addDonation(donationData) {
    const amount = parseFloat(donationData.amount);
    if (!isFinite(amount) || amount <= 0) {
        throw new Error('Invalid donation amount');
    }

    const progressData = JSON.parse(localStorage.getItem('donationProgress') || '{"totalRaised":0,"donorCount":0,"target":500}');
    progressData.totalRaised = Math.max(0, progressData.totalRaised + amount);
    progressData.donorCount += 1;
    progressData.lastUpdated = new Date().toISOString();
    localStorage.setItem('donationProgress', JSON.stringify(progressData));

    // Add to transaction log
    const transactionLog = JSON.parse(localStorage.getItem('transactionLog'));
    const transaction = {
        id: `TXN_${Date.now()}`,
        amount: parseFloat(donationData.amount),
        currency: donationData.currency || 'USD',
        donor: donationData.donorName || 'Anonymous',
        email: donationData.email || '',
        country: donationData.country || 'Unknown',
        timestamp: new Date().toISOString(),
        method: donationData.paymentMethod || 'Credit Card',
        message: donationData.message || ''
    };

    transactionLog.transactions.push(transaction);
    localStorage.setItem('transactionLog', JSON.stringify(transactionLog));

    // Trigger real-time UI update
    updateDonationProgress();

    return transaction.id;
}

// Quick donate functionality
function setupQuickDonate() {
    // Run only on home page
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        return;
    }
    const quickDonateButtons = document.querySelectorAll('.quick-donate, .quick-donate-btn');
    quickDonateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            window.location.href = `donate.html?amount=${amount}`;
        });
    });
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCardNumber(cardNumber) {
    const cleanNumber = String(cardNumber || '').replace(/\s/g, '');
    return /^\d{16}$/.test(cleanNumber);
}

function validateExpiryDate(expiry) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(String(expiry || ''))) return false;
    const [month, year] = String(expiry).split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    return true;
}

function validateCVC(cvc) {
    return /^\d{3,4}$/.test(String(cvc || ''));
}

// Format card number input
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ');
    if (formattedValue.endsWith(' ')) {
        formattedValue = formattedValue.slice(0, -1);
    }
    input.value = formattedValue;
}

// Format expiry date input
function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// Setup donation form
function setupDonationForm() {
    if (!window.location.pathname.includes('donate.html')) {
        return;
    }

    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;

    // Pre-fill amount if coming from quick donate
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    const donationAmountInput = document.getElementById('donationAmount');
    if (amountParam && donationAmountInput) {
        donationAmountInput.value = amountParam;
    }

    // Quick amount buttons
    document.querySelectorAll('.quick-donate-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedAmount = this.getAttribute('data-amount');
            if (donationAmountInput) donationAmountInput.value = selectedAmount;
            document.querySelectorAll('.quick-donate-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
            });
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
        });
    });

    // Setup card formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() { formatCardNumber(this); });
    }
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() { formatExpiryDate(this); });
    }

    // Gate submit until questionnaire complete
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = !window.__questionnaireComplete;

    // Form submission
    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!window.__questionnaireComplete) {
            const errorContainer = document.getElementById('form-errors') || document.createElement('div');
            errorContainer.id = 'form-errors';
            errorContainer.innerHTML = `
                <div class="alert alert-warning">
                    <strong>Questionnaire Required:</strong> Please complete the pre-donation questionnaire before proceeding.
                </div>
            `;
            donationForm.prepend(errorContainer);
            errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const formData = new FormData(donationForm);
        const donationData = {
            amount: formData.get('donationAmount'),
            donorFirstName: formData.get('firstName'),
            donorLastName: formData.get('lastName'),
            donorName: (formData.get('cardholderName') || `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`).trim(),
            email: formData.get('email'),
            country: formData.get('country'),
            cardNumber: formData.get('cardNumber'),
            expiryDate: formData.get('expiryDate'),
            cvc: formData.get('cvc'),
            paymentMethod: 'Credit Card',
            message: formData.get('message')
        };

        // Validation
        let isValid = true;
        const errors = [];

        if (!donationData.amount || parseFloat(donationData.amount) < 1) { errors.push('Please enter a valid donation amount'); isValid = false; }
        if (!donationData.donorFirstName || donationData.donorFirstName.trim().length < 2) { errors.push('Please enter your first name'); isValid = false; }
        if (!donationData.donorLastName || donationData.donorLastName.trim().length < 2) { errors.push('Please enter your last name'); isValid = false; }
        if (!validateEmail(donationData.email)) { errors.push('Please enter a valid email address'); isValid = false; }
        if (!donationData.country) { errors.push('Please select your country'); isValid = false; }
        if (!validateCardNumber(donationData.cardNumber)) { errors.push('Please enter a valid 16-digit card number'); isValid = false; }
        if (!validateExpiryDate(donationData.expiryDate)) { errors.push('Please enter a valid expiry date (MM/YY)'); isValid = false; }
        if (!validateCVC(donationData.cvc)) { errors.push('Please enter a valid CVC (3-4 digits)'); isValid = false; }

        const errorContainer = document.getElementById('form-errors');
        if (errorContainer) {
            if (!isValid) {
                errorContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>Please fix the following errors:</strong>
                        <ul class="mb-0 mt-2">${errors.map(error => `<li>${error}</li>`).join('')}</ul>
                    </div>
                `;
                errorContainer.scrollIntoView({ behavior: 'smooth' });
                return;
            } else {
                errorContainer.innerHTML = '';
            }
        }

        await processDonation(donationData);
    });
}

// Detect card brand (simple heuristic)
function detectCardBrand(cardNumber) {
    const n = String(cardNumber || '').replace(/\s/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'MasterCard';
    if (/^3[47]/.test(n)) return 'AmEx';
    if (/^6(?:011|5)/.test(n)) return 'Discover';
    return 'Unknown';
}

// Simple tokenization mock (do NOT store full card numbers)
function generatePaymentTokenMock(cardNumber) {
    const last4 = String(cardNumber || '').replace(/\s/g, '').slice(-4);
    return { token: 'tok_' + Math.random().toString(36).slice(2), last4, brand: detectCardBrand(cardNumber) };
}

// Supabase setup
let supabaseClient = null;
function initSupabase() {
    if (window.__ENV && window.__ENV.SUPABASE_URL && window.__ENV.SUPABASE_ANON_KEY && window.supabase) {
        supabaseClient = window.supabase.createClient(window.__ENV.SUPABASE_URL, window.__ENV.SUPABASE_ANON_KEY);
    }
}

async function saveDonationToSupabase(donationData, transactionId, questionnaireData) {
    try {
        if (!supabaseClient) return;
        const tokenMeta = generatePaymentTokenMock(donationData.cardNumber);
        const record = {
            transaction_id: transactionId,
            amount: parseFloat(donationData.amount),
            currency: donationData.currency || 'USD',
            donor_first_name: donationData.donorFirstName || null,
            donor_last_name: donationData.donorLastName || null,
            donor_email_hash: await sha256(donationData.email || ''),
            country: donationData.country || null,
            card_last4: tokenMeta.last4,
            card_brand: tokenMeta.brand,
            payment_token: tokenMeta.token,
            questionnaire: questionnaireData || null,
            created_at: new Date().toISOString()
        };
        const { error } = await supabaseClient.from('donations').insert(record);
        if (error) {
            console.error('Supabase insert error', error);
        }
    } catch (e) {
        console.error('Supabase save error', e);
    }
}

async function sha256(str) {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Process donation (mock payment)
async function processDonation(donationData) {
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // Show loading state
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
    submitButton.disabled = true;

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // Add donation to local storage
        const transactionId = addDonation(donationData);

        // Store transaction data for thank you page
        sessionStorage.setItem('lastTransaction', JSON.stringify({
            ...donationData,
            transactionId: transactionId,
            timestamp: new Date().toISOString()
        }));

        // Submit questionnaire to Supabase and save donation to Supabase (fire-and-forget)
        submitToSupabase(window.__QuestionnaireData || {}, transactionId).catch(() => {});
        saveDonationToSupabase(donationData, transactionId, window.__QuestionnaireData || {}).catch(() => {});

        // Analytics
        if (window.dataLayer) {
            window.dataLayer.push({ event: 'donation_success', amount: parseFloat(donationData.amount) });
        }

        // Redirect to thank you page
        window.location.href = 'thankyou.html';

    } catch (error) {
        console.error('Error processing donation:', error);
        const errorContainer = document.getElementById('form-errors');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> There was a problem processing your donation. Please try again.
                </div>
            `;
        }
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Generate anonymous ID for questionnaire responses
function generateAnonymousId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `anon_${timestamp}_${randomPart}`;
}

// Submit to Supabase questionnaire_responses table
async function submitToSupabase(questionnaireData, transactionId) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized');
            return;
        }

        const anonymousId = generateAnonymousId();
        const donationAmount = window.__QuestionnaireDonationAmount || null;

        // Prepare data for Supabase insertion
        const responseData = {
            anonymous_id: anonymousId,
            donation_amount: donationAmount ? parseFloat(donationAmount) : null,
            // Map questionnaire fields to database columns
            q1_motivation: questionnaireData.q1_motivation || null,
            q2_emotions: questionnaireData.q2_emotions || null,
            q3_prior_support: questionnaireData.q3_priorSupport || null,
            q4_campaign_resonance: questionnaireData.q4_campaignResonance || null,
            q5_impact_importance: questionnaireData.q5_impactImportance || null,
            q6_urgent_need: questionnaireData.q6_urgentNeed || null,
            q7_contribution_change: questionnaireData.q7_contributionChange || null,
            q8_personal_value: questionnaireData.q8_personalValue || null,
            q9_future_updates: questionnaireData.q9_futureUpdates || null,
            q10_message_hope: questionnaireData.q10_messageHope || null
        };

        const { data, error } = await supabaseClient
            .from('questionnaire_responses')
            .insert([responseData])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Supabase error: ${error.message}`);
        }

        console.log('Successfully submitted questionnaire to Supabase:', data);
        
        // Analytics tracking
        if (window.dataLayer) { 
            window.dataLayer.push({ 
                event: 'questionnaire_submitted',
                anonymous_id: anonymousId
            }); 
        }

        return { success: true, anonymousId, data };
    } catch (e) {
        console.error('Supabase submission failed:', e);
        throw e;
    }
}

// Setup thank you page
function setupThankYouPage() {
    if (!window.location.pathname.includes('thankyou.html')) {
        return;
    }

    const transactionData = JSON.parse(sessionStorage.getItem('lastTransaction') || '{}');
    if (Object.keys(transactionData).length === 0) {
        window.location.href = 'index.html';
        return;
    }

    const transactionIdElement = document.getElementById('transaction-id');
    const donationAmountElement = document.getElementById('donation-amount');
    const donorNameElement = document.getElementById('donor-name');
    const transactionDateElement = document.getElementById('transaction-date');

    if (transactionIdElement) transactionIdElement.textContent = transactionData.transactionId;
    if (donationAmountElement) donationAmountElement.textContent = `$${parseFloat(transactionData.amount).toFixed(2)}`;
    if (donorNameElement) donorNameElement.textContent = transactionData.donorName;
    if (transactionDateElement) {
        const date = new Date(transactionData.timestamp);
        transactionDateElement.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
    updateDonationProgress();
    sessionStorage.removeItem('lastTransaction');
}

// Pre-Donation Questionnaire setup
function setupPreDonationQuestionnaire() {
    if (!window.location.pathname.includes('donate.html')) return;
    const container = document.getElementById('preDonationForm');
    if (!container) return;

    const steps = Array.from(container.querySelectorAll('.question-step'));
    let current = 0;
    window.__questionnaireComplete = false;
    window.__QuestionnaireData = {};
    const submitBtn = document.getElementById('submitBtn');

    function showStep(idx) {
        steps.forEach((step, i) => { step.style.display = i === idx ? 'block' : 'none'; });
    }
    function collectAnswers() {
        const data = {};
        const formEls = container.querySelectorAll('[data-q-key]');
        formEls.forEach(el => {
            const key = el.getAttribute('data-q-key');
            let val = '';
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                if (el.type === 'radio') {
                    if (el.checked) val = el.value;
                } else {
                    val = el.value;
                }
            } else if (el.tagName === 'SELECT') {
                val = el.value;
            }
            if (val) data[key] = val;
        });
        return data;
    }
    function validateStep(idx) {
        const stepEl = steps[idx];
        const requiredEls = stepEl.querySelectorAll('[data-required="true"]');
        const errors = [];
        requiredEls.forEach(el => {
            const key = el.getAttribute('data-q-key');
            const val = (el.type === 'radio') ? container.querySelector(`input[data-q-key="${key}"]:checked`)?.value : el.value;
            if (!val || (typeof val === 'string' && val.trim() === '')) {
                errors.push('Please complete all required questions in this section.');
            }
        });
        const errorBox = container.querySelector('.question-errors');
        if (errorBox) {
            errorBox.innerHTML = errors.length ? `<div class="alert alert-danger">${errors[0]}</div>` : '';
        }
        return errors.length === 0;
    }

    showStep(current);

    container.querySelector('[data-action="next"]').addEventListener('click', function() {
        if (!validateStep(current)) return;
        current = Math.min(current + 1, steps.length - 1);
        showStep(current);
    });
    container.querySelector('[data-action="back"]').addEventListener('click', function() {
        current = Math.max(current - 1, 0);
        showStep(current);
    });
    container.querySelector('[data-action="finish"]').addEventListener('click', function() {
        if (!validateStep(current)) return;
        window.__QuestionnaireData = collectAnswers();
        window.__QuestionnaireDonationAmount = document.getElementById('donationAmount')?.value || '';
        window.__questionnaireComplete = true;
        if (submitBtn) submitBtn.disabled = false;
        if (window.dataLayer) { window.dataLayer.push({ event: 'questionnaire_completed' }); }
        const okBox = container.querySelector('.question-success');
        if (okBox) { okBox.innerHTML = '<div class="alert alert-success">Thank you. You may now complete your donation.</div>'; }
        container.scrollIntoView({ behavior: 'smooth' });
    });
}

// Setup survey functionality
function setupSurvey() {
    if (!window.location.pathname.includes('thankyou.html')) {
        return;
    }
    const surveyButton = document.getElementById('survey-button');
    if (surveyButton) {
        surveyButton.addEventListener('click', function() {
            const surveyUrl = 'https://forms.google.com/your-survey-form';
            window.open(surveyUrl, '_blank');
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDonationData();
    initSupabase();
    updateDonationProgress();
    setupQuickDonate();
    setupDonationForm();
    setupThankYouPage();
    setupPreDonationQuestionnaire();
    setupSurvey();

    // Real-time updates across tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'donationProgress') updateDonationProgress();
    });

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validateCardNumber,
        validateExpiryDate,
        validateCVC,
        formatCardNumber,
        formatExpiryDate,
        addDonation,
        updateDonationProgress
    };
}
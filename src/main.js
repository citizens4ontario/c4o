import './style.css';

const checkboxes = document.querySelectorAll('.pathway-checkbox');
const signupForm = document.getElementById('signupForm');
const confirmationState = document.getElementById('confirmationState');
const errorBanner = document.getElementById('formErrorBanner');
const errorText = document.getElementById('formErrorText');

function syncCardStates() {
    checkboxes.forEach(cb => {
        const card = cb.closest('.pathway-card');
        card.classList.toggle('selected', cb.checked);
        card.querySelector('.check-icon').classList.toggle('opacity-0', !cb.checked);
    });
}

checkboxes.forEach(cb => cb.addEventListener('change', syncCardStates));

// Initial sync for pre-checked default option
syncCardStates();

// Phone number auto-formatting for US numbers
document.getElementById('phone').addEventListener('input', (e) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
    let formatted = '';
    if (digits.length > 0) {
        formatted = '(' + digits.substring(0, 3);
    }
    if (digits.length >= 4) {
        formatted += ') ' + digits.substring(3, 6);
    }
    if (digits.length >= 7) {
        formatted += '-' + digits.substring(6, 10);
    }
    e.target.value = formatted;
});

function showFormError(msg) {
    errorText.textContent = msg;
    errorBanner.classList.remove('hidden');
}

// Form Submission Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.add('hidden');

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const selectedPathways = Array.from(document.querySelectorAll('.pathway-checkbox:checked')).map(cb => cb.value);

    // Validate Name
    if (!fullName) {
        showFormError('Please enter your full name so we know who is joining.');
        document.getElementById('fullName').focus();
        return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showFormError('Please enter a valid email address for civic dispatches.');
        document.getElementById('email').focus();
        return;
    }

    // Validate Phone
    if (phone.replace(/\D/g, '').length < 10) {
        showFormError('Please enter a valid 10-digit phone number.');
        document.getElementById('phone').focus();
        return;
    }

    // Validate at least one involvement option
    if (selectedPathways.length === 0) {
        showFormError('Please select at least one way you would like to get involved with Citizens 4 Ontario.');
        return;
    }

    const submitBtn = signupForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
        const res = await fetch('/api/intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, phone, involvement: selectedPathways }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        console.error('Submit failed', err);
        showFormError('Something went wrong sending your form. Please try again in a moment.');
        return;
    } finally {
        submitBtn.disabled = false;
    }

    // Populate Confirmation View
    document.getElementById('confirmName').textContent = fullName.split(' ')[0];
    document.getElementById('confirmEmail').textContent = email;
    document.getElementById('confirmPhone').textContent = phone;

    const pathwaysListEl = document.getElementById('confirmPathwaysList');
    pathwaysListEl.innerHTML = '';
    selectedPathways.forEach(track => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2.5 bg-dashLight p-2.5 rounded-lg border border-slate900/20';
        li.innerHTML = `<span class="inline-flex items-center justify-center w-5 h-5 rounded bg-signal text-slate900 font-mono text-xs font-bold shrink-0 mt-0.5">✓</span><span></span>`;
        li.lastChild.textContent = track;
        pathwaysListEl.appendChild(li);
    });

    // Swap form for confirmation state
    signupForm.classList.add('hidden');
    confirmationState.classList.remove('hidden');
});

// Reset form to allow adding another neighbor
document.getElementById('resetBtn').addEventListener('click', () => {
    signupForm.reset(); // restores the default-checked option from the HTML
    syncCardStates();
    confirmationState.classList.add('hidden');
    signupForm.classList.remove('hidden');
    document.getElementById('fullName').focus();
});

// Copy recruitment link
document.getElementById('copyLinkBtn').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        const copyText = document.getElementById('copyLinkText');
        copyText.textContent = '✓ Link Copied to Clipboard!';
        setTimeout(() => {
            copyText.textContent = 'Copy Recruitment Link';
        }, 2500);
    } catch (err) {
        console.error('Copy failed', err);
    }
});

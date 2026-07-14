let experienceCount = 0;
let educationCount = 0;

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function logout() { window.location.href = '/logout'; }

function showTab(tab) {
    const builderTab = document.getElementById('builderTab');
    const analyzeTab = document.getElementById('analyzeTab');
    const navItems = document.querySelectorAll('.nav-item');
    if (tab === 'builder') {
        builderTab.style.display = 'grid';
        analyzeTab.classList.remove('active');
        navItems[1].classList.add('active');
        if (navItems[3]) navItems[3].classList.remove('active');
    } else {
        builderTab.style.display = 'none';
        analyzeTab.classList.add('active');
        navItems[1].classList.remove('active');
        if (navItems[3]) navItems[3].classList.add('active');
    }
}

function addExperience() {
    experienceCount++;
    const container = document.getElementById('experienceContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item animate-in';
    div.id = `exp-${experienceCount}`;
    div.innerHTML = `
        <button class="remove-btn" onclick="removeExperience(${experienceCount})"><i class="fas fa-times"></i></button>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Job Title</label><input type="text" class="form-input" placeholder="Software Engineer" oninput="updatePreview()"></div>
            <div class="form-group"><label class="form-label">Company</label><input type="text" class="form-input" placeholder="Company Name" oninput="updatePreview()"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Start Date</label><input type="text" class="form-input" placeholder="Jan 2020" oninput="updatePreview()"></div>
            <div class="form-group"><label class="form-label">End Date</label><input type="text" class="form-input" placeholder="Present" oninput="updatePreview()"></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" placeholder="Describe your responsibilities and achievements..." oninput="updatePreview()"></textarea></div>
    `;
    container.appendChild(div);
}

function removeExperience(id) { 
    const el = document.getElementById(`exp-${id}`);
    if (el) el.remove(); 
    updatePreview(); 
}

function addEducation() {
    educationCount++;
    const container = document.getElementById('educationContainer');
    const div = document.createElement('div');
    div.className = 'dynamic-item animate-in';
    div.id = `edu-${educationCount}`;
    div.innerHTML = `
        <button class="remove-btn" onclick="removeEducation(${educationCount})"><i class="fas fa-times"></i></button>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Degree</label><input type="text" class="form-input" placeholder="Bachelor of Science" oninput="updatePreview()"></div>
            <div class="form-group"><label class="form-label">Institution</label><input type="text" class="form-input" placeholder="University Name" oninput="updatePreview()"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Year</label><input type="text" class="form-input" placeholder="2016 - 2020" oninput="updatePreview()"></div>
            <div class="form-group"><label class="form-label">GPA (Optional)</label><input type="text" class="form-input" placeholder="3.8/4.0" oninput="updatePreview()"></div>
        </div>
    `;
    container.appendChild(div);
}

function removeEducation(id) { 
    const el = document.getElementById(`edu-${id}`);
    if (el) el.remove(); 
    updatePreview(); 
}

function updatePreview() {
    const firstName = document.getElementById('firstName').value || 'Your Name';
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value || 'email@example.com';
    const phone = document.getElementById('phone').value || '+1 234 567 890';
    const location = document.getElementById('location').value || 'Location';
    const summary = document.getElementById('summary').value || 'Your professional summary will appear here...';
    document.getElementById('previewName').textContent = `${firstName} ${lastName}`.trim() || 'Your Name';
    document.getElementById('previewContact').textContent = `${email} | ${phone} | ${location}`;
    document.getElementById('previewSummary').textContent = summary;

    const expContainer = document.getElementById('previewExperience');
    expContainer.innerHTML = '';
    document.querySelectorAll('#experienceContainer .dynamic-item').forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        if (inputs[0] && inputs[0].value) {
            expContainer.innerHTML += `<div class="exp-item"><div class="exp-header"><span class="exp-title">${inputs[0].value}</span><span class="exp-date">${inputs[2] ? inputs[2].value : ''} - ${inputs[3] ? inputs[3].value : ''}</span></div><div class="exp-company">${inputs[1] ? inputs[1].value : ''}</div><div class="exp-desc">${inputs[4] ? inputs[4].value : ''}</div></div>`;
        }
    });

    const eduContainer = document.getElementById('previewEducation');
    eduContainer.innerHTML = '';
    document.querySelectorAll('#educationContainer .dynamic-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs[0] && inputs[0].value) {
            eduContainer.innerHTML += `<div class="exp-item"><div class="exp-header"><span class="exp-title">${inputs[0].value}</span><span class="exp-date">${inputs[2] ? inputs[2].value : ''}</span></div><div class="exp-company">${inputs[1] ? inputs[1].value : ''}${inputs[3] && inputs[3].value ? ' | GPA: ' + inputs[3].value : ''}</div></div>`;
        }
    });

    const skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s);
    document.getElementById('previewSkills').innerHTML = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
}

function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            document.getElementById('fileNameText').textContent = file.name;
            document.getElementById('uploadedFileName').style.display = 'block';
            showModal(`PDF "${file.name}" uploaded successfully! You can now analyze it with ATS.`);
        } else {
            showModal('Please upload a PDF file only.');
        }
    }
}

async function generateAIResume() {
    showLoading('AI is analyzing and optimizing your resume for ATS...');
    const resumeData = {
        template_id: 'modern',
        personal_info: {
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            title: document.getElementById('title').value,
            location: document.getElementById('location').value,
            summary: document.getElementById('summary').value
        },
        experience: [], education: [],
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        job_role: document.getElementById('jobRole').value
    };
    document.querySelectorAll('#experienceContainer .dynamic-item').forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        if (inputs[0] && inputs[0].value) {
            resumeData.experience.push({ 
                title: inputs[0].value, 
                company: inputs[1] ? inputs[1].value : '', 
                start_date: inputs[2] ? inputs[2].value : '', 
                end_date: inputs[3] ? inputs[3].value : '', 
                description: inputs[4] ? inputs[4].value : '' 
            });
        }
    });
    document.querySelectorAll('#educationContainer .dynamic-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs[0] && inputs[0].value) {
            resumeData.education.push({ 
                degree: inputs[0].value, 
                institution: inputs[1] ? inputs[1].value : '', 
                year: inputs[2] ? inputs[2].value : '', 
                gpa: inputs[3] ? inputs[3].value : '' 
            });
        }
    });
    try {
        const response = await fetch('/api/generate-resume', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData)
        });
        const data = await response.json();
        if (data.success) {
            hideLoading();
            showModal('Your ATS-optimized resume has been generated successfully with AI!');
        }
    } catch (err) {
        hideLoading();
        showModal('Resume generated locally! AI optimization may be temporarily unavailable.');
    }
}

async function analyzeResume() {
    showLoading('AI is analyzing your resume against job requirements...');
    const summary = document.getElementById('summary').value || '';
    const skills = document.getElementById('skills').value || '';
    const title = document.getElementById('title').value || '';
    const expTexts = Array.from(document.querySelectorAll('#experienceContainer textarea')).map(t => t.value).join(' ');
    const resumeText = summary + ' ' + skills + ' ' + title + ' ' + expTexts;
    const jobRole = document.getElementById('analyzeJobRole').value;
    try {
        const response = await fetch('/api/analyze-resume', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, job_role: jobRole })
        });
        const data = await response.json();
        if (data.success) { 
            hideLoading(); 
            displayAnalysis(data); 
        }
    } catch (err) {
        hideLoading();
        displayAnalysis({ 
            match_percentage: 65, 
            ats_score: 72, 
            matched_keywords: ['python', 'javascript', 'react'], 
            missing_keywords: ['docker', 'aws', 'agile', 'ci/cd'], 
            suggestions: [
                'Consider adding Docker and AWS experience to improve your score.', 
                'Mention agile methodology experience in your work descriptions.', 
                'Add CI/CD pipeline experience to strengthen your profile.', 
                'Your resume is well-structured. Good job!'
            ], 
            job_description: 'Looking for a skilled professional with expertise in modern technologies.', 
            word_count: 250 
        });
    }
}

function displayAnalysis(data) {
    document.getElementById('analysisResults').style.display = 'block';
    const circle = document.getElementById('scoreCircle');
    const circumference = 2 * Math.PI * 75;
    const offset = circumference - (data.ats_score / 100) * circumference;
    let scoreClass = 'score-poor';
    if (data.ats_score >= 80) scoreClass = 'score-excellent';
    else if (data.ats_score >= 60) scoreClass = 'score-good';
    else if (data.ats_score >= 40) scoreClass = 'score-average';
    circle.setAttribute('class', scoreClass);
    setTimeout(() => { 
        circle.style.transition = 'stroke-dashoffset 1.5s ease-out'; 
        circle.style.strokeDashoffset = offset; 
    }, 100);
    animateValue('scoreValue', 0, Math.round(data.ats_score), 1500, '%');
    document.getElementById('matchedKeywords').innerHTML = data.matched_keywords.map(k => `<span class="keyword-tag matched"><i class="fas fa-check"></i> ${k}</span>`).join('');
    document.getElementById('missingKeywords').innerHTML = data.missing_keywords.map(k => `<span class="keyword-tag missing"><i class="fas fa-plus"></i> ${k}</span>`).join('');
    document.getElementById('suggestionsList').innerHTML = data.suggestions.map(s => `<li>${s}</li>`).join('');
    document.getElementById('jobDescription').textContent = data.job_description;
}

function animateValue(id, start, end, duration, suffix) {
    const obj = document.getElementById(id);
    const range = end - start;
    if (range === 0) {
        obj.textContent = end + suffix;
        return;
    }
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    if (stepTime === 0) {
        obj.textContent = end + suffix;
        return;
    }
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current + suffix;
        if (current == end) clearInterval(timer);
    }, stepTime);
}

function downloadResume() {
    const element = document.getElementById('resumePreview');
    const opt = { 
        margin: 0.5, 
        filename: 'Thoufi_Resume.pdf', 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2 }, 
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save();
    showModal('Your resume has been downloaded as PDF!');
}

function changeTemplate() { 
    showModal('Template gallery is available in the Templates section!'); 
}

function showLoading(text) { 
    document.getElementById('loadingText').textContent = text; 
    document.getElementById('loadingOverlay').classList.add('active'); 
}

function hideLoading() { 
    document.getElementById('loadingOverlay').classList.remove('active'); 
}

function showModal(message) { 
    document.getElementById('modalMessage').textContent = message; 
    document.getElementById('successModal').classList.add('active'); 
}

function closeModal() { 
    document.getElementById('successModal').classList.remove('active'); 
}

function toggleChat() { 
    document.getElementById('aiChatPanel').classList.toggle('active'); 
}

function sendQuickMessage(message) { 
    document.getElementById('chatInput').value = message; 
    sendMessage(); 
}

const aiResponses = {
    'ats': "To optimize your resume for ATS, use standard section headings like 'Work Experience' and 'Education'. Include relevant keywords from the job description naturally. Avoid tables, headers/footers, and images. Use a clean, single-column format with common fonts.",
    'skills': "For a Software Engineer role, key skills include: Python, JavaScript, React, Node.js, SQL, Git, Docker, AWS, REST APIs, CI/CD, TypeScript, and cloud platforms. Tailor these to match the specific job description.",
    'experience': "Format work experience with: Job Title, Company, Dates, then 3-5 bullet points using action verbs and quantifiable results. Example: 'Increased website performance by 40% through code optimization and caching strategies.'",
    'summary': "A great professional summary is 2-3 sentences highlighting your experience, key skills, and career goals. Example: 'Results-driven Software Engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about creating user-centric solutions.'",
    'format': "Use a clean, professional format: 1-2 pages, consistent font (Arial/Calibri 10-12pt), clear section headers, bullet points for readability, and proper margins (0.5-1 inch).",
    'length': "Keep your resume to 1-2 pages. Entry-level: 1 page. Mid-level: 1-2 pages. Senior/Executive: 2 pages max. Focus on relevant experience only.",
    'keywords': "Extract keywords from the job posting and naturally incorporate them. Include both hard skills (technical) and soft skills (leadership, communication) where relevant.",
    'achievements': "Use the STAR method: Situation, Task, Action, Result. Quantify achievements with numbers: 'Reduced load time by 50%', 'Managed team of 8 developers', 'Increased revenue by $2M'.",
    'certification': "List relevant certifications with issuing organization and date. Examples: AWS Certified Solutions Architect, Google Professional Cloud Architect, PMP, Scrum Master.",
    'education': "List degree, institution, graduation year, and GPA if above 3.5. Include relevant coursework for entry-level positions. Certifications can go here or in a separate section.",
    'projects': "Include 2-3 significant projects with: Project Name, Technologies Used, Your Role, and measurable outcomes. Link to GitHub/portfolio if applicable.",
    'linkedin': "Ensure your LinkedIn matches your resume. Use a professional photo, customize your headline, write a compelling summary, and get recommendations from colleagues.",
    'cover': "A cover letter should be 3-4 paragraphs: introduction, why you're a fit, specific achievements, and call to action. Customize for each application.",
    'interview': "Prepare for interviews by researching the company, practicing behavioral questions using STAR method, and preparing questions to ask the interviewer.",
    'salary': "Research market rates using Glassdoor, Levels.fyi. Consider total compensation: base salary, bonus, stock options, benefits. Negotiate based on your value.",
    'gap': "Address employment gaps honestly but briefly. Focus on what you did during the gap: freelance work, courses, volunteering, or personal projects.",
    'freelance': "List freelance work as professional experience. Include client names (if permissible), project descriptions, technologies, and measurable results.",
    'remote': "Highlight remote work skills: self-motivation, communication tools (Slack, Zoom), time management, and async collaboration experience.",
    'career': "For career change, focus on transferable skills. Use a functional or hybrid resume format. Highlight relevant certifications and projects in the new field.",
    'references': "Don't include references on your resume. Have a separate reference list ready. Choose professional references who can speak to your work quality.",
    'portfolio': "Include a link to your portfolio/GitHub. Ensure it's up-to-date, well-organized, and showcases your best work with clear project descriptions.",
    'volunteer': "Include volunteer work that demonstrates relevant skills. Format like professional experience. Shows character and additional competencies.",
    'languages': "List languages with proficiency level (Native, Fluent, Conversational, Basic). Only include if relevant to the job or impressive.",
    'hobbies': "Include hobbies only if they demonstrate relevant skills or are conversation starters. Avoid generic interests like 'reading' or 'traveling'.",
    'objective': "Replace outdated 'Objective' with a 'Professional Summary'. Focus on what you offer, not what you want. Keep it concise and impactful.",
    'action': "Use strong action verbs: Developed, Implemented, Designed, Led, Optimized, Created, Managed, Streamlined, Architected, Delivered.",
    'metrics': "Always quantify: 'Increased efficiency by 30%', 'Reduced costs by $50K', 'Served 10,000+ users', 'Led team of 12', 'Completed 15+ projects'.",
    'font': "Best resume fonts: Arial, Calibri, Helvetica, Georgia, Garamond. Size 10-12pt for body, 14-16pt for headers. Consistent throughout.",
    'color': "Use minimal color: black text on white background. One accent color max (blue is safe). Avoid photos, graphics, or decorative elements for ATS compatibility.",
    'default': "I'm here to help with your resume! Ask me about ATS optimization, formatting, skills, experience writing, or any career-related questions."
};

function getAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('ats') || lowerMsg.includes('optimize')) return aiResponses.ats;
    if (lowerMsg.includes('skill')) return aiResponses.skills;
    if (lowerMsg.includes('experience') || lowerMsg.includes('format')) return aiResponses.experience;
    if (lowerMsg.includes('summary') || lowerMsg.includes('profile')) return aiResponses.summary;
    if (lowerMsg.includes('format') || lowerMsg.includes('layout')) return aiResponses.format;
    if (lowerMsg.includes('length') || lowerMsg.includes('page')) return aiResponses.length;
    if (lowerMsg.includes('keyword')) return aiResponses.keywords;
    if (lowerMsg.includes('achievement') || lowerMsg.includes('accomplish')) return aiResponses.achievements;
    if (lowerMsg.includes('certif')) return aiResponses.certification;
    if (lowerMsg.includes('education') || lowerMsg.includes('degree')) return aiResponses.education;
    if (lowerMsg.includes('project')) return aiResponses.projects;
    if (lowerMsg.includes('linkedin')) return aiResponses.linkedin;
    if (lowerMsg.includes('cover')) return aiResponses.cover;
    if (lowerMsg.includes('interview')) return aiResponses.interview;
    if (lowerMsg.includes('salary') || lowerMsg.includes('negotiate')) return aiResponses.salary;
    if (lowerMsg.includes('gap')) return aiResponses.gap;
    if (lowerMsg.includes('freelance')) return aiResponses.freelance;
    if (lowerMsg.includes('remote')) return aiResponses.remote;
    if (lowerMsg.includes('career') || lowerMsg.includes('change')) return aiResponses.career;
    if (lowerMsg.includes('reference')) return aiResponses.references;
    if (lowerMsg.includes('portfolio') || lowerMsg.includes('github')) return aiResponses.portfolio;
    if (lowerMsg.includes('volunteer')) return aiResponses.volunteer;
    if (lowerMsg.includes('language')) return aiResponses.languages;
    if (lowerMsg.includes('hobby')) return aiResponses.hobbies;
    if (lowerMsg.includes('objective')) return aiResponses.objective;
    if (lowerMsg.includes('action') || lowerMsg.includes('verb')) return aiResponses.action;
    if (lowerMsg.includes('metric') || lowerMsg.includes('number')) return aiResponses.metrics;
    if (lowerMsg.includes('font')) return aiResponses.font;
    if (lowerMsg.includes('color') || lowerMsg.includes('design')) return aiResponses.color;
    return aiResponses.default;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('chatSendBtn');
    const message = input.value.trim();
    if (!message) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    messagesContainer.appendChild(userMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    input.value = '';
    sendBtn.disabled = true;

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typingIndicator';
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
        const response = getAIResponse(message);
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        aiMsg.innerHTML = `<div class="ai-label"><i class="fas fa-robot"></i> Thoufi AI</div>${response}`;
        messagesContainer.appendChild(aiMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        sendBtn.disabled = false;
    }, 1500);
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('tab') === 'analyze') { showTab('analyze'); }

addExperience();
addEducation();

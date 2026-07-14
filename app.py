import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from flask_cors import CORS
from datetime import datetime
import re

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')

app.secret_key = 'thoufi_resume_builder_secret_key_2024'
CORS(app)

# In-memory storage
users_db = {}
resumes_db = {}

# 15 Resume Templates
TEMPLATES = [
    {"id": "modern", "name": "Modern Professional", "description": "Clean, modern design with subtle colors", "color": "#2563eb", "category": "Professional"},
    {"id": "classic", "name": "Classic Elegant", "description": "Traditional layout with elegant typography", "color": "#1e40af", "category": "Professional"},
    {"id": "creative", "name": "Creative Bold", "description": "Bold design for creative professionals", "color": "#3b82f6", "category": "Creative"},
    {"id": "minimal", "name": "Minimal Clean", "description": "Ultra-minimal design focusing on content", "color": "#60a5fa", "category": "Minimal"},
    {"id": "tech", "name": "Tech Professional", "description": "Optimized for tech industry roles", "color": "#1d4ed8", "category": "Tech"},
    {"id": "executive", "name": "Executive Suite", "description": "Premium design for senior positions", "color": "#1e3a8a", "category": "Executive"},
    {"id": "gradient", "name": "Gradient Modern", "description": "Stunning gradient header design", "color": "#7c3aed", "category": "Modern"},
    {"id": "sidebar", "name": "Sidebar Pro", "description": "Left sidebar with skills highlight", "color": "#059669", "category": "Professional"},
    {"id": "dark", "name": "Dark Mode", "description": "Sleek dark themed resume", "color": "#0f172a", "category": "Modern"},
    {"id": "compact", "name": "Compact Single", "description": "Single page compact layout", "color": "#dc2626", "category": "Minimal"},
    {"id": "two-column", "name": "Two Column", "description": "Efficient two-column layout", "color": "#ea580c", "category": "Professional"},
    {"id": "academic", "name": "Academic CV", "description": "Perfect for research and academic roles", "color": "#0891b2", "category": "Academic"},
    {"id": "startup", "name": "Startup Ready", "description": "Dynamic design for startup culture", "color": "#db2777", "category": "Creative"},
    {"id": "corporate", "name": "Corporate Standard", "description": "Fortune 500 approved format", "color": "#4338ca", "category": "Professional"},
    {"id": "portfolio", "name": "Portfolio Style", "description": "Showcase work with project highlights", "color": "#16a34a", "category": "Creative"}
]

ATS_KEYWORDS = {
    "Software Engineer": ["python", "javascript", "react", "node.js", "sql", "git", "agile", "rest api", "docker", "aws", "typescript", "mongodb", "ci/cd", "microservices"],
    "Data Scientist": ["python", "machine learning", "deep learning", "tensorflow", "pandas", "numpy", "sql", "statistics", "data visualization", "scikit-learn", "keras", "pytorch", "nlp", "big data"],
    "Web Developer": ["html", "css", "javascript", "react", "vue", "angular", "responsive design", "bootstrap", "jquery", "sass", "webpack", "typescript", "next.js"],
    "DevOps Engineer": ["docker", "kubernetes", "jenkins", "aws", "azure", "linux", "bash", "terraform", "ci/cd", "ansible", "prometheus", "grafana", "helm"],
    "Product Manager": ["agile", "scrum", "jira", "product strategy", "user research", "roadmap", "stakeholder management", "a/b testing", "metrics", "okrs", "lean"],
    "UI/UX Designer": ["figma", "sketch", "adobe xd", "prototyping", "wireframing", "user research", "design systems", "interaction design", "usability testing", "adobe creative suite"],
    "Marketing Manager": ["seo", "sem", "google analytics", "content marketing", "social media", "email marketing", "crm", "ppc", "conversion optimization", "brand strategy", "marketing automation"],
    "Financial Analyst": ["excel", "financial modeling", "valuation", "forecasting", "sap", "bloomberg", "data analysis", "power bi", "tableau", "risk analysis", "budgeting"],
    "AI Engineer": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "llm", "transformers", "hugging face", "openai", "langchain"],
    "Cloud Architect": ["aws", "azure", "gcp", "terraform", "kubernetes", "docker", "cloudformation", "serverless", "devops", "microservices", "istio", "service mesh"]
}

JOB_DESCRIPTIONS = {
    "Software Engineer": "Looking for a skilled Software Engineer with expertise in Python, JavaScript, and modern frameworks. Experience with cloud platforms, microservices, and agile methodologies required.",
    "Data Scientist": "Seeking a Data Scientist proficient in machine learning, statistical analysis, and data visualization. Strong Python skills and experience with large datasets essential.",
    "Web Developer": "Hiring a creative Web Developer with strong frontend skills. Must be proficient in React, responsive design, and modern CSS frameworks.",
    "DevOps Engineer": "Looking for a DevOps Engineer with hands-on experience in CI/CD pipelines, containerization, and cloud infrastructure management.",
    "Product Manager": "Seeking an experienced Product Manager to drive product strategy and execution. Strong analytical skills and stakeholder management required.",
    "UI/UX Designer": "Hiring a talented UI/UX Designer with a portfolio demonstrating strong visual design and user-centered design principles.",
    "Marketing Manager": "Looking for a Marketing Manager with proven track record in digital marketing, SEO/SEM, and campaign management.",
    "Financial Analyst": "Seeking a detail-oriented Financial Analyst with strong Excel skills and experience in financial modeling, forecasting, and valuation.",
    "AI Engineer": "Looking for an AI Engineer with expertise in LLMs, transformers, and machine learning. Experience with LangChain and building AI-powered applications required.",
    "Cloud Architect": "Seeking a Cloud Architect with deep expertise in AWS/Azure/GCP. Experience designing scalable, secure cloud infrastructure essential."
}

def analyze_ats_score(resume_text, job_role):
    resume_lower = resume_text.lower()
    keywords = ATS_KEYWORDS.get(job_role, [])
    job_desc = JOB_DESCRIPTIONS.get(job_role, "")

    matched_keywords = []
    missing_keywords = []

    for keyword in keywords:
        if keyword in resume_lower:
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)

    match_percentage = (len(matched_keywords) / len(keywords)) * 100 if keywords else 0

    word_count = len(resume_text.split())
    has_contact = bool(re.search(r'[\w\.-]+@[\w\.-]+', resume_text))
    has_phone = bool(re.search(r'[\+]?[\d\s\-\(\)]{10,}', resume_text))
    has_education = 'education' in resume_lower or 'degree' in resume_lower or 'university' in resume_lower
    has_experience = 'experience' in resume_lower or 'work' in resume_lower

    keyword_score = match_percentage * 0.5
    structure_score = 0
    if has_contact: structure_score += 5
    if has_phone: structure_score += 5
    if has_education: structure_score += 10
    if has_experience: structure_score += 10
    if word_count > 300: structure_score += 10
    elif word_count > 200: structure_score += 5

    ats_score = min(100, keyword_score + structure_score + 20)

    suggestions = []
    if match_percentage < 40:
        suggestions.append("Your resume needs significant improvement. Add more relevant keywords from the job description.")
    elif match_percentage < 70:
        suggestions.append(f"Good start! Consider adding these missing keywords: {', '.join(missing_keywords[:5])}")
    else:
        suggestions.append("Excellent! Your resume is well-optimized for this role.")

    if word_count < 200:
        suggestions.append("Your resume seems short. Consider adding more details about your experience (aim for 300+ words).")
    elif word_count > 600:
        suggestions.append("Your resume is quite long. Consider condensing to 1-2 pages for better readability.")

    if not has_contact:
        suggestions.append("Add your email address for recruiters to contact you.")
    if not has_phone:
        suggestions.append("Include your phone number in the contact section.")
    if not has_education:
        suggestions.append("Add your educational background to strengthen your profile.")
    if not has_experience:
        suggestions.append("Include your work experience with detailed descriptions.")

    if len(missing_keywords) > 0:
        suggestions.append(f"Missing important skills: {', '.join(missing_keywords[:5])}. Try to incorporate these naturally.")

    return {
        "match_percentage": round(match_percentage, 1),
        "ats_score": round(ats_score, 1),
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "suggestions": suggestions,
        "job_description": job_desc,
        "word_count": word_count,
        "structure_score": structure_score
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if username in users_db and users_db[username]['password'] == password:
            session['user'] = username
            return jsonify({"success": True, "message": "Login successful!"})
        return jsonify({"success": False, "message": "Invalid credentials!"})
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    if username in users_db:
        return jsonify({"success": False, "message": "Username already exists!"})
    users_db[username] = {
        'password': password,
        'email': email,
        'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    return jsonify({"success": True, "message": "Registration successful!"})

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session['user'])

@app.route('/builder')
def builder():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('builder.html')

@app.route('/gallery')
def gallery():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('gallery.html')

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    return jsonify({"success": True, "response": "I'm here to help with your resume!"})

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    data = request.get_json()
    resume_text = data.get('resume_text', '').lower()
    job_role = data.get('job_role', 'Software Engineer')
    result = analyze_ats_score(resume_text, job_role)
    return jsonify({"success": True, **result})

@app.route('/api/generate-resume', methods=['POST'])
def generate_resume():
    data = request.get_json()
    template_id = data.get('template_id', 'modern')
    personal_info = data.get('personal_info', {})
    experience = data.get('experience', [])
    education = data.get('education', [])
    skills = data.get('skills', [])
    job_role = data.get('job_role', 'Software Engineer')

    resume_data = {
        "template_id": template_id,
        "personal_info": personal_info,
        "experience": experience,
        "education": education,
        "skills": skills,
        "job_role": job_role,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ats_optimized": True
    }
    session['current_resume'] = resume_data
    return jsonify({
        "success": True,
        "resume_data": resume_data,
        "message": "Resume generated successfully!"
    })

@app.route('/api/save-resume', methods=['POST'])
def save_resume():
    data = request.get_json()
    username = session.get('user', 'guest')
    resume_id = f"{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    resumes_db[resume_id] = data
    return jsonify({"success": True, "resume_id": resume_id, "message": "Resume saved successfully!"})

@app.route('/api/get-templates')
def get_templates():
    return jsonify(TEMPLATES)

@app.route('/api/get-job-roles')
def get_job_roles():
    return jsonify({
        "success": True,
        "roles": list(ATS_KEYWORDS.keys())
    })

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

# Vercel handler
app = app
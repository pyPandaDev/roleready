"""
Interview Service
Handles interview question generation and answer evaluation
"""

import json
import logging
from typing import Dict, List, Any, Optional
from services.ai_common import get_model, clean_json_response

logger = logging.getLogger(__name__)


# Role-specific category mappings
ROLE_CATEGORIES = {
    "data scientist": [
        {"name": "Python Programming", "icon": "code", "count": 9},
        {"name": "Mathematics & Statistics", "icon": "function-square", "count": 8},
        {"name": "Machine Learning", "icon": "brain", "count": 9},
        {"name": "Data Structures & Algorithms", "icon": "git-branch", "count": 9},
        {"name": "Case Studies & Scenarios", "icon": "lightbulb", "count": 9}
    ],
    "data analyst": [
        {"name": "SQL & Databases", "icon": "database", "count": 9},
        {"name": "Python/Excel", "icon": "code", "count": 8},
        {"name": "Statistics & Analytics", "icon": "chart-bar", "count": 8},
        {"name": "Data Visualization", "icon": "chart-line", "count": 6},
        {"name": "Business Case Studies", "icon": "briefcase", "count": 9}
    ],
    "machine learning engineer": [
        {"name": "Python & Coding", "icon": "code", "count": 9},
        {"name": "Machine Learning", "icon": "brain", "count": 9},
        {"name": "Deep Learning", "icon": "network", "count": 9},
        {"name": "MLOps & Deployment", "icon": "server", "count": 6},
        {"name": "System Design", "icon": "layout", "count": 6}
    ],
    "frontend developer": [
        {"name": "JavaScript", "icon": "code", "count": 9},
        {"name": "React/Framework", "icon": "component", "count": 9},
        {"name": "CSS & Styling", "icon": "palette", "count": 6},
        {"name": "DSA & Problem Solving", "icon": "git-branch", "count": 9},
        {"name": "System Design", "icon": "layout", "count": 6}
    ],
    "backend developer": [
        {"name": "Programming Language", "icon": "code", "count": 9},
        {"name": "Databases & SQL", "icon": "database", "count": 9},
        {"name": "API & System Design", "icon": "server", "count": 9},
        {"name": "DSA & Problem Solving", "icon": "git-branch", "count": 9},
        {"name": "DevOps Basics", "icon": "cloud", "count": 6}
    ],
    "software engineer": [
        {"name": "Programming Fundamentals", "icon": "code", "count": 9},
        {"name": "Data Structures & Algorithms", "icon": "git-branch", "count": 9},
        {"name": "System Design", "icon": "layout", "count": 9},
        {"name": "OOP & Design Patterns", "icon": "boxes", "count": 6},
        {"name": "Behavioral", "icon": "users", "count": 6}
    ],
    "default": [
        {"name": "Technical Fundamentals", "icon": "code", "count": 9},
        {"name": "Problem Solving", "icon": "git-branch", "count": 9},
        {"name": "Domain Knowledge", "icon": "book", "count": 9},
        {"name": "Behavioral", "icon": "users", "count": 6},
        {"name": "Situational", "icon": "lightbulb", "count": 6}
    ]
}


def get_role_categories(role: str) -> List[Dict]:
    """Get appropriate categories for a role"""
    role_lower = role.lower().strip()
    
    for key in ROLE_CATEGORIES:
        if key in role_lower or role_lower in key:
            return ROLE_CATEGORIES[key]
    
    # Check partial matches
    if "data" in role_lower and "scien" in role_lower:
        return ROLE_CATEGORIES["data scientist"]
    if "ml" in role_lower or "machine" in role_lower:
        return ROLE_CATEGORIES["machine learning engineer"]
    if "frontend" in role_lower or "front-end" in role_lower or "react" in role_lower:
        return ROLE_CATEGORIES["frontend developer"]
    if "backend" in role_lower or "back-end" in role_lower:
        return ROLE_CATEGORIES["backend developer"]
    if "analyst" in role_lower:
        return ROLE_CATEGORIES["data analyst"]
    
    return ROLE_CATEGORIES["default"]


def generate_fallback_questions(role: str, experience_level: str, categories: List[Dict]) -> Dict[str, Any]:
    """Generate fallback questions when AI fails"""
    
    fallback_questions = {
        "Python Programming": [
            {"id": 1, "question": "What is the difference between a list and a tuple in Python?", "difficulty": "easy", "company": "General", "topic": "Data Types"},
            {"id": 2, "question": "Explain how Python's garbage collection works.", "difficulty": "easy", "company": "Google", "topic": "Memory"},
            {"id": 3, "question": "What are decorators in Python and when would you use them?", "difficulty": "easy", "company": "Amazon", "topic": "Functions"},
            {"id": 4, "question": "Explain the difference between deep copy and shallow copy.", "difficulty": "medium", "company": "Microsoft", "topic": "Memory"},
            {"id": 5, "question": "How does the Python GIL affect multithreading?", "difficulty": "medium", "company": "Meta", "topic": "Concurrency"},
            {"id": 6, "question": "Implement a context manager using both class and generator approaches.", "difficulty": "medium", "company": "Netflix", "topic": "Advanced"},
            {"id": 7, "question": "How would you optimize a Python function that processes millions of records?", "difficulty": "hard", "company": "Uber", "topic": "Performance"},
            {"id": 8, "question": "Explain metaclasses and provide a practical use case.", "difficulty": "hard", "company": "Google", "topic": "OOP"},
            {"id": 9, "question": "Design a memory-efficient data pipeline for processing large CSV files.", "difficulty": "hard", "company": "Airbnb", "topic": "System Design"}
        ],
        "Data Structures & Algorithms": [
            {"id": 1, "question": "Reverse a linked list.", "difficulty": "easy", "company": "Amazon", "topic": "Linked List"},
            {"id": 2, "question": "Find the maximum subarray sum (Kadane's algorithm).", "difficulty": "easy", "company": "Microsoft", "topic": "Arrays"},
            {"id": 3, "question": "Check if a binary tree is balanced.", "difficulty": "easy", "company": "Google", "topic": "Trees"},
            {"id": 4, "question": "Implement LRU Cache.", "difficulty": "medium", "company": "Meta", "topic": "Design"},
            {"id": 5, "question": "Find the kth largest element in an unsorted array.", "difficulty": "medium", "company": "Amazon", "topic": "Heap"},
            {"id": 6, "question": "Serialize and deserialize a binary tree.", "difficulty": "medium", "company": "Google", "topic": "Trees"},
            {"id": 7, "question": "Find the median from a data stream.", "difficulty": "hard", "company": "Microsoft", "topic": "Heap"},
            {"id": 8, "question": "Word Ladder - find shortest transformation sequence.", "difficulty": "hard", "company": "Google", "topic": "Graph"},
            {"id": 9, "question": "Design a data structure that supports insert, delete, and getRandom in O(1).", "difficulty": "hard", "company": "Meta", "topic": "Design"}
        ],
        "Machine Learning": [
            {"id": 1, "question": "Explain the bias-variance tradeoff.", "difficulty": "easy", "company": "General", "topic": "Fundamentals"},
            {"id": 2, "question": "What is the difference between L1 and L2 regularization?", "difficulty": "easy", "company": "Amazon", "topic": "Regularization"},
            {"id": 3, "question": "Explain precision and recall. When would you prioritize one over the other?", "difficulty": "easy", "company": "Google", "topic": "Metrics"},
            {"id": 4, "question": "How would you handle imbalanced datasets?", "difficulty": "medium", "company": "Meta", "topic": "Data"},
            {"id": 5, "question": "Explain how Random Forest works and its advantages over Decision Trees.", "difficulty": "medium", "company": "Microsoft", "topic": "Models"},
            {"id": 6, "question": "What is gradient descent? Explain different variants.", "difficulty": "medium", "company": "Google", "topic": "Optimization"},
            {"id": 7, "question": "Design an ML system to detect fraudulent transactions.", "difficulty": "hard", "company": "Stripe", "topic": "System Design"},
            {"id": 8, "question": "How would you deploy a model that needs to handle 1M predictions/second?", "difficulty": "hard", "company": "Uber", "topic": "MLOps"},
            {"id": 9, "question": "Explain attention mechanism and transformers architecture.", "difficulty": "hard", "company": "OpenAI", "topic": "Deep Learning"}
        ],
        "Mathematics & Statistics": [
            {"id": 1, "question": "What is the Central Limit Theorem?", "difficulty": "easy", "company": "General", "topic": "Statistics"},
            {"id": 2, "question": "Explain the difference between Type I and Type II errors.", "difficulty": "easy", "company": "Amazon", "topic": "Hypothesis Testing"},
            {"id": 3, "question": "What is the difference between correlation and causation?", "difficulty": "easy", "company": "Meta", "topic": "Statistics"},
            {"id": 4, "question": "Explain p-value and when you would use it.", "difficulty": "medium", "company": "Google", "topic": "Hypothesis Testing"},
            {"id": 5, "question": "How does PCA work? What are its limitations?", "difficulty": "medium", "company": "Microsoft", "topic": "Linear Algebra"},
            {"id": 6, "question": "Explain Bayes' theorem with a practical example.", "difficulty": "medium", "company": "Amazon", "topic": "Probability"},
            {"id": 7, "question": "How would you design an A/B test for a new feature?", "difficulty": "hard", "company": "Meta", "topic": "Experimentation"},
            {"id": 8, "question": "Explain eigenvalues and eigenvectors. Where are they used in ML?", "difficulty": "hard", "company": "Google", "topic": "Linear Algebra"}
        ],
        "Case Studies & Scenarios": [
            {"id": 1, "question": "How would you measure the success of a recommendation system?", "difficulty": "easy", "company": "Netflix", "topic": "Metrics"},
            {"id": 2, "question": "A model's accuracy dropped in production. How would you debug?", "difficulty": "easy", "company": "Uber", "topic": "Debugging"},
            {"id": 3, "question": "How would you explain a complex ML model to a non-technical stakeholder?", "difficulty": "easy", "company": "General", "topic": "Communication"},
            {"id": 4, "question": "Design a system to detect fake reviews on an e-commerce platform.", "difficulty": "medium", "company": "Amazon", "topic": "System Design"},
            {"id": 5, "question": "How would you build a churn prediction model?", "difficulty": "medium", "company": "Spotify", "topic": "Product"},
            {"id": 6, "question": "Your model shows high accuracy but stakeholders say it's wrong. What do you do?", "difficulty": "medium", "company": "Meta", "topic": "Problem Solving"},
            {"id": 7, "question": "Design an ML system to optimize Uber's surge pricing.", "difficulty": "hard", "company": "Uber", "topic": "System Design"},
            {"id": 8, "question": "How would you build a real-time anomaly detection system for millions of transactions?", "difficulty": "hard", "company": "Stripe", "topic": "System Design"},
            {"id": 9, "question": "Design Instagram's Explore feed recommendation algorithm.", "difficulty": "hard", "company": "Meta", "topic": "Product"}
        ]
    }
    
    # Build response with appropriate categories
    result_categories = []
    for cat in categories:
        cat_name = cat["name"]
        if cat_name in fallback_questions:
            questions = fallback_questions[cat_name][:cat["count"]]
        else:
            # Generic fallback
            questions = [
                {"id": i+1, "question": f"Describe your experience with {cat_name}.", "difficulty": "easy" if i < 3 else "medium" if i < 6 else "hard", "company": "General", "topic": cat_name}
                for i in range(min(cat["count"], 9))
            ]
        
        result_categories.append({
            "name": cat_name,
            "icon": cat["icon"],
            "questions": questions
        })
    
    total = sum(len(c["questions"]) for c in result_categories)
    
    return {
        "role": role,
        "experience_level": experience_level,
        "total_questions": total,
        "estimated_time": f"{total // 15}-{total // 10} hours",
        "categories": result_categories
    }


async def generate_interview_questions(role: str, experience_level: str, company: str = "") -> Dict[str, Any]:
    """Generate comprehensive interview questions organized by category with difficulty levels."""
    model = get_model()
    
    categories = get_role_categories(role)
    company_context = f"Focus on questions asked at {company} or similar top companies." if company else "Include questions from top tech companies like Google, Amazon, Microsoft, Meta."
    
    prompt = f"""You are an expert interview coach. Generate REAL interview questions for a {experience_level} {role} position.

{company_context}

Generate questions organized by these categories:
{json.dumps([{"name": c["name"], "count": c["count"]} for c in categories], indent=2)}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Questions should be REAL questions asked in actual interviews
3. Each category with 9 questions MUST have: 3 easy, 3 medium, 3 hard
4. Categories with 6-8 questions should have balanced difficulty
5. Include company names where the question was asked (or likely asked)
6. NO sample answers - questions ONLY
7. Keep questions concise but complete

Return this EXACT JSON structure:
{{
    "role": "{role}",
    "experience_level": "{experience_level}",
    "total_questions": <sum of all questions>,
    "estimated_time": "<X-Y hours based on question count>",
    "categories": [
        {{
            "name": "<category name>",
            "icon": "<icon name>",
            "questions": [
                {{"id": 1, "question": "<actual interview question>", "difficulty": "easy", "company": "<company name>", "topic": "<sub-topic>"}},
                {{"id": 2, "question": "...", "difficulty": "easy", "company": "...", "topic": "..."}},
                {{"id": 3, "question": "...", "difficulty": "easy", "company": "...", "topic": "..."}},
                {{"id": 4, "question": "...", "difficulty": "medium", "company": "...", "topic": "..."}},
                {{"id": 5, "question": "...", "difficulty": "medium", "company": "...", "topic": "..."}},
                {{"id": 6, "question": "...", "difficulty": "medium", "company": "...", "topic": "..."}},
                {{"id": 7, "question": "...", "difficulty": "hard", "company": "...", "topic": "..."}},
                {{"id": 8, "question": "...", "difficulty": "hard", "company": "...", "topic": "..."}},
                {{"id": 9, "question": "...", "difficulty": "hard", "company": "...", "topic": "..."}}
            ]
        }}
    ]
}}

Generate questions for ALL {len(categories)} categories. Be specific and realistic."""

    try:
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        
        try:
            result = json.loads(result_text)
            # Validate and add icons from our mapping
            for i, cat in enumerate(result.get("categories", [])):
                if i < len(categories):
                    cat["icon"] = categories[i]["icon"]
            return result
        except json.JSONDecodeError as je:
            logger.warning(f"JSON parse error in interview questions: {str(je)}")
            # Try to fix and reparse
            import re
            result_text = re.sub(r',\s*([}\]])', r'\1', result_text)
            last_brace = result_text.rfind('}')
            if last_brace != -1:
                result_text = result_text[:last_brace + 1]
            return json.loads(result_text)
            
    except Exception as e:
        logger.error(f"Interview question generation failed: {str(e)}")
        # Return fallback comprehensive questions
        return generate_fallback_questions(role, experience_level, categories)


async def evaluate_interview_answers(role: str, questions_with_answers: list) -> Dict[str, Any]:
    """Evaluate user's answers to interview questions"""
    model = get_model()
    
    prompt = f"""You are an experienced technical interviewer evaluating answers for a {role} position.

Evaluate each answer based on:
1. Technical accuracy
2. Depth of understanding  
3. Communication clarity
4. Completeness

For each question-answer pair, provide:
- evaluation: "Correct" | "Partially Correct" | "Wrong"
- score: 0-10 (integer)
- feedback: Brief constructive feedback (1-2 sentences)

Return ONLY valid JSON in this format:
{{
    "results": [
        {{
            "question": "<question text>",
            "userAnswer": "<user's answer>",
            "evaluation": "Correct|Partially Correct|Wrong",
            "score": 0-10,
            "feedback": "<constructive feedback>"
        }}
    ],
    "summary": {{
        "correct": <count>,
        "partial": <count>,
        "wrong": <count>,
        "averageScore": <average score rounded to 1 decimal>
    }}
}}

Questions and Answers:
"""
    
    for idx, qa in enumerate(questions_with_answers, 1):
        prompt += f"\n\n{idx}. Question ({qa.get('difficulty', 'medium')}): {qa['question']}\n"
        prompt += f"   User's Answer: {qa['userAnswer']}\n"
    
    prompt += "\n\nProvide honest, constructive evaluations. Return ONLY the JSON, no markdown formatting."
    
    try:
        logger.info(f"Evaluating {len(questions_with_answers)} interview answers for {role}")
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Interview evaluation failed: {str(e)}")
        raise Exception(f"Failed to evaluate answers: {str(e)}")


async def generate_mock_interview_question(
    role: str,
    resume_text: str = "",
    conversation_history: Optional[List[Dict[str, str]]] = None,
    current_phase: str = "intro"
) -> Dict[str, Any]:
    """Generate the next interview question in a mock interview session."""
    model = get_model()

    if conversation_history is None:
        conversation_history = []

    # Construct conversation history string
    history_str = ""
    for msg in conversation_history:
        history_str += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"

    prompt = f"""You are an experienced Technical Recruiter conducting a mock interview.

ROLE: {role}
PHASE: {current_phase} (intro -> experience -> technical -> behavioral -> wrap-up)

CANDIDATE'S RESUME:
{resume_text or "[No resume provided]"}

CONVERSATION HISTORY:
{history_str}

YOUR TASK:
Generate the NEXT question for the candidate.
1. If in 'intro' phase: Ask about their background or a highlight from their resume.
2. If in 'experience' phase: Dig into a specific project or role.
3. If in 'technical' phase: Ask a relevant technical question for {role}.
4. If in 'behavioral' phase: Ask a STAR method question.
5. If in 'wrap-up' phase: Ask if they have questions for you.

Return JSON format:
{{
    "question": "The question text...",
    "phase": "{current_phase}",
    "difficulty": "easy|medium|hard",
    "topic": "topic of the question"
}}"""

    try:
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Mock interview question generation failed: {str(e)}")
        raise Exception(f"Mock interview question generation failed: {str(e)}")


async def evaluate_mock_interview_answer(
    role: str,
    conversation_history: List[Dict[str, str]],
    resume_text: str = ""
) -> Dict[str, Any]:
    """Evaluate the latest answer in a mock interview."""
    model = get_model()

    # Get the last question and answer
    if len(conversation_history) < 2:
        return {"feedback": "Not enough history to evaluate.", "score": 0}

    last_answer = conversation_history[-1].get('content', '')
    last_question = conversation_history[-2].get('content', '')

    prompt = f"""You are an Interview Coach. Evaluate this answer.

ROLE: {role}
QUESTION: {last_question}
ANSWER: {last_answer}

Provide constructive feedback.

Return JSON format:
{{
    "score": <0-10>,
    "feedback": "Constructive feedback...",
    "better_answer": "Example of a stronger answer..."
}}"""

    try:
        response = model.generate_content(prompt)
        result_text = clean_json_response(response.text.strip())
        return json.loads(result_text)
    except Exception as e:
        logger.error(f"Mock interview evaluation failed: {str(e)}")
        raise Exception(f"Mock interview evaluation failed: {str(e)}")

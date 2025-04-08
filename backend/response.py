import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from textblob import TextBlob
from fuzzywuzzy import fuzz
import re
import string

faculty_contacts = {
    "Dr. Amit Garg": {"email": "amit.garg@jaipur.manipal.edu", "phone": "+91 98765 43210"},
    "Amit Garg": {"email": "amit.garg@jaipur.manipal.edu", "phone": "+91 98765 43210"},
    "Prof. Neha Chaudhary": {"email": "neha.chaudhary@jaipur.manipal.edu", "phone": "+91 87654 32109"},
    "Dr. Rajesh Kumar": {"email": "rajesh.kumar@jaipur.manipal.edu", "phone": "+91 76543 21098"},
}

# Simple tokenization function (no NLTK dependency)
def tokenize(text):
    if not isinstance(text, str):
        return []
    # Convert to lowercase and remove punctuation
    text = text.lower()
    text = re.sub(f'[{string.punctuation}]', ' ', text)
    # Split by whitespace
    return [token.strip() for token in text.split() if token.strip()]

# Simple stemming function (for handling plurals without NLTK)
def simple_stem(word):
    """Very basic stemming for English words"""
    if not word or not isinstance(word, str):
        return word
        
    word = word.lower()
    
    # Common plural endings
    if len(word) > 3:
        if word.endswith('ies') and len(word) > 4:
            return word[:-3] + 'y'  # universities -> university
        elif word.endswith('es') and len(word) > 3:
            return word[:-2]  # classes -> class
        elif word.endswith('s') and not word.endswith('ss'):
            return word[:-1]  # students -> student
    
    return word

# Text preprocessing function (NLTK-free)
def preprocess_text(text):
    if not isinstance(text, str):
        return ""
        
    # Tokenize
    tokens = tokenize(text)
    
    # Apply simple stemming
    stemmed_tokens = [simple_stem(token) for token in tokens]
    
    # Rejoin tokens
    return ' '.join(stemmed_tokens)

def extract_important_terms(text):
    """Extract important keywords from text that should be mandatory for matching."""
    if not isinstance(text, str):
        return []
    
    # List of common words that aren't important for matching
    common_words = {
        'where', 'what', 'when', 'how', 'who', 'why', 
        'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by',
        'about', 'like', 'through', 'over', 'before', 'between', 'after',
        'since', 'without', 'under', 'within', 'along', 'following',
        'can', 'could', 'should', 'would', 'may', 'might', 'must',
        'do', 'does', 'did', 'doing'
    }
    
    # Clean text
    text = text.lower()
    text = re.sub(f'[{string.punctuation}]', ' ', text)
    words = [w.strip() for w in text.split() if w.strip()]
    
    # Extract potentially important terms (not in common_words)
    important_terms = [w for w in words if w not in common_words]
    
    # Extract potential proper nouns (capitalized words in original text)
    original_words = text.split()
    proper_nouns = []
    for word in original_words:
        if word and word[0].isupper():
            proper_nouns.append(word.lower())
    
    # Prioritize proper nouns and multi-word terms
    priority_terms = list(set(proper_nouns))
    
    # Add any terms that might be locations or specific identifiers
    # (numbers, building names, etc.)
    specific_indicators = [
        w for w in important_terms 
        if any(char.isdigit() for char in w)  # Contains digits
        or len(w) > 3  # Longer terms are often more specific
    ]
    
    priority_terms.extend(specific_indicators)
    
    return list(set(priority_terms))

# Load and clean data
file_path = 'university_faq.xlsx'
df = pd.read_excel(file_path)
df.columns = df.columns.str.strip()

# Preprocess the dataset
df['Processed_Question'] = df['Question'].apply(preprocess_text)
df['Processed_Keyword'] = df['Keyword'].apply(preprocess_text)
df['Important_Terms'] = df['Question'].apply(extract_important_terms)

# Add entity extraction to keywords too
df['Keyword_Entities'] = df['Keyword'].apply(extract_important_terms)

# Build domain dictionary for spelling correction
domain_dictionary = set()
for text in df['Question'].tolist() + df['Keyword'].tolist():
    if isinstance(text, str):
        tokens = tokenize(text)
        domain_dictionary.update(tokens)

# Display first few rows of the processed dataset
df.head()

# Function to generate variations
def generate_variations(text):
    if not isinstance(text, str):
        return [text] if text else [""]
        
    variations = [text]
    
    # Simple plural/singular handling
    words = text.split()
    for i, word in enumerate(words):
        # Try both stemmed and original forms
        stemmed = simple_stem(word)
        if stemmed != word:
            new_words = words.copy()
            new_words[i] = stemmed
            variations.append(' '.join(new_words))
    
    # Add common misspellings for university terms
    common_misspellings = {
        'university': ['univercity', 'univarsity', 'uni'],
        'admission': ['admision', 'admisssion'],
        'scholarship': ['scolarship', 'scholarshipp'],
        'registration': ['registraton', 'registeration', 'signup'],
        'course': ['cours', 'coarse', 'class'],
        'professor': ['professer', 'proffesor', 'prof'],
        'semester': ['semister', 'semestre', 'term'],
        'tuition': ['tution', 'tuishon', 'fees'],
        'degree': ['degre', 'diploma', 'qualification'],
        'dormitory': ['dorm', 'housing', 'residence'],
        'major': ['specialization', 'concentration', 'field'],
        'credit': ['cred', 'unit', 'point'],
        'exam': ['examination', 'test', 'assessment'],
        'financial': ['fiscal', 'money', 'monetary'],
        'transfer': ['xfer', 'switch', 'change'],
        'deadline': ['due date', 'cutoff', 'timeframe'],
        'application': ['app', 'apply', 'submission'],
        'schedule': ['timetable', 'calendar', 'agenda']
    }
    
    for word, misspellings in common_misspellings.items():
        if word in text:
            for misspelling in misspellings:
                variations.append(text.replace(word, misspelling))
                
    return variations

# Uncommenting this section will expand your dataset with variations

# Option to expand dataset with variations
expanded_questions = []
expanded_keywords = []
expanded_answers = []
expanded_indices = []

for idx, row in df.iterrows():
    question_variations = generate_variations(row['Processed_Question'])
    keyword_variations = generate_variations(row['Processed_Keyword'])
    
    for q_var in question_variations:
        for k_var in keyword_variations:
            expanded_questions.append(q_var)
            expanded_keywords.append(k_var)
            expanded_answers.append(row['Answer'])
            expanded_indices.append(idx)  # Keep track of original index

expanded_df = pd.DataFrame({
    'Processed_Question': expanded_questions,
    'Processed_Keyword': expanded_keywords,
    'Answer': expanded_answers,
    'Original_Index': expanded_indices
})

# Use expanded dataset or original
# use_df = expanded_df
use_df = df  # Comment this out if using expanded dataset


# Initialize TF-IDF vectorizers with improved parameters
question_vectorizer = TfidfVectorizer(
    min_df=1, max_df=0.9,
    ngram_range=(1, 2),  # Include bigrams
    stop_words='english'
)

keyword_vectorizer = TfidfVectorizer(
    min_df=1, max_df=0.9,
    ngram_range=(1, 2),
    stop_words='english'
)

# Fit vectorizers
question_vectors = question_vectorizer.fit_transform(df['Processed_Question'])
keyword_vectors = keyword_vectorizer.fit_transform(df['Processed_Keyword'])

def correct_spelling(text):
    if not isinstance(text, str):
        return str(text) if text else ""
        
    try:
        corrected = str(TextBlob(text).correct())
        
        # Protect domain-specific terms from "correction"
        words = text.lower().split()
        corrected_words = corrected.lower().split()
        
        # Only replace words if length matches
        if len(words) == len(corrected_words):
            for i, (orig_word, corr_word) in enumerate(zip(words, corrected_words)):
                if orig_word in domain_dictionary and orig_word != corr_word:
                    corrected_words[i] = orig_word
            
            return ' '.join(corrected_words)
        return corrected
    except Exception as e:
        print(f"Spelling correction error: {e}")
        return text

def get_faculty_contact(user_input):
    try:
        user_input_lower = user_input.lower()
        print(f"[DEBUG] User Input: {user_input}")

        for faculty in faculty_contacts.keys():
            faculty_pattern = re.compile(rf"\b{re.escape(faculty.lower())}\b", re.IGNORECASE)
            match_found = faculty_pattern.search(user_input_lower)

            print(f"[DEBUG] Checking faculty: {faculty} | Match Found: {match_found}")

            if match_found:
                contact_info = faculty_contacts[faculty]
                return {
                    "answer": f"{faculty} can be reached at:\n📧 Email: {contact_info['email']}\n📞 Phone: {contact_info['phone']}",
                    "confidence": 1.0,
                    "match_type": "faculty_contact",
                    "matched_faculty": faculty
                }

        print("[DEBUG] No matching faculty found.")
        return {
            "answer": "I couldn't find the contact details for the requested faculty. Please check the name and try again.",
            "confidence": 0.0,
            "match_type": "faculty_contact_not_found",
            "matched_faculty": None
        }
    
    except Exception as e:
        print(f"[ERROR] Faculty contact lookup failed: {e}")
        return {
            "answer": "Sorry, I encountered an error processing your question. Please try again with different wording.",
            "confidence": 0.0,
            "match_type": "error",
            "matched_faculty": None
        }


import traceback

def match_input(processed_input, original_input):
    try:
        
        # Ensure vectorizers and vectors are loaded
        if question_vectorizer is None or keyword_vectorizer is None or question_vectors is None or keyword_vectors is None:
            return {'answer': "Error: Missing vector data.", 'confidence': 0.0, 'match_type': 'error', 'matched_question': ""}

        # Extract important terms from user input
        user_important_terms = extract_important_terms(original_input)
        
        # Vector matching
        user_question_vector = question_vectorizer.transform([processed_input])
        question_similarities = cosine_similarity(user_question_vector, question_vectors)
        
        user_keyword_vector = keyword_vectorizer.transform([processed_input])
        keyword_similarities = cosine_similarity(user_keyword_vector, keyword_vectors)

        # Get top 5 matches
        top_n = 5
        top_question_indices = question_similarities[0].argsort()[-top_n:][::-1]
        top_question_scores = question_similarities[0][top_question_indices]

        top_keyword_indices = keyword_similarities[0].argsort()[-top_n:][::-1]
        top_keyword_scores = keyword_similarities[0][top_keyword_indices]

        # Handle case when there are no matches
        if len(top_question_indices) == 0:
            return {'answer': "No relevant match found.", 'confidence': 0.0, 'match_type': 'none', 'matched_question': ""}
        
        if len(top_keyword_indices) == 0:
            return {'answer': "No relevant match found.", 'confidence': 0.0, 'match_type': 'none', 'matched_question': ""}

        # Check for important term matches in top question matches
        question_match_idx = -1
        question_score = 0

        for i, idx in enumerate(top_question_indices):
            db_important_terms = df.iloc[idx]['Important_Terms']
            if not isinstance(db_important_terms, list):
                db_important_terms = []

            matching_terms = set(db_important_terms).intersection(set(processed_input.lower().split()))

            if len(matching_terms) > 0:
                term_match_ratio = len(matching_terms) / max(1, len(db_important_terms))
                adjusted_score = top_question_scores[i] * (0.5 + 0.5 * term_match_ratio)

                if adjusted_score > question_score:
                    question_score = adjusted_score
                    question_match_idx = idx

        # Check for important term matches in top keyword matches
        keyword_match_idx = -1
        keyword_score = 0

        for i, idx in enumerate(top_keyword_indices):
            keyword_entities = df.iloc[idx]['Keyword_Entities']
            if not isinstance(keyword_entities, list):
                keyword_entities = []

            matching_entities = set(keyword_entities).intersection(set(processed_input.lower().split()))

            if len(matching_entities) > 0:
                entity_match_ratio = len(matching_entities) / max(1, len(keyword_entities))
                adjusted_score = top_keyword_scores[i] * (0.5 + 0.5 * entity_match_ratio)

                if adjusted_score > keyword_score:
                    keyword_score = adjusted_score
                    keyword_match_idx = idx

        # If no match with important terms, fallback to highest score match
        if question_match_idx == -1:
            question_match_idx = top_question_indices[0]
            question_score = top_question_scores[0] * 0.7  # Reduce confidence
            
        if keyword_match_idx == -1:
            keyword_match_idx = top_keyword_indices[0]
            keyword_score = top_keyword_scores[0] * 0.7  # Reduce confidence

        # Determine best match
        if keyword_score > question_score:
            return {
                'answer': df.iloc[keyword_match_idx]['Answer'],
                'confidence': keyword_score,
                'match_type': 'keyword',
                'matched_question': df.iloc[keyword_match_idx]['Question']
            }
        else:
            return {
                'answer': df.iloc[question_match_idx]['Answer'],
                'confidence': question_score,
                'match_type': 'question', 
                'matched_question': df.iloc[question_match_idx]['Question']
            }

    except Exception as e:
        print(f"Vector matching error: {e}")
        traceback.print_exc()
        return {'answer': "", 'confidence': 0.0, 'match_type': 'error', 'matched_question': ""}
    
def process_input(user_input):
    contact_triggers = ["contact of", "contact", "email", "phone", "number", "mobile", "how to reach", "call", "cabin"]
    
    # Check if input contains contact-related words
    if any(trigger in user_input.lower() for trigger in contact_triggers):
        faculty_response = get_faculty_contact(user_input)
        if faculty_response["matched_faculty"]:  # Ensure faculty is found
            return faculty_response  

    # If not a contact request, proceed with standard question matching
    processed_input = preprocess_text(user_input)
    return match_input(processed_input, user_input)

def get_response(user_input, confidence_threshold=0.5):
    if not isinstance(user_input, str) or not user_input.strip():
        return "I need a question to help you.", 0.0, ""

    result = process_input(user_input)  
    if result['confidence'] >= confidence_threshold:
        return result['answer'], result['confidence'], result.get('matched_question', '')

    # Try spelling correction only for non-faculty queries
    if result["match_type"] != "faculty_contact":
        corrected_input = correct_spelling(user_input)
        if corrected_input.lower() != user_input.lower():
            processed_corrected = preprocess_text(corrected_input)
            corrected_result = match_input(processed_corrected, corrected_input)
            if corrected_result['confidence'] > result['confidence']:
                return corrected_result['answer'], corrected_result['confidence'], corrected_result.get('matched_question', ''), corrected_input

    # Try fuzzy matching as another fallback
    fuzzy_result = fuzzy_match(user_input)
    if fuzzy_result['confidence'] > result['confidence']:
        return fuzzy_result['answer'], fuzzy_result['confidence'], fuzzy_result.get('matched_question', '')

    if result['confidence'] > 0.15:
        return result['answer'], result['confidence'], result.get('matched_question', '')

    return "I'm not sure I understand. Could you rephrase your question?", 0.0, ""




def fuzzy_match(user_input):
    max_score = 0
    best_idx = -1
    
    # Extract important terms from user input
    user_important_terms = extract_important_terms(user_input)
    
    # Try both question and keyword fuzzy matching
    for idx, row in df.iterrows():
        try:
            question = row.get('Question', '')
            keyword = row.get('Keyword', '')
            
            if isinstance(question, str) and isinstance(keyword, str):
                # Use token_sort_ratio for better handling of word order differences
                q_score = fuzz.token_sort_ratio(user_input.lower(), question.lower())
                k_score = fuzz.token_sort_ratio(user_input.lower(), keyword.lower())
                
                # Also try partial ratio for substring matching
                q_partial = fuzz.partial_ratio(user_input.lower(), question.lower())
                k_partial = fuzz.partial_ratio(user_input.lower(), keyword.lower())
                
                # Take the best score
                max_row_score = max(q_score, k_score, q_partial, k_partial) / 100
                
                # Check if important terms match
                important_terms = row.get('Important_Terms', [])
                if important_terms:
                    matching_terms = [term for term in important_terms if term in user_input.lower()]
                    # If no important terms match, reduce the score
                    if len(matching_terms) == 0 and len(important_terms) > 0:
                        max_row_score *= 0.7
                
                if max_row_score > max_score:
                    max_score = max_row_score
                    best_idx = idx
        except Exception as e:
            print(f"Fuzzy matching error on row {idx}: {e}")
    
    if best_idx >= 0:
        return {
            'answer': df.iloc[best_idx]['Answer'],
            'confidence': max_score,
            'match_type': 'fuzzy',
            'matched_question': df.iloc[best_idx]['Question']
        }
    return {'answer': "", 'confidence': 0.0, 'match_type': 'fuzzy_failed', 'matched_question': ""}

def fuzzy_match_faculty_name(name):
    """Fuzzy match a name against faculty contacts"""
    best_match = None
    best_score = 0
    threshold = 80  # Minimum similarity score to consider a match
    
    for faculty_name in faculty_contacts.keys():
        # Remove titles for matching
        clean_faculty = re.sub(r'^(Dr\.|Prof\.)\s*', '', faculty_name).lower()
        clean_name = name.lower()
        
        # Try different fuzzy matching methods
        ratio = fuzz.ratio(clean_name, clean_faculty)
        partial_ratio = fuzz.partial_ratio(clean_name, clean_faculty)
        token_sort_ratio = fuzz.token_sort_ratio(clean_name, clean_faculty)
        
        # Take the best score
        score = max(ratio, partial_ratio, token_sort_ratio)
        
        if score > best_score and score >= threshold:
            best_score = score
            best_match = faculty_name
            
    return best_match, best_score

def is_likely_name(text):
    """Check if text is likely a person's name"""
    # Remove any titles
    text = re.sub(r'^(Dr\.|Prof\.)\s*', '', text.strip())
    
    # Split into words
    words = text.split()
    
    # Must have 1-3 words
    if len(words) < 1 or len(words) > 3:
        return False
    
    # Common non-name words that might appear in queries
    non_name_words = {
        'admission', 'process', 'fee', 'structure', 'course', 'duration',
        'placement', 'statistics', 'faculty', 'information', 'infrastructure',
        'library', 'campus', 'hostel', 'mess', 'cafeteria', 'sports',
        'scholarship', 'exam', 'result', 'syllabus', 'lab', 'project',
        'internship', 'job', 'company', 'recruiter', 'salary', 'package'
    }
    
    # Check if any word is in the non-name words list
    if any(word.lower() in non_name_words for word in words):
        return False
    
    # Each word must:
    # - Be at least 2 characters long
    # - Contain only letters and possibly dots
    for word in words:
        if len(word) < 2:
            return False
        if not re.match(r'^[A-Za-z.]+$', word):
            return False
    
    return True

def chatbot_response(user_message):
    # Check if it's a contact query
    contact_query_match = re.match(r"(?:contact|email|phone|details)\s+of\s+(.+)", user_message.lower())
    if contact_query_match:
        name = contact_query_match[1].strip()
        
        # First try exact match with the given name
        for faculty_name, contact_info in faculty_contacts.items():
            if name.lower() in faculty_name.lower() or faculty_name.lower() in name.lower():
                return 1.0, f"Contact information for {faculty_name}:\nEmail: {contact_info['email']}\nPhone: {contact_info['phone']}"
        
        # If no exact match, try fuzzy matching
        fuzzy_match, score = fuzzy_match_faculty_name(name)
        if fuzzy_match:
            return 0.4, f"Did you mean contact information for {fuzzy_match}?"
        
        return 0.0, f"Currently no contact exists for {name}"

    # Check if it's just a name (and looks like a real name)
    if is_likely_name(user_message):
        name = user_message.strip()
        
        # First check if this exact name exists
        for faculty_name, contact_info in faculty_contacts.items():
            if name.lower() in faculty_name.lower() or faculty_name.lower() in name.lower():
                return 0.0, f"Would you like to know the contact information for {faculty_name}?"
        
        # If no exact match, try fuzzy matching
        fuzzy_match, score = fuzzy_match_faculty_name(name)
        if fuzzy_match:
            return 0.0, f"Would you like to know the contact information for {fuzzy_match}?"
        
        # If no match at all, return with low confidence to trigger the clarification
        return 0.0, f"Would you like to know the contact information for {name}?"

    # For all other queries (not names), use the regular response system
    result = get_response(user_message)
    
    # Unpack response based on length
    if len(result) == 4:  # Corrected spelling case
        answer, confidence, matched_question, corrected = result
        return confidence, answer  # Return in the correct order
    elif len(result) == 3:  # Normal case with matched question
        answer, confidence, matched_question = result
        return confidence, answer  # Return in the correct order
    else:
        answer, confidence = result
        return confidence, answer  # Return in the correct order
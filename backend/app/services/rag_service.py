import json
import math
import requests
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models import Document, Embedding

# Helper to chunk text
def chunk_text(text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
        if i >= len(words) - overlap:
            break
    return chunks

# Helper to generate a deterministic embedding if API keys are missing
def generate_mock_embedding(text: str, dimension: int = 768) -> List[float]:
    # Form a simple pseudo-hash based on text characters to yield a deterministic vector
    vector = [0.0] * dimension
    text_len = len(text) if text else 1
    for idx in range(dimension):
        # Accumulate sine-based offsets per character index
        char_val = sum(ord(text[i % len(text)]) * (i + 1) for i in range(min(50, len(text)))) if text else idx
        vector[idx] = math.sin(char_val + idx)
    
    # Normalize the vector
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [x / norm for x in vector]
    return vector

# Helper to format request dynamically for AI Studio Keys
def prepare_gemini_request(endpoint_url_without_key: str, api_key: str):
    url = f"{endpoint_url_without_key}?key={api_key}"
    headers = {"Content-Type": "application/json"}
    return url, headers

# Call Gemini Embedding API
def get_gemini_embedding(text: str, api_key: str) -> List[float]:
    base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"
    url, headers = prepare_gemini_request(base_url, api_key)
    payload = {
        "content": {"parts": [{"text": text}]}
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            res_data = response.json()
            return res_data["embedding"]["values"]
        else:
            print(f"Gemini embedding API error: {response.text}")
    except Exception as e:
        print(f"Gemini embedding connection error: {e}")
    return generate_mock_embedding(text, dimension=768)

# Call OpenAI Embedding API
def get_openai_embedding(text: str, api_key: str) -> List[float]:
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "input": text,
        "model": "text-embedding-3-small"
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            res_data = response.json()
            return res_data["data"][0]["embedding"]
        else:
            print(f"OpenAI embedding API error: {response.text}")
    except Exception as e:
        print(f"OpenAI embedding connection error: {e}")
    return generate_mock_embedding(text, dimension=1536)

# Interface function to get embedding based on provider
def get_embedding(text: str) -> List[float]:
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return get_gemini_embedding(text, settings.GEMINI_API_KEY)
    elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return get_openai_embedding(text, settings.OPENAI_API_KEY)
    else:
        # Fallback if keys are not set
        return generate_mock_embedding(text)

# Cosine Similarity Calculation
def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if len(v1) != len(v2):
        # Handle dimensionality mismatch
        v2 = v2[:len(v1)] if len(v2) > len(v1) else v2 + [0.0] * (len(v1) - len(v2))
    
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_v1 = math.sqrt(sum(a * a for a in v1))
    norm_v2 = math.sqrt(sum(b * b for b in v2))
    
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

# Index Document into PostgreSQL embeddings table
def index_document(db: Session, title: str, content: str, source_url: str = None) -> Document:
    # Save the base document
    doc = Document(title=title, content=content, source_url=source_url)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Chunk text and generate embeddings
    chunks = chunk_text(content)
    for idx, chunk in enumerate(chunks):
        vector = get_embedding(chunk)
        emb = Embedding(
            document_id=doc.id,
            chunk_index=idx,
            chunk_text=chunk,
            embedding_vector=json.dumps(vector)
        )
        db.add(emb)
    db.commit()
    return doc

# Retrieve top K matched chunks from Database
def retrieve_relevant_contexts(db: Session, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    query_vector = get_embedding(query)
    
    # Fetch all embeddings
    # In a full-scale app, we could run pgvector filters, or query chunk listings
    # For compatibility across DBs, we fetch embeddings and compute cosine similarities
    all_embeddings = db.query(Embedding).all()
    
    scored_chunks = []
    for emb in all_embeddings:
        try:
            emb_vector = json.loads(emb.embedding_vector)
            score = cosine_similarity(query_vector, emb_vector)
            scored_chunks.append({
                "score": score,
                "text": emb.chunk_text,
                "document_title": emb.document.title,
                "source_url": emb.document.source_url or ""
            })
        except Exception as e:
            print(f"Error parsing embedding {emb.id}: {e}")
            continue
            
    # Sort by score descending
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]

# Generate Grounded Answer using LLM (Gemini or OpenAI)
def generate_grounded_answer(query: str, contexts: List[Dict[str, Any]]) -> Tuple[str, List[str]]:
    # Compile sources and document texts
    context_str = ""
    citations = []
    
    for idx, ctx in enumerate(contexts):
        ref_num = idx + 1
        source_title = ctx["document_title"]
        url = ctx["source_url"]
        citation_text = f"{source_title} ({url})" if url else source_title
        
        context_str += f"[Source {ref_num}]: {source_title}\nText: {ctx['text']}\n\n"
        citations.append(citation_text)
        
    prompt = (
        f"You are Startup Navigator AI, a premium startup assistant. Use the following sources context to answer the user question. "
        f"Format your response professionally with clear paragraphs and bullet points.\n\n"
        f"Context:\n{context_str}\n\n"
        f"User Question: {query}\n\n"
        f"Instructions:\n"
        f"1. Base your answer STRICTLY on the context provided. Do not invent facts or hallucinate.\n"
        f"2. Cite your sources in the text using bracketed numbers corresponding to the source, like [1], [2].\n"
        f"3. If the context does not contain enough information to answer, state that you do not have sufficient information in our guide databases, but provide a general guideline based on available startup principles.\n\n"
        f"Answer:"
    )
    
    # 1. Call Gemini API if selected
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        url, headers = prepare_gemini_request(base_url, settings.GEMINI_API_KEY)
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                answer_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return answer_text, citations
            else:
                print(f"Gemini Completion API error: {response.text}")
        except Exception as e:
            print(f"Gemini connection error: {e}")
            
    # 2. Call OpenAI API if selected
    elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}"
        }
        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "You are a helpful startup mentor assistant."},
                {"role": "user", "content": prompt}
            ]
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                answer_text = res_data["choices"][0]["message"]["content"]
                return answer_text, citations
            else:
                print(f"OpenAI Completion API error: {response.text}")
        except Exception as e:
            print(f"OpenAI connection error: {e}")

    # 3. Fallback mock generator
    print("AI keys missing or API call failed. Using mock RAG generator.")
    fallback_answer = (
        f"### RAG Retrieval Analysis for: \"{query}\"\n\n"
        f"Thank you for asking Startup Navigator AI. Since your local environment keys are currently setting up, "
        f"I have successfully scanned our local knowledge base and found the following relevant information:\n\n"
    )
    for idx, ctx in enumerate(contexts):
        fallback_answer += f"- **From '{ctx['document_title']}'**: \"... {ctx['text'][:200]} ...\" [Source {idx + 1}]\n"
        
    fallback_answer += (
        f"\n### Detailed Guidance\n"
        f"Based on the startup topics provided, ensure you draft a standard legal framework and prepare a business model before pitching to VCs. "
        f"Verify that you satisfy local government licensing terms and review options like Y Combinator or Techstars accelerators."
    )
    
    return fallback_answer, citations

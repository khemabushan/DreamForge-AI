# 🌙 DreamForge AI

> Transform dreams into cinematic visual stories using Artificial Intelligence.

DreamForge AI is a full-stack AI platform that converts natural language dream descriptions into structured scene graphs, storyboards, AI-generated images, and eventually cinematic videos.

Built with FastAPI, Next.js, PostgreSQL, Redis, Celery, OpenAI, and Replicate.

---

## ✨ Features

### 🧠 AI Dream Understanding
- Natural language dream parsing
- Entity extraction (characters, locations, objects, emotions)
- Structured scene graph generation using OpenAI

### 🌐 Interactive Scene Graph
- Visual graph representation using React Flow
- Character, location, object, and emotion nodes
- Relationship edges between dream entities

### 🎬 AI Storyboard Generation
- Converts scene graphs into cinematic storyboards
- Generates multiple sequential panels
- Camera notes and detailed image prompts

### 🎨 AI Image Generation
- Powered by Replicate Flux Schnell
- Consistent image generation using shared seeds
- Multiple storyboard panels rendered automatically

### ⚡ Background Processing
- Redis + Celery task queue
- Real-time pipeline progress tracking
- Non-blocking AI generation workflows

### 📹 Video Generation (Coming Soon)
- Placeholder video support implemented
- Planned integration with:
  - Runway Gen-3
  - Luma Dream Machine
  - Kling AI

---

# 🏗️ System Architecture

```text
User Dream Input
        │
        ▼
NLP Parser (OpenAI)
        │
        ▼
Scene Graph Builder
        │
        ▼
Storyboard Generator
        │
        ▼
Image Generator (Replicate Flux)
        │
        ▼
Video Generator (Future)
```

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- React Flow
- Lucide Icons

## Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Redis
- Celery
- Pydantic

## AI & ML

- OpenAI GPT
- Replicate Flux Schnell
- Prompt Engineering
- Scene Graph Generation
- Storyboard Generation

---

# 📂 Project Structure

```text
dreamforge-AI
│
├── dreamforge-api-final
│   ├── app
│   │   ├── ai_pipeline
│   │   │   ├── stages
│   │   │   ├── providers
│   │   │   └── orchestrator.py
│   │   │
│   │   ├── repositories
│   │   ├── services
│   │   ├── workers
│   │   └── models
│   │
│   └── requirements.txt
│
└── dreamforge-web-final
    └── dreamforge-web
        ├── src
        │   ├── components
        │   ├── hooks
        │   ├── pages
        │   └── lib
        │
        └── package.json
```

---

# 🚀 Getting Started

## Backend Setup

```bash
cd dreamforge-api-final

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt
```

---

## Environment Variables

Create:

```text
dreamforge-api-final/.env
```

Example:

```env
DATABASE_URL=postgresql+asyncpg://dreamforge:dreamforge@localhost:5432/dreamforge

REDIS_URL=redis://localhost:6379/0

CELERY_BROKER_URL=redis://localhost:6379/1

CELERY_RESULT_BACKEND=redis://localhost:6379/2

OPENAI_API_KEY=YOUR_OPENAI_KEY

REPLICATE_API_TOKEN=YOUR_REPLICATE_TOKEN

RUNWAY_API_KEY=
```

---

## Run Backend

```bash
uvicorn app.main:app --reload
```

---

## Run Celery Worker

```bash
python -m celery -A app.workers.celery_app worker --pool=solo --loglevel=info
```

---

## Frontend Setup

```bash
cd dreamforge-web-final/dreamforge-web

npm install

npm run dev
```

---

# 📸 Screenshots

## Dream Input

> Users describe their dreams naturally.

---

## Scene Graph

Interactive visualization of:

- Characters
- Locations
- Objects
- Emotions

Built using React Flow.

---

## Storyboard

AI-generated cinematic panels with:

- Scene descriptions
- Camera directions
- Prompt engineering

---

## Image Generation

Generated using:

- Replicate
- Flux Schnell

---

# 🔥 Future Roadmap

## Phase 2

### 🎥 AI Video Generation
- Runway Gen-3
- Luma Dream Machine
- Kling AI

### 🎵 Background Music Generation
- AI-generated dream ambience
- Mood-based soundtrack generation

### 🗣️ Dream Narration
- AI voice-over generation
- Text-to-speech integration

### 🌍 Dream Community
- Public dream gallery
- Social sharing
- Dream collections

### 📱 Mobile Support
- Responsive UI
- PWA implementation

---

# 🎓 Educational Value

DreamForge demonstrates:

- Full-Stack Development
- Microservice Architecture
- Asynchronous Task Processing
- AI Pipeline Orchestration
- Prompt Engineering
- Scene Graph Generation
- Large Language Model Integration
- Image Generation APIs
- Modern React Development

---

# 👨‍💻 Author

**Hemabushan K**

B.Tech CSE (AI & ML)

Passionate about:

- Artificial Intelligence
- Machine Learning
- Full-Stack Development
- Generative AI Systems

GitHub:

https://github.com/khemabushan

---

# ⭐ Support

If you found this project interesting, please consider giving it a ⭐ on GitHub!

---

> Dreams are stories waiting to be visualized. DreamForge turns imagination into reality.

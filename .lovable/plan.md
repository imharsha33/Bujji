

# AI Chatbot — Powered by Lovable AI

A full-featured chatbot application that works automatically without any API key setup.

## Pages & Layout

### Chat Page (Home)
- Clean, modern chat interface (similar to ChatGPT/Claude style)
- Sidebar with conversation history list
- Main chat area with message bubbles
- Input bar at bottom with send button and file upload

## Features

### 1. Chat Interface
- User and assistant message bubbles with distinct styling
- Streaming responses (tokens appear as they arrive)
- Auto-scroll to latest message
- Loading indicator while AI is thinking

### 2. Markdown Rendering
- Rich markdown support: headings, bold, italic, lists
- Code blocks with syntax highlighting
- Inline code formatting

### 3. Conversation History
- Sidebar listing past conversations
- Create new conversation button
- Switch between conversations
- Conversations stored in browser (localStorage)

### 4. File & Image Handling
- Upload button in the input area
- Display uploaded images inline in the chat
- Send image descriptions to the AI for discussion

### 5. Backend (Lovable Cloud Edge Function)
- Edge function that proxies requests to Lovable AI Gateway
- System prompt configured on backend for the assistant personality
- Streaming SSE responses
- Handles rate limit (429) and payment (402) errors gracefully

## Design
- Dark-themed chat UI with clean typography
- Responsive — works on mobile and desktop
- Smooth animations for message appearance


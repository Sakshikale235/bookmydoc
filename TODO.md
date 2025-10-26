# TODO: User Profile Restructuring and Symptom Management

## Overview
Restructure UserProfile page to include:
- Symptoms section with sidebar for short-term and long-term diseases
- PDF upload/view functionality using jar.png icons
- Chat history display for symptom checker

## Database Setup
- [ ] Verify/create chat_messages table in Supabase (columns: id, user_id, message_text, sender, timestamp)
- [ ] Confirm patients table has short_term_disease and long_term_disease columns
- [ ] Confirm storage buckets: short_term_diseases, long_term_diseases

## Frontend Components
- [ ] Add "Symptoms" tab to UserProfile sidebar
- [ ] Create SymptomsSection component with left sidebar layout
- [ ] Add short-term diseases section (cold, cough, viral fever, etc.)
- [ ] Add long-term diseases section (skin disease, diabetes, etc.)
- [ ] Integrate jar.png icons with edit/view functionality
- [ ] Implement PDF upload to respective buckets
- [ ] Create PDF viewer modal for viewing saved PDFs
- [ ] Create ChatHistory component for center section
- [ ] Update UserProfile layout to show chat history in center

## Chat History Implementation
- [ ] Modify Chatbot.tsx to save messages to chat_messages table
- [ ] Update UserProfile to fetch and display chat history
- [ ] Ensure chat history is filtered by user_id
 
## Testing
- [ ] Test PDF upload functionality for both disease types
- [ ] Test PDF view functionality with modal
- [ ] Test chat history persistence and display
- [ ] Test overall layout and responsiveness

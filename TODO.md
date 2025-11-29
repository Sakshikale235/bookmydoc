# Interactive Symptom Checker Chatbot Implementation

## Overview
Enhance the chatbot to be interactive: recover from bad input, handle follow-ups, guide users, support out-of-flow interactions like doctor searches, edits, and emergencies.

## Steps

### 1. Add Validators and Intent Detection to Chatbot.tsx
- [ ] Add validateAge, validateHeight, validateWeight functions.
- [ ] Add detectSimpleIntent function for local rule-based intent detection.
- [ ] Add state for summary visibility, edit mode, and conversation history.

### 2. Update handleNext Logic
- [ ] Modify handleNext to route based on intents (doctor_search, edit, emergency, etc.).
- [ ] Add validation for current step inputs.
- [ ] Handle edit commands (e.g., "change age to 30").
- [ ] Handle doctor queries mid-flow.
- [ ] Add emergency handling with banner.

### 3. Create SummaryCard Component
- [ ] Create react-frontend/src/components/ui/SummaryCard.tsx.
- [ ] Display collected user info (age, gender, height, weight, location, BMI).
- [ ] Add edit buttons for each field.

### 4. Integrate SummaryCard into Chatbot
- [ ] Add SummaryCard above the input area.
- [ ] Handle edit button clicks to jump to specific steps.

### 5. Add Backend Endpoints
- [ ] Add doctor_search endpoint in backend/api/views.py.
- [ ] Add doctor_detail endpoint.
- [ ] Optionally add classify_intent endpoint using Gemini.

### 6. Update UI and Flows
- [ ] Add quick reply buttons (Continue, Edit Age, Show doctors).
- [ ] Ensure session persistence for logged-in users.
- [ ] Add clarifying questions for low-confidence intents.

### 7. Testing
- [ ] Test invalid input recovery (e.g., invalid age).
- [ ] Test edit flow (e.g., "change age to 30").
- [ ] Test doctor search mid-flow (e.g., "show me Dr. X").
- [ ] Test emergency handling.
- [ ] Test out-of-flow questions.

## Dependent Files
- react-frontend/src/components/ui/Chatbot.tsx
- react-frontend/src/components/ui/SummaryCard.tsx (new)
- backend/api/views.py
- backend/api/urls.py (add new routes)

## Followup Steps
- Install any new dependencies if needed (none expected).
- Run frontend and backend, test the chatbot.
- Update documentation if necessary.

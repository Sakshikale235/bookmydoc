# Fix Profile Fetching on Restart Conversation

## Issue
When the restart conversation button is clicked, the chatbot shows "profile details and not provided" because the patient profile is not refetched after the context is reset.

## Root Cause
- `handleRestart` resets context to `createInitialContext()`, clearing `patientProfile`
- Profile fetching useEffects only run on component mount (empty dependency arrays)
- No refetching logic in `handleRestart`

## Plan
1. Modify `handleRestart` to refetch patient profile after resetting context
2. Ensure profile is available for symptom analysis after restart
3. Test that profile details are properly loaded on both landing and restart

## Implementation Steps
- [ ] Update `handleRestart` function to include profile refetching logic
- [ ] Test the fix by restarting conversation and reporting symptoms

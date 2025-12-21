# Medical Dictionary Enhancement - Priority Task

## Objective
Expand medicalMap.ts with comprehensive symptom mappings to improve NLP capabilities for symptom detection and normalization.

## Current Status
- medicalMap.ts has only basic mappings (12 entries)
- medical_dictionary.json contains extensive raw variations (~5000+ entries) but needs organization
- NLP_Improvement_Suggestions.txt identifies this as highest priority

## Tasks
- [x] Analyze medical_dictionary.json patterns and extract key symptom categories
- [ ] Create organized mappings for common symptoms (fever, cough, headache, etc.)
- [ ] Add Hinglish/Regional language mappings (bukhar, khasi, sirdard, etc.)
- [ ] Include common misspellings and alternative phrasings
- [ ] Organize mappings by symptom category with comments
- [ ] Test mappings with sample inputs
- [ ] Update medicalMap.ts with comprehensive mappings

## Key Findings
- medical_dictionary.json is a flat list of ~5000 words, not mappings
- generate_med_dict.ts shows base symptoms, conditions, Hinglish terms
- Need to manually create "variation -> normalized" mappings
- Focus on symptoms first, then conditions, then Hinglish terms

## Expected Outcome
- Significantly improved symptom recognition accuracy
- Better handling of typos, Hinglish terms, and variations
- Enhanced user experience in chatbot interactions

# QUEUE COMMANDS MASTER LIST
**Date Created:** August 27, 2025
**Purpose:** Consistent build commands for Claude to check documentation and todo lists

---

## AVAILABLE QUEUE COMMANDS:

### **`/startup [date]`**
**Purpose:** Start new session properly
**Actions:**
1. Read previous conversation logs
2. Check API testing instructions file
3. Review todo checklist 
4. Identify next section to work on
5. Set up proper testing framework

### **`/apicheck`**
**Purpose:** API Integration work verification
**Actions:**
1. Check API Integration .md file (`api-testing-instructions 8.26.2025`)
2. Review current todo checklist
3. Ensure following modular testing approach
4. Verify implementing correct sections in order

### **`/impostercheck`**
**Purpose:** Imposter Detection system work
**Actions:**
1. Check `Imposter API Setup/imposter-instructions-august-27-2025.md`
2. Check `Imposter API Setup/imposter-confidence-document-august-27-2025.md`
3. Review imposter detection todo items (Phase 4)
4. Verify API integration requirements
5. Check queue dependencies

---

## QUEUE DEPENDENCIES:

**Phase 1:** API Integrations (Foundation)
- Must complete before Phase 3 & 4
- Required for personalized reports and imposter detection

**Phase 2:** Vlog Content Ecosystem (Parallel development)
- Can develop alongside API work
- Independent of other phases

**Phase 3:** Personalized AI Reporting (Depends on Phase 1)
- Requires completed API integrations
- Foundation for user reports

**Phase 4:** Imposter Detection System (Depends on Phase 1)
- Requires API integrations for image search, domain analysis
- Uses `/impostercheck` queue

---

## USAGE NOTES:

- **Always use queue commands** before starting work on specific areas
- **Check dependencies** - don't start Phase 3 or 4 without Phase 1 complete
- **Update this list** when new queue commands are created
- **Maintain consistency** across all development sessions

---

**Last Updated:** August 27, 2025
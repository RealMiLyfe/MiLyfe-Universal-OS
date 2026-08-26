# MiLyfe Platform: Breach Scenario Tabletop Exercise Plan

## Exercise Overview
This tabletop exercise is designed to test the MiLyfe team's preparedness for various security breach scenarios involving public GitHub repositories. The exercise will help identify gaps in incident response planning, communication procedures, and technical remediation capabilities.

## Exercise Details
- **Duration**: 90-120 minutes
- **Participants**: 
  - Engineering/Tech Leads
  - Security Officer (or designated security lead)
  - DevOps/Infrastructure Engineer
  - Product Manager
  - Communications/PR Lead (if available)
  - Legal Counsel (if available, or designated substitute)
  - GitHub Repository Admin/Maintainer
- **Facilitator**: Security team member or external consultant
- **Format**: Discussion-based tabletop with scenario injection
- **Location**: Conference room or virtual meeting space
- **Materials Needed**: 
  - Scenario cards
  - Whiteboard or virtual collaboration tool
  - Incident response playbook (if exists)
  - Contact lists
  - Timeline worksheet

## Exercise Objectives
1. Test decision-making processes during security incidents
2. Evaluate communication protocols and escalation paths
3. Identify technical gaps in detection and response capabilities
4. Assess legal and regulatory compliance readiness
5. Practice public communication and stakeholder management
6. Identify improvements needed in security monitoring and tooling

## Exercise Structure

### Phase 1: Preparation (15 minutes)
- Participant introductions and role clarification
- Review of exercise objectives and ground rules
- Brief overview of current GitHub security posture
- Distribution of scenario packets

### Phase 2: Scenario Execution (60-75 minutes)
- Three progressive scenarios delivered in sequence
- 15-20 minutes discussion per scenario
- Facilitator injects additional information ("injects") as discussion progresses
- Participants document decisions, actions, and information needs

### Phase 3: Debrief and Action Planning (30 minutes)
- Review of what worked well
- Identification of gaps and improvement areas
- Creation of action items with owners and timelines
- Discussion of exercise lessons for actual incident response planning

## Scenarios

### Scenario 1: Accidental Secret Exposure
**Initial Situation**: 
A security researcher emails the project maintainer stating they found a Supabase service role key in a public GitHub repository commit from 3 days ago. The key appears to grant full access to the production database.

**Discussion Questions**:
1. What is your immediate response upon receiving this report?
2. How do you verify the validity of the claim?
3. What steps do you take to secure the exposed secret?
4. How do you determine if unauthorized access occurred?
5. What notifications need to be made and to whom?
6. How do you communicate with the reporter?
7. What is your process for key rotation and service update?

**Injects (to be provided during discussion)**:
- Inject A (after 5 minutes): The key has been used to query user profile data from 47 distinct IP addresses over the past 2 hours.
- Inject B (after 10 minutes): Legal counsel advises that user data exposure may trigger GDPR notification requirements.
- Inject C (after 15 minutes): Social media posts are starting to appear mentioning the leak.

### Scenario 2: Dependency Supply Chain Attack
**Initial Situation**:
Dependabot alerts the team to a critical vulnerability in a widely-used npm package that is a direct dependency of the milyfe-platform. The vulnerability allows remote code execution through prototype pollution. A public exploit was published 2 hours ago.

**Discussion Questions**:
1. What is your process for evaluating and responding to this alert?
2. How do you determine if your application is actually vulnerable?
3. What steps do you take to remediate the vulnerability?
4. How do you balance speed of fix with testing requirements?
5. What communication do you send to users/stakeholders?
6. How do you prevent similar incidents in the future?
7. What monitoring do you implement to detect exploitation attempts?

**Injects (to be provided during discussion)**:
- Inject A (after 5 minutes): Automated scanning shows exploitation attempts began 45 minutes ago targeting your platform's public endpoints.
- Inject B (after 10 minutes): The patch for the dependency introduces a breaking change that affects three core features.
- Inject C (after 15 minutes): Users are reporting strange behavior in the application that may be related to the exploit.

### Scenario 3: Malicious Code Injection via Compromised Maintainer Account
**Initial Situation**:
An automated security scan detects an obfuscated script in a recent commit to the milyfe-platform repository that appears to be sending user environment variables to an external domain. Investigation shows the commit was made using a maintainer's GitHub account.

**Discussion Questions**:
1. How do you respond to a potential compromise of a maintainer account?
2. What steps do you take to verify the legitimacy of recent commits?
3. How do you secure the suspected compromised account?
4. What is your process for reviewing and removing malicious code?
5. How do you determine the scope of potential data exposure?
6. What notifications and disclosures are required?
7. How do you prevent future account compromises?

**Injects (to be provided during discussion)**:
- Inject A (after 5 minutes): The malicious code has been in the repository for 11 days and was deployed to production 8 days ago via Vercel automatic deployments.
- Inject B (after 10 minutes): External logging shows data exfiltration to the suspicious domain began 9 days ago.
- Inject C (after 15 minutes): The maintainer insists their account was not compromised and that they made the commit willingly (insider threat possibility).

## Response Framework to Guide Discussion

For each scenario, participants should consider:

### 1. Detection and Verification
- How was/would the issue be detected?
- What steps verify the incident is real?
- What evidence needs to be collected?
- Who needs to be involved in verification?

### 2. Immediate Containment
- What actions stop the bleeding?
- How do you revoke/rotate exposed secrets?
- How do you isolate affected systems?
- What access needs to be revoked?

### 3. Eradication and Recovery
- How do you remove malicious code or close vulnerabilities?
- What is the process for validating fixes?
- How do you restore systems to known good state?
- What testing ensures functionality is preserved?

### 4. Communication and Notification
- Who needs to be informed internally?
- What is the timeline for notifications?
- What information can/cannot be shared publicly?
- How do you manage external communications?
- What regulatory notifications are required?

### 5. Post-Incident Activities
- What documentation is needed?
- How do you conduct a blameless post-mortem?
- What improvements are identified?
- How do you track implementation of fixes?
- What monitoring is enhanced to prevent recurrence?

## Evaluation Criteria

During the exercise, assess:

### Decision Making
- Timeliness of initial response
- Appropriateness of containment actions
- Clarity of escalation paths
- Consideration of business impact

### Communication
- Clarity and timeliness of internal communication
- Appropriateness of external messaging
- Adherence to legal/compliance requirements
- Transparency with affected parties

### Technical Response
- Effectiveness of technical controls
- Appropriateness of remediation steps
- Consideration of system dependencies
- Validation of fixes before deployment

### Preparedness
- Use of existing playbooks/procedures
- Availability of necessary access and tools
- Knowledge of reporting requirements
- Clarity of roles and responsibilities

## Post-Exercise Actions

Within 48 hours of the exercise:
1. Compile notes and observations from facilitator and participants
2. Identify top 3-5 gaps or improvement areas
3. Create specific, actionable improvement items
4. Assign owners and target completion dates
5. Schedule follow-up to track progress

Within 2 weeks:
1. Update incident response plan based on lessons learned
2. Implement quick-win improvements identified
3. Schedule a shorter follow-up exercise to test specific improvements
4. Report findings to leadership and relevant stakeholders

## Required Preparations Before Exercise

1. **Review Current State**:
   - Current GitHub repository configurations
   - Existing incident response documentation
   - Current security monitoring and alerting setup
   - Known dependencies and their versions

2. **Prepare Materials**:
   - Printed scenario cards or digital equivalents
   - Contact lists for internal and external parties
   - Relevant runbooks or playbooks
   - Timeline and action tracking worksheets

3. **Brief Participants**:
   - Explain exercise purpose and format
   - Clarify that there are no "right" answers - focus on process
   - Emphasize psychological safety and blameless discussion
   - Review confidentiality expectations

4. **Logistics**:
   - Schedule 2-hour block with minimal interruption potential
   - Arrange space (physical or virtual) with collaboration tools
   - Ensure all necessary participants can attend
   - Plan for breaks if exercise runs long

## Adaptations for Different Team Sizes

### Small Team (<5 people)
- Combine roles (e.g., tech lead also handles security)
- May need to simulate certain functions (legal, PR)
- Focus on technical response and basic communication
- Consider extending time for discussion if needed

### Large Team (>8 people)
- Consider breaking into smaller groups for initial discussion
- Use facilitator to synthesize group responses
- May run multiple scenarios in parallel tracks
- Ensure all voices are heard in discussion

### Remote/Distributed Team
- Use virtual collaboration tools (Miro, Mural, etc.)
- Ensure all participants have necessary access
- May need additional time for coordination
- Consider shorter, more frequent sessions if scheduling difficult

## Success Metrics

The exercise is successful if:
1. All participants engage actively in discussion
2. At least 3 actionable improvement items are identified
3. Participants demonstrate understanding of response processes
4. Gaps in current capabilities are identified
5. Exercise leads to concrete improvements in preparedness

Remember: The goal is not to have perfect responses, but to identify gaps and improve readiness for actual incidents.
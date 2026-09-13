-- campaign.db SCHEMA ONLY (no data). Recovered from milyfebackup 2026-09-13.
-- The data file itself holds voter contact PII and is NOT committed here.

CREATE TABLE activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            value REAL DEFAULT 0,
            timestamp TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE agent_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        task TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        progress_pct INTEGER DEFAULT 0,
        result TEXT,
        started_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE compliance_filings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filing_type TEXT NOT NULL,
            description TEXT NOT NULL,
            due_date TEXT NOT NULL,
            filed_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            notes TEXT,
            alert_sent INTEGER DEFAULT 0
        );

CREATE TABLE contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            neighborhood TEXT,
            phone TEXT,
            email TEXT,
            support_level TEXT NOT NULL DEFAULT 'undecided',
            last_contact_date TEXT,
            last_contact_method TEXT,
            notes TEXT,
            tags TEXT DEFAULT '[]',
            follow_up_needed INTEGER DEFAULT 0,
            follow_up_date TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE content_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT,
        platform TEXT,
        status TEXT NOT NULL DEFAULT 'idea',
        assigned_agent TEXT,
        fact_check_status TEXT DEFAULT 'pending',
        tags TEXT DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE content_published (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            platform TEXT NOT NULL,
            url TEXT,
            published_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE contradictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        claim_a TEXT NOT NULL,
        claim_b TEXT NOT NULL,
        source_a TEXT,
        source_b TEXT,
        type TEXT DEFAULT 'factual',
        status TEXT NOT NULL DEFAULT 'unresolved',
        resolution TEXT,
        detected_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donor_name TEXT NOT NULL,
            description TEXT NOT NULL,
            estimated_value REAL NOT NULL DEFAULT 0.0,
            contribution_type TEXT NOT NULL DEFAULT 'in-kind',
            date TEXT NOT NULL DEFAULT (date('now')),
            reported INTEGER DEFAULT 0
        );

CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT,
        type TEXT DEFAULT 'community',
        description TEXT,
        volunteers_assigned TEXT DEFAULT '[]',
        signatures_collected INTEGER DEFAULT 0,
        attendance INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE media_mentions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outlet TEXT NOT NULL,
        headline TEXT NOT NULL,
        url TEXT,
        sentiment TEXT DEFAULT 'neutral',
        candidate_mentioned TEXT,
        summary TEXT,
        date TEXT NOT NULL DEFAULT (date('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE opponent_statements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate TEXT NOT NULL,
        statement TEXT NOT NULL,
        source TEXT,
        source_url TEXT,
        date TEXT NOT NULL DEFAULT (date('now')),
        contradicts_id INTEGER,
        tags TEXT DEFAULT '[]'
    );

CREATE TABLE petition_signatures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signer_name TEXT NOT NULL,
            neighborhood TEXT,
            collector TEXT,
            location TEXT,
            collected_at TEXT NOT NULL DEFAULT (datetime('now')),
            verified INTEGER DEFAULT 0,
            notes TEXT
        );

CREATE TABLE public_records_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency TEXT NOT NULL,
        description TEXT NOT NULL,
        date_submitted TEXT,
        response_deadline TEXT,
        status TEXT NOT NULL DEFAULT 'drafted',
        documents_received TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE research_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        assigned_agent TEXT,
        status TEXT NOT NULL DEFAULT 'queued',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

CREATE TABLE social_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            handle TEXT NOT NULL,
            platform TEXT NOT NULL DEFAULT 'twitter',
            label TEXT,
            added_at TEXT DEFAULT (datetime('now'))
        );

CREATE TABLE sqlite_sequence(name,seq);

CREATE TABLE tc_coalition_signers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            affiliation TEXT,                          -- party / org (kept as given)
            status TEXT NOT NULL DEFAULT 'invited',    -- invited | reviewing | signed | declined
            pledge_version TEXT DEFAULT 'draft',
            went_public INTEGER DEFAULT 0,             -- has this signer agreed to be named publicly?
            report_back TEXT,                          -- their latest accountability update
            audience TEXT NOT NULL DEFAULT 'coalition',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE tc_decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,                       -- plain-language, read-aloud clean
            decision_type TEXT NOT NULL DEFAULT 'general',  -- general | make_public | position | spend | send
            summary TEXT,                              -- one-sentence meaning
            reason TEXT,                               -- why (recorded for the receipt)
            consequence TEXT,                          -- plain statement of what happens
            affects TEXT DEFAULT 'internal',           -- who this affects (internal | public | a group)
            reversible INTEGER DEFAULT 1,
            audience TEXT NOT NULL DEFAULT 'inner_circle',
            proposed_by TEXT DEFAULT 'operator',       -- agent or person that proposed it
            status TEXT NOT NULL DEFAULT 'pending',    -- pending | approved | declined | executed
            resolved_by TEXT,
            resolved_at TEXT,
            linked_object TEXT,                        -- e.g. "content_draft:12", "ledger:3"
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE tc_ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_type TEXT NOT NULL,                  -- money_in | money_out | commitment
            summary TEXT NOT NULL,                     -- plain-language line
            amount REAL DEFAULT 0,                     -- for money_in / money_out
            source_or_use TEXT,                        -- who gave / what it paid for
            commitment_status TEXT,                    -- for commitments: made | kept | not_kept | in_progress
            audience TEXT NOT NULL DEFAULT 'public',
            occurred_at TEXT NOT NULL DEFAULT (date('now')),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE tc_pledge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT NOT NULL DEFAULT 'draft',
            title TEXT NOT NULL,
            body TEXT,
            audience TEXT NOT NULL DEFAULT 'coalition',
            is_current INTEGER DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE tc_receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            decision_id INTEGER,
            summary TEXT NOT NULL,                     -- "You approved publishing the transit position."
            what_happened TEXT,
            reason TEXT,
            who_affected TEXT,
            reversible INTEGER DEFAULT 1,
            audience TEXT NOT NULL DEFAULT 'inner_circle',
            outcome TEXT NOT NULL DEFAULT 'approved',  -- approved | declined | executed
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (decision_id) REFERENCES tc_decisions(id)
        );

CREATE TABLE tc_voice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            you_said TEXT NOT NULL,                    -- what a citizen / group raised
            raised_by TEXT,                            -- attribution (may be "a resident", aggregate)
            neighborhood TEXT,
            stage TEXT NOT NULL DEFAULT 'heard',       -- heard | discussing | trying | decided | done
            we_did TEXT,                               -- what the campaign did with it (published loop)
            audience TEXT NOT NULL DEFAULT 'campaign', -- becomes 'public' when the loop is closed publicly
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

CREATE TABLE verified_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        claim TEXT NOT NULL,
        source TEXT NOT NULL,
        source_url TEXT,
        category TEXT,
        confidence TEXT NOT NULL DEFAULT 'high',
        verified_by TEXT,
        verified_at TEXT NOT NULL DEFAULT (datetime('now')),
        safe_to_publish INTEGER DEFAULT 1,
        notes TEXT
    );

CREATE TABLE volunteers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            skills TEXT DEFAULT '[]',
            availability TEXT,
            assigned_role TEXT,
            hours_logged REAL DEFAULT 0.0,
            signatures_collected INTEGER DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            joined_at TEXT NOT NULL DEFAULT (datetime('now')),
            last_active TEXT
        );


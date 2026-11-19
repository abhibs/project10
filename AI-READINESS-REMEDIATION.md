# AI readiness remediation

Implemented metadata and Open Graph fallbacks, initial-head metadata for scanners, shared Organization JSON-LD, privacy WebPage schema, homepage FAQ schema matching visible answers, linked article publisher attribution and Organization author schema, descriptive public image alternatives, and missing direct answers in the affected imported articles.

First-party `publishedAt` and `modifiedAt` article fields now feed visible dates, Article JSON-LD and Open Graph timestamps. Source-site publication dates are deliberately excluded. Existing articles have no verified first-party publication dates; these must be supplied by the editorial owner to resolve the freshness warnings. Non-article pages do not need invented article authors or publication dates. The report's FAQ warning describes a positive finding rather than a defect.

Validation: production build and ESLint passed; 93 existing tests plus two new metadata/date tests passed. Production HTTP checks passed for the homepage, privacy policy and the three lowest-scoring article routes: HTTP 200, title/description and four required Open Graph fields in the initial head, parsable JSON-LD, image alt attributes, and linked attribution on articles. Targeted content tests passed after direct-answer edits.

Deploy these changes and rerun the external scan to verify the live website. This checkout has not been deployed. Imported article answer edits are stored in the local datasets; a future content reimport needs to retain these editorial corrections. The attendance privacy policy retains its approved scope and existing update date.

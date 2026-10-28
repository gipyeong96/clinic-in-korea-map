# Privacy-safe acquisition and section reporting

Keeps property 559263056, stream 16141661677 and G-0TP3EDEP3R. No history, filters or stream settings are reset.

On deployment, initial configuration and the first manual page view use only an allowlisted discovery-service hostname as referrer. Paths, queries, fragments and arbitrary referrer domains are discarded. Later client navigations do not replay the external referrer. Unknown or withheld referrers remain unattributed; this cannot recover historical acquisition or guarantee source identification.

Page titles now distinguish fixed sections (Home, Clinic search, Condition information, Clinic profile, Nearby search, Area directory, Station directory, Care guides, Saved clinics, Other). Synthetic /measure/<group> URLs remain reporting labels rather than real landing pages. Conditions move from results to conditions. Compare across the deployment boundary with this classification change in mind. Prior generic titles stay in historical reports.

In GA4 use Reports > engagement > Pages and screens with Page title, or Page path for synthetic group URLs. Use Traffic acquisition with Session source/medium for acquisition; do not use First user source as a substitute. Check collection after deployment and allow normal reporting processing time. Phone/directions actions are not confirmed appointments.

Internal-browser exclusion, preview exclusion, restricted campaign values, disabled advertising signals and disabled automatic interaction/history measurement remain intact. No search terms, raw page URLs, clinic names/IDs, condition names or GPS fields are added. GA still receives ordinary technical service data; this is not a claim of full anonymity.

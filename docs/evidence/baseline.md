# Pinned baselines

| Role | Ref | Meaning |
|---|---|---|
| Fork product code | `d36f39336b05036f90ba20e273746374c25aaf3e` | Preview Studio product behavior described here. |
| Inherited upstream desktop | `f3de860574bb3119018b4592353e9761635aeb07` | Official `desktop-v0.5.8` ancestor. |
| Source documentation/showcase snapshot | `887d6da441684abda30a7284d004f6d4dd52a767` | Starting point for this editorial pass, not its final commit. |
| Integrated pre-evidence candidate | `5d0b11f864bb142ae5ec94de3c083eebbc99e1dc` | DCO-signed integration before the final evidence update. |
| Clean-verification candidate | `712fe36a088bf320d663a857bbd4d1b0eba159e4` | Exact DCO-signed commit verified from a clean detached worktree. Not pushed or tagged. |
| Full-CI integration candidate | `d57783c5` | DCO-signed integration of the alphabetical `media_tools` module-order fix and full-CI evidence; not pushed or tagged. |
| Final pre-publication CI candidate | `4e2e785d39126e064f67483f4f2ec95e92dd95f6` | Exact DCO-signed candidate that passed `just ci` after all code, workflow, visual, and upstream-audit work; not pushed or tagged. |
| Upstream release detector | Local candidate `4e2e785d` | Weekly/manual stable-tag detector and integration-PR preparation; contract passed locally, but workflow is not merged to the public default branch or proven live. |
| Official upstream main observed during final audit | `f8f2ef0440e7a074223ec04dc3b32d817b8b9d9b` | Context only; not claimed as merged product behavior. Latest stable desktop release remained `desktop-v0.5.8`. |
| Fork/upstream-main merge base during audit | `6a17d035f79ad582ca3f4f3cdc38d376f2c4087f` | Divergence reference, not a release baseline. |

At the final audit, public `origin/main` was 27 commits ahead and 30 behind official
upstream `main`; immediately before this audit-only documentation refresh, the local
candidate was 36 ahead and 30 behind. The merge base remained `6a17d035`. Moving branch
names are not durable evidence; always repeat the hashes.

The verification candidates are exact but not publicly reachable. Full CI passes at
`4e2e785d`; the only following change is this evidence-only documentation update. No
immutable public documentation/release tag has been verified. A future release must add its
pushed ref, public clean-clone proof, and tag rather than rewriting this historical record.

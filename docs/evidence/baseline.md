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
| Public product release | `50af5bf26416a602e9562af7e72712f39f8e4174` | Merge of reviewed PR #1 after its 25-check GitHub matrix passed. |
| Public automation release | `056a82a47f2dd9e35e1a4520ad184fab45897f21` | Merge of reviewed PR #2 after its 23-check GitHub matrix passed. |
| Upstream release detector | Public `main` at `056a82a4` | Weekly/manual stable-tag detector, reviewed integration preparation, and conflict reporting. Live run 31493736853 detected `desktop-v0.5.9` and safely opened issue #3 after conflicts. |
| Official upstream main observed during final audit | `f8f2ef0440e7a074223ec04dc3b32d817b8b9d9b` | Historical audit context only; not claimed as merged product behavior. |
| Fork/upstream-main merge base during audit | `6a17d035f79ad582ca3f4f3cdc38d376f2c4087f` | Divergence reference, not a release baseline. |

At the final audit, public `origin/main` was 27 commits ahead and 30 behind official
upstream `main`; immediately before this audit-only documentation refresh, the local
candidate was 36 ahead and 30 behind. The merge base remained `6a17d035`. Moving branch
names are not durable evidence; always repeat the hashes.

The local verification candidates remain historical evidence. Public release refs and the
fresh-clone proof are recorded above. No independently signed binary or immutable release
tag has been published.

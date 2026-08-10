# Pinned baselines

| Role | Ref | Meaning |
|---|---|---|
| Fork product code | `d36f39336b05036f90ba20e273746374c25aaf3e` | Preview Studio product behavior described here. |
| Inherited upstream desktop | `f3de860574bb3119018b4592353e9761635aeb07` | Official `desktop-v0.5.8` ancestor. |
| Source documentation/showcase snapshot | `887d6da441684abda30a7284d004f6d4dd52a767` | Starting point for this editorial pass, not its final commit. |
| Local release candidate | `5d0b11f864bb142ae5ec94de3c083eebbc99e1dc` | DCO-signed integration of the tested documentation, showcase, fixes, and release-candidate automation. Not pushed or tagged. |
| Upstream release detector | Local candidate `5d0b11f8` | Weekly/manual stable-tag detector and integration-PR preparation; not merged to the public default branch or proven live. |
| Official upstream main observed during audit | `07a3c768d619db31fee3f0590f9433cdd1213e8f` | Context only; not claimed as merged product behavior. |
| Fork/upstream-main merge base during audit | `6a17d035f79ad582ca3f4f3cdc38d376f2c4087f` | Divergence reference, not a release baseline. |

At audit time the fork/upstream-main divergence was 27/28 commits. Moving branch names are not durable evidence; always repeat the hashes.

The local candidate commit is exact but not publicly reachable. No immutable public
documentation/release tag has been verified. A future release must add its pushed ref, tag,
and clean-clone proof rather than rewriting this historical record.

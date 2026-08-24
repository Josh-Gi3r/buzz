import assert from "node:assert/strict";
import test from "node:test";

import { institutionPack, personaDisplayName } from "./institutionPacks.ts";
import { provisionInstitutionPack } from "./institutionProvisioning.ts";

function record(overrides = {}) {
  return {
    id: "id",
    displayName: "persona",
    avatarUrl: null,
    systemPrompt: "prompt",
    runtime: null,
    model: null,
    provider: null,
    namePool: [],
    isBuiltIn: false,
    isActive: true,
    shared: false,
    sourceTeam: null,
    catalogSource: null,
    envVars: {},
    respondTo: "owner-only",
    respondToAllowlist: [],
    parallelism: 1,
    createdAt: "2026-08-25T00:00:00Z",
    updatedAt: "2026-08-25T00:00:00Z",
    ...overrides,
  };
}

function team(overrides = {}) {
  return {
    id: "team-id",
    name: "Blueballs · Wallet",
    description: null,
    instructions: null,
    personaIds: [],
    isBuiltin: false,
    sourceDir: null,
    isSymlink: false,
    symlinkTarget: null,
    version: null,
    createdAt: "2026-08-25T00:00:00Z",
    updatedAt: "2026-08-25T00:00:00Z",
    ...overrides,
  };
}

test("provisions bounded personas without pinning runtime credentials", async () => {
  const createdInputs = [];
  const api = {
    listPersonas: async () => [],
    createPersona: async (input) => {
      createdInputs.push(input);
      return record({ id: `persona-${createdInputs.length}`, ...input });
    },
    deletePersona: async () => {},
    listTeams: async () => [],
    createTeam: async (input) => team({ ...input }),
    updateTeam: async () => assert.fail("unexpected update"),
  };

  const result = await provisionInstitutionPack("wallet", api);
  assert.equal(result.createdPersonaCount, 5);
  assert.equal(result.reusedPersonaCount, 0);
  assert.equal(result.team.personaIds.length, 5);
  for (const input of createdInputs) {
    assert.equal(input.runtime, undefined);
    assert.equal(input.model, undefined);
    assert.equal(input.provider, undefined);
    assert.equal(input.envVars, undefined);
    assert.deepEqual(input.behavior, {
      respondTo: "owner-only",
      parallelism: 1,
    });
  }
});

test("reuses matching personas and refreshes an existing team", async () => {
  const pack = institutionPack("wallet");
  const existing = record({
    id: "existing-persona",
    displayName: personaDisplayName(pack, pack.roles[0]),
  });
  let updateInput;
  const api = {
    listPersonas: async () => [existing],
    createPersona: async (input) =>
      record({ id: `new-${input.displayName}`, ...input }),
    deletePersona: async () => {},
    listTeams: async () => [team()],
    createTeam: async () => assert.fail("unexpected create"),
    updateTeam: async (input) => {
      updateInput = input;
      return team({ ...input });
    },
  };

  const result = await provisionInstitutionPack("wallet", api);
  assert.equal(result.reusedPersonaCount, 1);
  assert.equal(result.createdPersonaCount, 4);
  assert.equal(updateInput.personaIds[0], "existing-persona");
});

test("rolls back only personas created by a failed provisioning attempt", async () => {
  const deleted = [];
  const api = {
    listPersonas: async () => [],
    createPersona: async (input) =>
      record({ id: `new-${input.displayName}`, ...input }),
    deletePersona: async (id) => deleted.push(id),
    listTeams: async () => [],
    createTeam: async () => {
      throw new Error("team write failed");
    },
    updateTeam: async () => assert.fail("unexpected update"),
  };

  await assert.rejects(
    provisionInstitutionPack("wallet", api),
    /team write failed/u,
  );
  assert.equal(deleted.length, 5);
  assert.ok(deleted.every((id) => id.startsWith("new-")));
});

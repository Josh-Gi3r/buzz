import assert from "node:assert/strict";
import test from "node:test";

import {
  INSTITUTION_PACKS,
  institutionPack,
  personaDisplayName,
  teamInstructions,
} from "./institutionPacks.ts";

test("institution packs have unique identities and complete specialist teams", () => {
  assert.equal(
    new Set(INSTITUTION_PACKS.map((pack) => pack.id)).size,
    INSTITUTION_PACKS.length,
  );
  for (const pack of INSTITUTION_PACKS) {
    assert.ok(
      pack.roles.length >= 5,
      `${pack.id} should have at least five specialists`,
    );
    assert.equal(
      new Set(pack.roles.map((role) => role.id)).size,
      pack.roles.length,
    );
    assert.equal(
      new Set(pack.roles.map((role) => personaDisplayName(pack, role))).size,
      pack.roles.length,
    );
  }
});

test("remittance pack covers product, ledger, FX, policy, issuance, UI, and release", () => {
  assert.deepEqual(
    institutionPack("remittance-corridor").roles.map((role) => role.id),
    [
      "product-architect",
      "ledger-banking",
      "fx-treasury",
      "policy-compliance",
      "monetary-engine",
      "product-frontend",
      "qa-release",
    ],
  );
});

test("every pack keeps live financial actions behind human approval", () => {
  for (const pack of INSTITUTION_PACKS) {
    const instructions = teamInstructions(pack);
    assert.match(instructions, /explicit human approval/u);
    assert.match(instructions, /real reserve movement/u);
    for (const role of pack.roles)
      assert.match(role.remit, /Never claim Blueballs is a bank/u);
  }
});

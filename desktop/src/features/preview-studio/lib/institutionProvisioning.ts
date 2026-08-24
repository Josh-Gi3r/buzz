import {
  createPersona,
  deletePersona,
  listPersonas,
} from "@/shared/api/tauriPersonas";
import { createTeam, listTeams, updateTeam } from "@/shared/api/tauriTeams";
import type { AgentTeam } from "@/shared/api/types";

import {
  institutionPack,
  personaDisplayName,
  teamDisplayName,
  teamInstructions,
} from "./institutionPacks";

export type InstitutionProvisionResult = {
  team: AgentTeam;
  createdPersonaCount: number;
  reusedPersonaCount: number;
  runtimePolicy: "builder-defaults";
};

export type InstitutionProvisioningApi = {
  createPersona: typeof createPersona;
  deletePersona: typeof deletePersona;
  listPersonas: typeof listPersonas;
  createTeam: typeof createTeam;
  listTeams: typeof listTeams;
  updateTeam: typeof updateTeam;
};

const DEFAULT_API: InstitutionProvisioningApi = {
  createPersona,
  deletePersona,
  listPersonas,
  createTeam,
  listTeams,
  updateTeam,
};

export async function provisionInstitutionPack(
  packId: string,
  api: InstitutionProvisioningApi = DEFAULT_API,
): Promise<InstitutionProvisionResult> {
  const pack = institutionPack(packId);
  const existingPersonas = await api.listPersonas();
  const personaIds: string[] = [];
  const createdPersonaIds: string[] = [];
  let reusedPersonaCount = 0;

  try {
    for (const role of pack.roles) {
      const displayName = personaDisplayName(pack, role);
      const existing = existingPersonas.find(
        (persona) => persona.displayName === displayName,
      );
      if (existing) {
        personaIds.push(existing.id);
        reusedPersonaCount += 1;
        continue;
      }
      const created = await api.createPersona({
        displayName,
        systemPrompt: role.remit,
        behavior: { respondTo: "owner-only", parallelism: 1 },
      });
      personaIds.push(created.id);
      createdPersonaIds.push(created.id);
    }

    const name = teamDisplayName(pack);
    const description = `Blueballs Institution Studio domain pack v1 · ${pack.summary}`;
    const instructions = teamInstructions(pack);
    const existingTeam = (await api.listTeams()).find(
      (team) => team.name === name,
    );
    const team = existingTeam
      ? await api.updateTeam({
          id: existingTeam.id,
          name,
          description,
          instructions,
          personaIds,
        })
      : await api.createTeam({ name, description, instructions, personaIds });
    return {
      team,
      createdPersonaCount: createdPersonaIds.length,
      reusedPersonaCount,
      runtimePolicy: "builder-defaults",
    };
  } catch (error) {
    await Promise.allSettled(
      createdPersonaIds.map((personaId) => api.deletePersona(personaId)),
    );
    throw error;
  }
}

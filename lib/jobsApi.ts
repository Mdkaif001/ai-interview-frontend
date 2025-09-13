import { DomainsProps, RolesProps } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function getDomains(): Promise<DomainsProps> {
  const response = await fetch(`${BASE_URL}/api/domains`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to start interview. Please try again.");
  }

  const data = await response.json();
  return data;
}

export async function getRolesByDomainId(
  domainId: string
): Promise<RolesProps> {
  const response = await fetch(`${BASE_URL}/api/roles/${domainId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to start interview. Please try again.");
  }

  const data = await response.json();
  return data;
}

"use client"

const DOMAIN_STORAGE_KEY = "campaignpilot:selected-domain"
const DEFAULT_DOMAIN = "Furniture"

export function getDefaultDomain(): string {
  return DEFAULT_DOMAIN
}

export function loadSelectedDomain(): string {
  if (typeof window === "undefined") {
    return DEFAULT_DOMAIN
  }

  return window.localStorage.getItem(DOMAIN_STORAGE_KEY)?.trim() || DEFAULT_DOMAIN
}

export function saveSelectedDomain(domain: string): void {
  if (typeof window === "undefined") {
    return
  }

  const normalized = domain.trim()
  if (!normalized) {
    return
  }

  window.localStorage.setItem(DOMAIN_STORAGE_KEY, normalized)
}

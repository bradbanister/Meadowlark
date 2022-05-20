// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

/**
 * Information extracted from a JWT token
 */
export interface JwtStatus {
  isOwnershipEnabled: boolean;
  isMissing: boolean;
  isValid: boolean;
  isExpired: boolean;
  issuer: string;
  audience: string;
  subject: string | null;
  issuedAt: number;
  expiresAt: number;
}

export function newJwtStatus() {
  return {
    isOwnershipEnabled: false,
    isMissing: false,
    isValid: false,
    isExpired: false,
    issuer: '',
    audience: '',
    subject: null,
    issuedAt: 0,
    expiresAt: 0,
  };
}
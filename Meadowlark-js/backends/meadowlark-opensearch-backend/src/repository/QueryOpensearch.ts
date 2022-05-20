// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import { Client } from '@elastic/elasticsearch';
import { QueryRequest, QueryResult, Logger, DocumentInfo } from '@edfi/meadowlark-core';
import { normalizeDescriptorSuffix } from '@edfi/metaed-core';

/**
 * Returns Elasticsearch index name from the given DocumentInfo.
 *
 * Elasticsearch indexes are required to be lowercase only, with no pound signs or periods.
 */
export function indexFromDocumentInfo(documentInfo: DocumentInfo): string {
  const adjustedResourceName = documentInfo.isDescriptor
    ? normalizeDescriptorSuffix(documentInfo.resourceName)
    : documentInfo.resourceName;

  return `${documentInfo.projectName}$${documentInfo.resourceVersion}$${adjustedResourceName}`
    .toLowerCase()
    .replace(/\./g, '-');
}

// TODO: RND-203 unsafe for SQL injection
/**
 * Convert query string parameters from http request to Elasticsearch
 * SQL WHERE conditions.
 */
function whereConditionsFrom(queryStringParameters: object): string {
  return Object.entries(queryStringParameters)
    .map(([field, value]) => `${field} = '${value}'`)
    .join(' AND ');
}

/**
 * This mechanism of SQL querying is specific to OpenSearch (vs Elasticsearch)
 */
async function performSqlQuery(client: Client, query: string): Promise<any> {
  return client.transport.request({
    method: 'POST',
    path: '/_opendistro/_sql',
    body: { query },
  });
}

/**
 * Entry point for querying with Elasticsearch
 */
export async function queryDocuments(request: QueryRequest, client: Client): Promise<QueryResult> {
  const { documentInfo, queryStringParameters, paginationParameters, traceId } = request;

  Logger.debug(`Building query`, traceId);

  let documents: any = [];
  try {
    let query = `SELECT info FROM ${indexFromDocumentInfo(documentInfo)}`;
    if (Object.entries(queryStringParameters).length > 0) {
      query += ` WHERE ${whereConditionsFrom(queryStringParameters)} ORDER BY _doc`;
    }
    if (paginationParameters.limit != null) query += ` LIMIT ${paginationParameters.limit}`;
    if (paginationParameters.offset != null) query += ` OFFSET ${paginationParameters.offset}`;

    Logger.debug(`meadowlark-opensearch: queryDocuments executing query: ${query}`, traceId);

    const { body } = await performSqlQuery(client, query);

    Logger.debug(`Result: ${JSON.stringify(body)}`, traceId);
    documents = body.datarows.map((datarow) => JSON.parse(datarow));
  } catch (e) {
    const body = JSON.parse(e.meta.body);

    switch (body?.error?.type) {
      case 'IndexNotFoundException':
        // No object has been uploaded for the requested type
        return { response: 'QUERY_FAILURE_INVALID_QUERY', documents: [] };
      case 'SemanticAnalysisException':
        // The query term is invalid
        Logger.debug('meadowlark-opensearch: queryDocuments', traceId, e.meta.body);
        return { response: 'QUERY_FAILURE_INVALID_QUERY', documents: [{ error: body.error.details }] };
      default:
        Logger.error('meadowlark-opensearch: queryDocuments', traceId, body ?? e);
        return { response: 'UNKNOWN_FAILURE', documents: [] };
    }
  }

  return { response: 'QUERY_SUCCESS', documents };
}
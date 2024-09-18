import { LogName } from "./log-name.enum";

export const logFilterSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pagination: {
      type: 'object',
      description: 'Paginarea rezultatelor',
      additionalProperties: false,
      properties: {
        limit: {
          type: 'number',
          description: 'Numărul de elemente pe pagină',
          minimum: 1,
          maximum: 100,
        }
      },
      required: ['limit'],
    },
    filters: {
      type: 'object',
      description: 'Filtre pentru loguri',
      additionalProperties: false,
      properties: {
        severity: {
          type: 'object',
          description: 'Severitatea logului',
          additionalProperties: false,
          properties: {
            matching: { $ref: '#/$defs/arrayOfLogSeverities', },
            notMatching: { $ref: '#/$defs/arrayOfLogSeverities' },
          },
        },
        name: {
          type: 'object',
          description: 'Numele logului',
          additionalProperties: false,
          properties: {
            matching: { $ref: '#/$defs/arrayOfLogNames', },
            notMatching: { $ref: '#/$defs/arrayOfLogNames' },
          },
        },
        byUserId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul utilizatorului care a efectuat acțiunea',
        },
        impersonatedByUserId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul utilizatorului care a efectuat acțiunea impersonând un alt utilizator',
        },
        userId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul utilizatorului afectat de acțiune',
        },
        studentExtraDataId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul datelor suplimentare ale studentului',
        },
        paperId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul lucrării',
        },
        documentId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul documentului',
        },
        documentReuploadRequestId: {
          $ref: '#/$defs/matchOrNotMatchNumbersOrNull',
          description: 'ID-ul cererii de reîncărcare a documentului',
        },
      },
    }
  },
  required: ['pagination'],
  $defs: {
    logNameEnum: {
      type: 'string',
      enum: Object.values(LogName),
    },
    logSeverityEnum: {
      type: 'string',
      enum: ['info', 'warning', 'error', 'critical'],
    },
    arrayOfLogNames: {
      type: 'array',
      items: { $ref: '#/$defs/logNameEnum' },
    },
    arrayOfLogSeverities: {
      type: 'array',
      items: { $ref: '#/$defs/logSeverityEnum' },
    },
    arrayOfNumbersOrNull: {
      type: 'array',
      items: {
        type: ['number', 'null'],
      },
    },
    arrayOfNumbers: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    matchOrNotMatchNumbersOrNull: {
      type: 'object',
      additionalProperties: false,
      properties: {
        matching: { $ref: '#/$defs/arrayOfNumbersOrNull' },
        notMatching: { $ref: '#/$defs/arrayOfNumbersOrNull' },
      },
    },
    matchOrNotMatchNumbers: {
      type: 'object',
      additionalProperties: false,
      properties: {
        matching: { $ref: '#/$defs/arrayOfNumbers' },
        notMatching: { $ref: '#/$defs/arrayOfNumbers' },
      },
    },
  }
};

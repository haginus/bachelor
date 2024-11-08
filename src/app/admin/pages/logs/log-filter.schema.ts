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
        meta: {
          $ref: '#/$defs/meta',
          description: 'Alte date incluse în log',
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
    meta: {
      $ref: '#/$defs/metaOperators'
    },
    metaOperators: {
      type: 'object',
      additionalProperties: false,
      properties: {
        '$and': {
          description: "Operatorul 'și'",
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^.*$': { $ref: '#/$defs/metaNestOrLeaf' },
          },
        },
        '$or': {
          description: "Operatorul 'sau'",
          type: 'array',
          items: { $ref: '#/$defs/metaNestOrLeaf' },
        },
        '$ne': {
          description: "Operatorul '!='",
          type: ['string', 'number']
        },
        '$lt': {
          description: "Operatorul '<'",
          type: 'number'
        },
        '$lte': {
          description: "Operatorul '<='",
          type: 'number'
        },
        '$gt': {
          description: "Operatorul '>'",
          type: 'number'
        },
        '$gte': {
          description: "Operatorul '>='",
          type: 'number'
        },
        '$in': {
          description: "Operatorul 'în'",
          type: 'array'
        },
        '$notIn': {
          description: "Operatorul 'nu în'",
          type: 'array'
        },
        '$substring': {
          description: "Operatorul 'LIKE %abc%'",
          type: 'string'
        },
        '$startsWith': {
          description: "Operatorul 'LIKE abc%'",
          type: 'string'
        },
        '$endsWith': {
          description: "Operatorul 'LIKE %abc'",
          type: 'string'
        }
      },
      patternProperties: {
        '^.*$': { $ref: '#/$defs/metaNestOrLeaf' },
      },
    },
    metaNestOrLeaf: {
      "anyOf": [
        { $ref: '#/$defs/metaOperators' },
        { type: 'string' },
        { type: 'number' },
        { type: 'array' },
      ]
    }
  }
};

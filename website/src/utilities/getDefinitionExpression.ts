import { FIELDS } from '../../functions/common/shared';

export function getDefinitionExpression(id: string): string {
  // break the AGOL cache by always sending a unique expression
  const now = Date.now();
  const expression = `${FIELDS.SALESFORCE_ID} = '${id}' AND ${now} = ${now}`;

  return expression;
}

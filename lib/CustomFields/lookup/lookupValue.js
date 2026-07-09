/**
 * The persisted shape of a lookup value is not settled yet: today it is a bare UUID
 * string, and it may become `{ id, label }` so that the field can be searched and
 * exported without resolving the reference first. Every read and write goes through
 * these two functions so that switching stays a change to this file alone.
 */

export const serializeLookupValue = (record) => {
  if (!record?.id) return '';

  return record.id;
};

export const deserializeLookupValue = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    return {
      id: value,
      label: null,
    };
  }

  return {
    id: value.id,
    label: value.label ?? null,
  };
};

export const isLookupValueEmpty = value => !deserializeLookupValue(value);

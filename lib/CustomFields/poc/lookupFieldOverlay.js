/**
 * TEMPORARY - proof of concept only. Delete this file once the backend accepts the
 * type.
 *
 * `customFieldTypes.json` in folio-custom-fields is a closed enum, so a field of type
 * LOOKUP cannot be persisted yet. Worse, the record-side validator rejects any refId
 * it does not know, so the definition cannot simply be invented client-side either.
 *
 * The workaround: create the field as a textbox (a UUID fits its value validation),
 * then promote it to LOOKUP here after loading. The field value round-trips through
 * the real backend; only the type is faked.
 *
 * The demo fields are hardcoded below so that deploying this branch needs nothing but
 * a dependency reference. Override per environment in stripes.config.js if needed:
 *   config: {
 *     lookupPocFields: {
 *       testTest: { source: 'organization' },
 *     },
 *   }
 */

const LOOKUP_TYPE = 'LOOKUP';

const DEMO_FIELDS = {
  testTest: { source: 'organization' },
};

export const applyLookupOverlay = (customFields, overlay = DEMO_FIELDS) => {
  if (!customFields?.length || !overlay) return customFields;

  return customFields.map(customField => (
    overlay[customField.refId]
      ? {
        ...customField,
        type: LOOKUP_TYPE,
        lookupField: overlay[customField.refId],
      }
      : customField
  ));
};

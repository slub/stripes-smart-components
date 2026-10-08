import {
  CUSTOM_FIELDS_SECTION_ID,
  CUSTOM_FIELD_SECTION_OPTION_PREFIX,
} from '../constants';

/**
 * The "Display in accordion" select offers the host accordions (stored in `displayInAccordion`)
 * and the custom field sections (stored in `sectionId`) in one list. Section options carry a
 * prefixed value, so one select value maps back to the two fields.
 */
export const toSectionOptionValue = (sectionId) => `${CUSTOM_FIELD_SECTION_OPTION_PREFIX}${sectionId}`;

export const isSectionOptionValue = (value) => value.startsWith(CUSTOM_FIELD_SECTION_OPTION_PREFIX);

export const getAccordionOptionValue = ({ displayInAccordion, sectionId }, dataOptions) => {
  const sectionOptionValue = sectionId && toSectionOptionValue(sectionId);

  if (sectionOptionValue && dataOptions.some(option => option.value === sectionOptionValue)) {
    return sectionOptionValue;
  }

  return displayInAccordion || CUSTOM_FIELDS_SECTION_ID;
};

export const parseAccordionOptionValue = (value) => {
  if (isSectionOptionValue(value)) {
    return {
      displayInAccordion: CUSTOM_FIELDS_SECTION_ID,
      sectionId: value.slice(CUSTOM_FIELD_SECTION_OPTION_PREFIX.length),
    };
  }

  return {
    displayInAccordion: value,
    sectionId: '',
  };
};

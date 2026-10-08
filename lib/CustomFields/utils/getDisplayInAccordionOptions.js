import { CUSTOM_FIELDS_SECTION_ID } from '../constants';
import { toSectionOptionValue } from './accordionOptionValue';

const byLabel = (a, b) => a.label.localeCompare(b.label);

// Without sections the default accordion is sorted in with the host accordions, as ui-users shows it.
// With sections: the default accordion first, then the sections in their saved order, then the host accordions A-Z.
const getDisplayInAccordionOptions = (sectionTitleValue, displayInAccordionOptions, sections = []) => {
  const defaultOption = {
    value: CUSTOM_FIELDS_SECTION_ID,
    label: sectionTitleValue,
  };

  if (!sections.length) {
    return [defaultOption, ...displayInAccordionOptions].sort(byLabel);
  }

  return [
    defaultOption,
    ...sections.map(section => ({
      value: toSectionOptionValue(section.id),
      label: section.name,
    })),
    ...[...displayInAccordionOptions].sort(byLabel),
  ];
};

export default getDisplayInAccordionOptions;

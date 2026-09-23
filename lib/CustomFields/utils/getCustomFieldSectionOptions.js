// Options for the "Section" select of a custom field: the default accordion first
// (no section, empty value), then the sections in the order they were loaded (A-Z).
const getCustomFieldSectionOptions = (defaultLabel, sections = []) => {
  return [
    {
      value: '',
      label: defaultLabel,
    },
    ...sections.map(section => ({
      value: section.id,
      label: section.name,
    })),
  ];
};

export default getCustomFieldSectionOptions;

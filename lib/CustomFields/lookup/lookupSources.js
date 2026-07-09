export const LOOKUP_SOURCES = {
  ORGANIZATION: 'organization',
  USER: 'user',
};

const getUserLabel = (user) => {
  const { firstName, lastName } = user?.personal || {};
  const fullName = [lastName, firstName].filter(Boolean).join(', ');

  return fullName || user?.username || user?.id;
};

// API paths are duplicated rather than imported from stripes-acq-components:
// that package already depends on this one, so importing it back would be a cycle.
const ORGANIZATIONS_API = 'organizations/organizations';
const USERS_API = 'users';

/**
 * Finder plugins do not share an interface. Each one names its selection callback
 * differently and some hand back an array even when a single record was picked.
 * An adapter per source keeps those differences out of the field components, and
 * adding a source means adding an entry here, not touching the backend schema.
 */
export const lookupSourceAdapters = {
  [LOOKUP_SOURCES.ORGANIZATION]: {
    pluginType: 'find-organization',
    selectProp: 'selectVendor',
    labelId: 'stripes-smart-components.customFields.lookup.source.organization',
    searchLabelId: 'stripes-smart-components.customFields.lookup.search.organization',
    resolvePath: id => `${ORGANIZATIONS_API}/${id}`,
    toLabel: record => record?.name,
    viewPath: id => `/organizations/view/${id}`,
  },
  [LOOKUP_SOURCES.USER]: {
    pluginType: 'find-user',
    selectProp: 'selectUser',
    labelId: 'stripes-smart-components.customFields.lookup.source.user',
    searchLabelId: 'stripes-smart-components.customFields.lookup.search.user',
    resolvePath: id => `${USERS_API}/${id}`,
    toLabel: getUserLabel,
    viewPath: id => `/users/view/${id}`,
  },
};

export const getLookupSourceAdapter = source => lookupSourceAdapters[source] || null;

// Some plugins pass the picked record through as an array even for single select.
export const unwrapSelectedRecord = selection => (Array.isArray(selection) ? selection[0] : selection);

export const getLookupSourceOptions = formatMessage => Object.entries(lookupSourceAdapters)
  .map(([source, adapter]) => ({
    value: source,
    label: formatMessage({ id: adapter.labelId }),
  }));

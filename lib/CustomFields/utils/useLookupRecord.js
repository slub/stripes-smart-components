import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes-core';

import { getLookupAdapter } from '../lookup';

const RESOLVED_LABEL_STALE_TIME = 5 * 60 * 1000;

/**
 * Resolves the UUID stored in a lookup custom field into a display label.
 *
 * The referenced record may be gone, or the user may lack permission to read it.
 * Both are expected states rather than failures, so they are surfaced separately
 * instead of being thrown.
 */
const useLookupRecord = ({ refEntityType, id }) => {
  const adapter = getLookupAdapter(refEntityType);
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'customFieldsLookup' });

  const {
    data,
    isLoading,
    error,
  } = useQuery(
    [namespace, refEntityType, id],
    ({ signal }) => ky.get(adapter.resolvePath(id), { signal }).json(),
    {
      enabled: Boolean(adapter && id),
      staleTime: RESOLVED_LABEL_STALE_TIME,
      retry: false,
    },
  );

  const status = error?.response?.status;

  return {
    label: data ? adapter.toLabel(data) : null,
    isLoadingRecord: Boolean(id) && isLoading,
    isForbidden: status === 403,
    isNotFound: status === 404,
    viewPath: (adapter && id) ? adapter.viewPath(id) : null,
  };
};

export default useLookupRecord;

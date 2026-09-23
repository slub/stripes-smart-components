import { useMemo } from 'react';
import { useQuery } from 'react-query';

import {
  useStripes,
  useNamespace,
  useOkapiKy,
} from '@folio/stripes-core';

import { selectModuleId } from '../selectors';
import { CUSTOM_FIELD_SECTIONS_API } from '../constants';

// max signed int value, specified in mod-customfields API documentation (STSMACOM-370)
const MAX_RECORDS = 2147483647;

const EMPTY_SECTIONS = [];

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

/**
 * Loads the custom field sections of a module and entity type, sorted by name.
 *
 * @param {Object} params
 * @param {string} params.moduleName - name of the FOLIO module (e.g. 'users', 'Orders CRUD module'),
 * used to set the `x-okapi-module-id` header
 * @param {string} params.entityType - entity type to load the sections for (e.g. 'purchase_order')
 * @param {boolean} [params.enabled=true] - whether the query runs
 *
 * @returns {Object} sections (empty array until loaded), isLoadingSections, isFetchingSections,
 * isSectionsError, refetchSections
 */
const useCustomFieldSectionsQuery = ({
  moduleName,
  entityType,
  enabled = true,
}) => {
  const [namespace] = useNamespace({ key: 'customFieldSections' });
  const { store: { getState } } = useStripes();
  const state = getState();
  const ky = useOkapiKy();

  const moduleId = useMemo(() => selectModuleId(state, moduleName), [state, moduleName]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery(
    [namespace, moduleId, entityType],
    async ({ signal }) => {
      const response = await ky.get(CUSTOM_FIELD_SECTIONS_API, {
        searchParams: {
          query: `entityType=="${entityType}"`,
          limit: MAX_RECORDS,
        },
        signal,
        headers: {
          'x-okapi-module-id': moduleId,
        },
      }).json();

      return response?.customFieldSections;
    },
    {
      enabled: enabled && moduleId !== undefined && Boolean(entityType),
    },
  );

  const sections = useMemo(() => (data ? [...data].sort(byName) : EMPTY_SECTIONS), [data]);

  return {
    sections,
    isLoadingSections: isLoading,
    isFetchingSections: isFetching,
    isSectionsError: isError,
    refetchSections: refetch,
  };
};

export default useCustomFieldSectionsQuery;

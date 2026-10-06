import { useMemo } from 'react';
import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useStripes,
  useNamespace,
  useOkapiKy,
} from '@folio/stripes-core';

import { selectModuleId } from '../selectors';
import { CUSTOM_FIELD_SECTIONS_API } from '../constants';

/**
 * Replaces all custom field sections of one entity type of a module.
 * The backend sets the order of each section to its position in the list, creates the sections
 * without an id and deletes the ones that are missing (422 `sectionInUse` if one of them is
 * still assigned to custom fields). A successful mutation invalidates the sections query of the module.
 *
 * @param {Object} params
 * @param {string} params.moduleName - name of the FOLIO module, used to set the `x-okapi-module-id` header
 *
 * @returns {Object} replaceSections({ sections, entityType }), isReplacingSections
 */
const useCustomFieldSectionMutation = ({ moduleName }) => {
  const [namespace] = useNamespace({ key: 'customFieldSections' });
  const { store: { getState } } = useStripes();
  const state = getState();
  const ky = useOkapiKy();
  const queryClient = useQueryClient();

  const moduleId = useMemo(() => selectModuleId(state, moduleName), [state, moduleName]);

  const {
    mutateAsync: replaceSections,
    isLoading: isReplacingSections,
  } = useMutation({
    mutationFn: ({ sections, entityType }) => ky.put(CUSTOM_FIELD_SECTIONS_API, {
      json: { customFieldSections: sections, entityType },
      headers: { 'x-okapi-module-id': moduleId },
    }),
    onSuccess: () => queryClient.invalidateQueries([namespace, moduleId]),
  });

  return {
    replaceSections,
    isReplacingSections,
  };
};

export default useCustomFieldSectionMutation;

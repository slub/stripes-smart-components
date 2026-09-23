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
 * Creates, updates and deletes custom field sections of a module.
 * Every successful mutation invalidates the sections query of the module.
 *
 * @param {Object} params
 * @param {string} params.moduleName - name of the FOLIO module, used to set the `x-okapi-module-id` header
 *
 * @returns {Object} createSection({ name, entityType }), updateSection({ id, name, entityType }),
 * deleteSection(id), isMutatingSection
 */
const useCustomFieldSectionMutation = ({ moduleName }) => {
  const [namespace] = useNamespace({ key: 'customFieldSections' });
  const { store: { getState } } = useStripes();
  const state = getState();
  const ky = useOkapiKy();
  const queryClient = useQueryClient();

  const moduleId = useMemo(() => selectModuleId(state, moduleName), [state, moduleName]);

  const headers = { 'x-okapi-module-id': moduleId };
  const invalidateSections = () => queryClient.invalidateQueries([namespace, moduleId]);

  const {
    mutateAsync: createSection,
    isLoading: isCreating,
  } = useMutation({
    mutationFn: (section) => ky.post(CUSTOM_FIELD_SECTIONS_API, { json: section, headers }).json(),
    onSuccess: invalidateSections,
  });

  const {
    mutateAsync: updateSection,
    isLoading: isUpdating,
  } = useMutation({
    mutationFn: (section) => ky.put(`${CUSTOM_FIELD_SECTIONS_API}/${section.id}`, { json: section, headers }),
    onSuccess: invalidateSections,
  });

  const {
    mutateAsync: deleteSection,
    isLoading: isDeleting,
  } = useMutation({
    mutationFn: (id) => ky.delete(`${CUSTOM_FIELD_SECTIONS_API}/${id}`, { headers }),
    onSuccess: invalidateSections,
  });

  return {
    createSection,
    updateSection,
    deleteSection,
    isMutatingSection: isCreating || isUpdating || isDeleting,
  };
};

export default useCustomFieldSectionMutation;

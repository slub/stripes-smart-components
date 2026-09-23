import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import noop from 'lodash/noop';

import {
  Icon,
  Pane,
} from '@folio/stripes-components';

import EditableList from '../../../EditableList';
import { errorCodes } from '../../../EditableList/constants';
import {
  useCustomFieldsQuery,
  useCustomFieldSectionsQuery,
  useCustomFieldSectionMutation,
} from '../../utils';
import { CUSTOM_FIELD_SECTION_ID_PROPERTY } from '../../constants';
import { permissionsShape } from '../../shapes';

// same limit as for custom field names (custom.fields.definition.name.length in the backend)
const NAME_LENGTH_LIMIT = 65;
const FIELDS_COUNT = 'fieldsCount';

const propTypes = {
  backendModuleName: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  id: PropTypes.string,
  paneTitle: PropTypes.node,
  permissions: permissionsShape.isRequired,
};

const isSameName = (a, b) => a.trim().localeCompare(b.trim(), undefined, { sensitivity: 'base' }) === 0;

/**
 * Settings page to create, rename and delete the custom field sections of one entity type.
 * A section that is assigned to custom fields can't be deleted (the delete action is disabled,
 * the backend rejects it with 422 `sectionInUse` as well).
 */
const CustomFieldSectionsSettings = ({
  backendModuleName,
  entityType,
  id = 'custom-field-sections',
  paneTitle = <FormattedMessage id="stripes-smart-components.customFields.sections" />,
  permissions,
}) => {
  const intl = useIntl();

  const {
    sections,
    isLoadingSections,
  } = useCustomFieldSectionsQuery({
    moduleName: backendModuleName,
    entityType,
  });

  const {
    customFields,
    isLoadingCustomFields,
  } = useCustomFieldsQuery({
    moduleName: backendModuleName,
    entityType,
  });

  const {
    createSection,
    updateSection,
    deleteSection,
  } = useCustomFieldSectionMutation({ moduleName: backendModuleName });

  const contentData = useMemo(() => sections.map(section => ({
    ...section,
    [FIELDS_COUNT]: (customFields || [])
      .filter(customField => customField[CUSTOM_FIELD_SECTION_ID_PROPERTY] === section.id)
      .length,
  })), [sections, customFields]);

  const nameLabel = intl.formatMessage({ id: 'stripes-smart-components.customFields.sections.name' });

  // EditableList expects a rejected fetch Response and reads `errors` from a 422 JSON body.
  // The backend answers a duplicate name with 422 text/plain, so map it to the list's own duplicate error.
  const throwListError = useCallback((error) => {
    if (error?.response?.status === 422) {
      const body = {
        errors: [{
          code: errorCodes.nameDuplicate,
          parameters: [{ key: 'fieldLabel', value: nameLabel }],
        }],
      };

      throw new Response(JSON.stringify(body), {
        status: 422,
        headers: { 'content-type': 'application/json' },
      });
    }

    throw error?.response || error;
  }, [nameLabel]);

  const throwResponse = (error) => {
    throw error?.response || error;
  };

  const onCreate = useCallback(({ name }) => {
    return createSection({ name: name.trim(), entityType }).catch(throwListError);
  }, [createSection, entityType, throwListError]);

  const onUpdate = useCallback(({ id: sectionId, name }) => {
    return updateSection({ id: sectionId, name: name.trim(), entityType }).catch(throwListError);
  }, [updateSection, entityType, throwListError]);

  const onDelete = useCallback((sectionId) => {
    return deleteSection(sectionId).catch(throwResponse);
  }, [deleteSection]);

  const validate = useCallback(({ items }) => {
    const errors = [];

    (items || []).forEach((item, index) => {
      const name = item.name || '';

      if (!name.trim()) {
        errors[index] = { name: <FormattedMessage id="stripes-core.label.missingRequiredField" /> };
      } else if (name.length > NAME_LENGTH_LIMIT) {
        errors[index] = { name: <FormattedMessage id="stripes-smart-components.customFields.fieldName.lengthLimit" /> };
      } else if (items.some((other, otherIndex) => otherIndex !== index && isSameName(other.name || '', name))) {
        errors[index] = {
          name: (
            <FormattedMessage
              id="stripes-smart-components.error.name.duplicate"
              values={{ fieldLabel: nameLabel }}
            />
          ),
        };
      }
    });

    return errors.length ? { items: errors } : {};
  }, [nameLabel]);

  const getSectionName = useCallback((sectionId) => {
    return sections.find(section => section.id === sectionId)?.name || '';
  }, [sections]);

  if (isLoadingSections || isLoadingCustomFields) {
    return <Icon icon="spinner-ellipsis" />;
  }

  return (
    <Pane
      id={`${id}-pane`}
      paneTitle={paneTitle}
      defaultWidth="fill"
    >
      <EditableList
        id={id}
        formType="final-form"
        // rows are saved one by one through onCreate/onUpdate, the form itself is never submitted
        onSubmit={noop}
        contentData={contentData}
        visibleFields={['name', FIELDS_COUNT]}
        readOnlyFields={[FIELDS_COUNT]}
        columnMapping={{
          name: nameLabel,
          [FIELDS_COUNT]: <FormattedMessage id="stripes-smart-components.customFields.sections.fieldsCount" />,
        }}
        columnWidths={{
          name: '50%',
          [FIELDS_COUNT]: '25%',
          actions: '25%',
        }}
        itemTemplate={{ name: '' }}
        createButtonLabel={<FormattedMessage id="stripes-core.button.new" />}
        isEmptyMessage={<FormattedMessage id="stripes-smart-components.customFields.sections.empty" />}
        editable={permissions.canEdit}
        actionSuppression={{
          delete: () => !permissions.canDelete,
          edit: () => false,
        }}
        actionProps={{
          delete: (item) => ({ disabled: item[FIELDS_COUNT] > 0 }),
        }}
        validate={validate}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        withDeleteConfirmation
        confirmationHeading={<FormattedMessage id="stripes-smart-components.customFields.sections.delete.heading" />}
        confirmationMessage={(sectionId) => (
          <FormattedMessage
            id="stripes-smart-components.customFields.sections.delete.message"
            values={{ name: getSectionName(sectionId) }}
          />
        )}
      />
    </Pane>
  );
};

CustomFieldSectionsSettings.propTypes = propTypes;

export default CustomFieldSectionsSettings;

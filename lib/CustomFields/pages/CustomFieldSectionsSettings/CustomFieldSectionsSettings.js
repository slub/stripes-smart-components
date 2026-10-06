import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FORM_ERROR } from 'final-form';

import {
  Button,
  Icon,
  MultiColumnList,
  Pane,
} from '@folio/stripes-components';
import { useCallout } from '@folio/stripes-core';

import {
  useCustomFieldsQuery,
  useCustomFieldSectionsQuery,
  useCustomFieldSectionMutation,
} from '../../utils';
import {
  CUSTOM_FIELD_SECTION_ID_PROPERTY,
  SECTION_IN_USE_ERROR_CODE,
} from '../../constants';
import { permissionsShape } from '../../shapes';
import CustomFieldSectionsForm from './CustomFieldSectionsForm';

const FIELDS_COUNT = 'fieldsCount';
const VISIBLE_COLUMNS = ['name', FIELDS_COUNT];
const COLUMN_MAPPING = {
  name: <FormattedMessage id="stripes-smart-components.customFields.sections.name" />,
  [FIELDS_COUNT]: <FormattedMessage id="stripes-smart-components.customFields.sections.fieldsCount" />,
};
const COLUMN_WIDTHS = {
  name: '50%',
  [FIELDS_COUNT]: '25%',
};

const propTypes = {
  backendModuleName: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  id: PropTypes.string,
  paneTitle: PropTypes.node,
  permissions: permissionsShape.isRequired,
};

const getSaveErrorMessage = async (error) => {
  const response = error?.response;

  if (response?.status !== 422) {
    return <FormattedMessage id="stripes-smart-components.customFields.errorOccurred" />;
  }

  const body = await response.clone().json().catch(() => null);

  if (body?.errors?.some(({ code }) => code === SECTION_IN_USE_ERROR_CODE)) {
    return <FormattedMessage id="stripes-smart-components.customFields.sections.save.inUse" />;
  }

  // the form rules out every other 422 but a name that was taken in the meantime (sent as text/plain)
  return (
    <FormattedMessage
      id="stripes-smart-components.error.name.duplicate"
      values={{ fieldLabel: <FormattedMessage id="stripes-smart-components.customFields.sections.name" /> }}
    />
  );
};

/**
 * Settings page for the custom field sections of one entity type: lists them in display order and,
 * in edit mode, lets the user add, rename, delete and reorder them and save all changes at once.
 * A section that is assigned to custom fields can't be deleted.
 */
const CustomFieldSectionsSettings = ({
  backendModuleName,
  entityType,
  id = 'custom-field-sections',
  paneTitle = <FormattedMessage id="stripes-smart-components.customFields.sections" />,
  permissions,
}) => {
  const callout = useCallout();
  // set while editing; a snapshot, so a refetch in the background doesn't reset the form
  const [formValues, setFormValues] = useState(null);

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

  const { replaceSections } = useCustomFieldSectionMutation({ moduleName: backendModuleName });

  const contentData = useMemo(() => sections.map(section => ({
    ...section,
    [FIELDS_COUNT]: (customFields || [])
      .filter(customField => customField[CUSTOM_FIELD_SECTION_ID_PROPERTY] === section.id)
      .length,
  })), [sections, customFields]);

  const startEditing = () => setFormValues({
    sections: contentData.map(section => ({
      key: section.id,
      id: section.id,
      name: section.name,
      [FIELDS_COUNT]: section[FIELDS_COUNT],
    })),
  });

  const stopEditing = useCallback(() => setFormValues(null), []);

  const onSubmit = useCallback(async ({ sections: rows }) => {
    try {
      await replaceSections({
        entityType,
        sections: rows.map(({ id: sectionId, name }) => ({
          ...(sectionId && { id: sectionId }),
          name: name.trim(),
          entityType,
        })),
      });
    } catch (error) {
      callout.sendCallout({
        type: 'error',
        message: await getSaveErrorMessage(error),
      });

      return { [FORM_ERROR]: true };
    }

    stopEditing();

    return undefined;
  }, [replaceSections, entityType, callout, stopEditing]);

  if (isLoadingSections || isLoadingCustomFields) {
    return <Icon icon="spinner-ellipsis" />;
  }

  if (formValues) {
    return (
      <CustomFieldSectionsForm
        id={id}
        initialValues={formValues}
        paneTitle={paneTitle}
        permissions={permissions}
        onCancel={stopEditing}
        onSubmit={onSubmit}
      />
    );
  }

  const lastMenu = permissions.canEdit
    ? (
      <Button
        buttonStyle="primary"
        marginBottom0
        onClick={startEditing}
      >
        {sections.length
          ? <FormattedMessage id="stripes-smart-components.customFields.edit" />
          : <FormattedMessage id="stripes-smart-components.customFields.new" />
        }
      </Button>
    )
    : null;

  return (
    <Pane
      id={`${id}-pane`}
      paneTitle={paneTitle}
      defaultWidth="fill"
      lastMenu={lastMenu}
    >
      <MultiColumnList
        id={id}
        interactive={false}
        contentData={contentData}
        visibleColumns={VISIBLE_COLUMNS}
        columnMapping={COLUMN_MAPPING}
        columnWidths={COLUMN_WIDTHS}
        isEmptyMessage={<FormattedMessage id="stripes-smart-components.customFields.sections.empty" />}
      />
    </Pane>
  );
};

CustomFieldSectionsSettings.propTypes = propTypes;

export default CustomFieldSectionsSettings;

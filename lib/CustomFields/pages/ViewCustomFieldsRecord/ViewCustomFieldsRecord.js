import React from 'react';
import PropTypes from 'prop-types';
import { chunk } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Accordion,
  KeyValue,
  NoValue,
  Row,
  Col,
  Checkbox,
  Icon,
  Badge,
} from '@folio/stripes-components';

import {
  rowShapes,
  fieldTypes,
  CUSTOM_FIELDS_SECTION_ID,
  CUSTOM_FIELD_SECTION_ID_PROPERTY,
} from '../../constants';

import LookupLabel from '../../components/LookupLabel';

import {
  useCustomFieldsQuery,
  useCustomFieldSectionsQuery,
  useSectionTitleQuery,
  useLoadingErrorCallout,
} from '../../utils';

const {
  TEXTAREA,
  TEXTFIELD,
  RADIO_BUTTON_GROUP,
  SELECT,
  MULTISELECT,
  CHECKBOX,
  DATE_PICKER,
  LOOKUP
} = fieldTypes;

const propTypes = {
  accordionId: PropTypes.string,
  allowedRefIds: PropTypes.arrayOf(PropTypes.string),
  backendModuleName: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  configNamePrefix: PropTypes.string,
  customFieldsLabel: PropTypes.node,
  customFieldsValues: PropTypes.object,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  hasCustomFieldSections: PropTypes.bool,
  isSectionTitleEnabled: PropTypes.bool,
  noCustomFieldsFoundLabel: PropTypes.node,
  onToggle: PropTypes.func,
  scope: PropTypes.string,
  sectionId: PropTypes.string,
  showAccordion: PropTypes.bool,
};

const ViewCustomFieldsRecord = ({
  accordionId,
  onToggle,
  expanded,
  backendModuleName,
  entityType,
  customFieldsValues = {},
  columnCount = 4,
  customFieldsLabel = <FormattedMessage id="stripes-smart-components.customFields" />,
  noCustomFieldsFoundLabel = <FormattedMessage id="stripes-smart-components.customFields.noCustomFieldsFound" />,
  configNamePrefix,
  scope,
  sectionId,
  showAccordion = true,
  isSectionTitleEnabled = true,
  allowedRefIds, // if allowedRefIds is empty, all custom fields will be shown
  // renders one more accordion per custom field section (FCFIELDS-95) that has visible fields;
  // fields without a known `sectionId` stay in the default accordion
  hasCustomFieldSections = false,
}) => {
  const {
    customFields,
    isLoadingCustomFields,
    isCustomFieldsError: customFieldsFetchFailed,
  } = useCustomFieldsQuery({
    moduleName: backendModuleName,
    entityType,
    sectionId,
  });

  const {
    sections,
    isLoadingSections,
    isSectionsError: sectionsFetchFailed,
  } = useCustomFieldSectionsQuery({
    moduleName: backendModuleName,
    entityType,
    enabled: hasCustomFieldSections,
  });

  const {
    sectionTitle,
    isLoadingSectionTitle,
    isSectionTitleError: sectionTitleFetchFailed,
  } = useSectionTitleQuery({
    moduleName: backendModuleName.toUpperCase(),
    configNamePrefix,
    scope,
    enabled: isSectionTitleEnabled,
  });

  const { formatDate } = useIntl();

  useLoadingErrorCallout({
    customFieldsFetchFailed: customFieldsFetchFailed || sectionsFetchFailed,
    sectionTitleFetchFailed,
  });
  const columnWidth = rowShapes / columnCount;

  const allVisibleCustomFields = customFields?.filter(customField => {
    if (allowedRefIds && !allowedRefIds.includes(customField.refId)) return false;
    return customField.visible;
  });
  const knownSectionIds = new Set(sections.map(section => section.id));
  const isInDefaultAccordion = customField => (
    !hasCustomFieldSections || !knownSectionIds.has(customField[CUSTOM_FIELD_SECTION_ID_PROPERTY])
  );
  const visibleCustomFields = allVisibleCustomFields?.filter(isInDefaultAccordion);
  const sectionAccordions = hasCustomFieldSections
    ? sections
      .map(section => ({
        section,
        fields: (allVisibleCustomFields || [])
          .filter(customField => customField[CUSTOM_FIELD_SECTION_ID_PROPERTY] === section.id),
      }))
      .filter(({ fields }) => fields.length)
    : [];
  const formattedCustomFields = chunk(visibleCustomFields, columnCount);
  const sectionsLoaded = !hasCustomFieldSections || !isLoadingSections;
  const customFieldsLoaded = !isLoadingCustomFields && !customFieldsFetchFailed && sectionsLoaded;
  // Don't use `!sectionTitleFetchFailed` in sectionTitleLoaded to prevent the accordion
  // title from staying on the loading spinner if the section-title fetch fails. If the
  // request fails, a callout will surface the error; checking for fetch failure here
  // would prevent the default title from showing.
  const sectionTitleLoaded = !isLoadingSectionTitle;

  const displayWhenClosed = (sectionTitleLoaded && customFieldsLoaded)
    ? (<Badge>{visibleCustomFields.length}</Badge>)
    : (<Icon icon="spinner-ellipsis" width="10px" />);

  const customFieldsAccordionTitle = sectionTitle.value || customFieldsLabel;

  const accordionLabel = sectionTitleLoaded
    ? customFieldsAccordionTitle
    : <Icon data-test-custom-fields-loading-icon icon="spinner-ellipsis" />;

  const accordionProps = {
    open: expanded,
    id: accordionId,
    onToggle,
    label: accordionLabel,
    displayWhenClosed,
    'data-test-custom-fields-view-accordion': true,
  };

  const findOptionLabelById = customField => optionId => {
    return customField.selectField.options.values.find(option => option.id === optionId).value;
  };

  const getSelectedOptionLabel = customField => {
    const selectedOptionId = customFieldsValues[customField.refId];

    return findOptionLabelById(customField)(selectedOptionId);
  };

  const getMultiselectOptionLabels = customField => {
    const selectedOptionsIds = customFieldsValues[customField.refId];
    const selectedOptionsLabels = selectedOptionsIds.map(findOptionLabelById(customField));

    return selectedOptionsLabels.join(', ');
  };

  const formatValue = customField => {
    const {
      refId,
      type,
    } = customField;

    const customFieldValue = customFieldsValues[refId];

    if (refId in customFieldsValues && customFieldValue !== '') {
      if (type === MULTISELECT && customFieldValue.length) {
        return getMultiselectOptionLabels(customField);
      }

      if (type === CHECKBOX) {
        return (
          <Checkbox
            checked={customFieldValue}
            disabled
          />
        );
      }

      if (type === SELECT || type === RADIO_BUTTON_GROUP) {
        return getSelectedOptionLabel(customField);
      }
      if (type === DATE_PICKER) {
        return formatDate(customFieldValue, { timeZone: 'UTC' });
      }
      if (type === LOOKUP) {
        return (
          <LookupLabel
            refEntityType={customField.lookupField?.refEntityType}
            id={customFieldValue}
            asLink
          />
        );
      }
      if (type === TEXTAREA || type === TEXTFIELD) {
        return customFieldValue;
      }
    }

    return <NoValue />;
  };

  const renderCustomField = (customField) => {
    return (
      <Col
        key={customField.refId}
        md={columnWidth}
        xs={rowShapes}
        data-test-col-custom-field
      >
        <KeyValue
          label={customField.name}
          value={formatValue(customField)}
        />
      </Col>
    );
  };

  const renderChunkedCustomFields = (fields = formattedCustomFields) => {
    return fields.map((row, i) => (
      <Row key={i}>
        {row.map(renderCustomField)}
      </Row>
    ));
  };

  // one accordion per section with visible fields, after the default accordion
  const renderSectionAccordions = () => sectionAccordions.map(({ section, fields }) => (
    <Accordion
      key={section.id}
      id={`${accordionId}-${section.id}`}
      label={section.name}
      displayWhenClosed={<Badge>{fields.length}</Badge>}
      data-test-custom-fields-view-accordion
    >
      {renderChunkedCustomFields(chunk(fields, columnCount))}
    </Accordion>
  ));

  if (sectionId || !showAccordion) {
    if (isLoadingCustomFields) {
      return (
        <Col md={columnWidth}>
          <Icon icon="spinner-ellipsis" />
        </Col>
      );
    }

    if (customFieldsFetchFailed || !visibleCustomFields?.length) {
      return null;
    }

    if (sectionId) {
      if (sectionId === CUSTOM_FIELDS_SECTION_ID && showAccordion) {
        return (
          <Accordion
            {...accordionProps}
          >
            {renderChunkedCustomFields()}
          </Accordion>
        );
      }

      return visibleCustomFields.map(renderCustomField);
    }

    if (!showAccordion) {
      return visibleCustomFields.map(renderCustomField);
    }
  }

  // with sections, an empty default accordion is left out as long as some section has fields
  const showDefaultAccordion = !customFieldsLoaded || formattedCustomFields.length || !sectionAccordions.length;

  return (
    <>
      {showDefaultAccordion && (
        <Accordion
          {...accordionProps}
        >
          {customFieldsLoaded && formattedCustomFields.length
            ? renderChunkedCustomFields()
            : noCustomFieldsFoundLabel
          }
        </Accordion>
      )}
      {customFieldsLoaded && renderSectionAccordions()}
    </>
  );
};

ViewCustomFieldsRecord.propTypes = propTypes;

export default ViewCustomFieldsRecord;

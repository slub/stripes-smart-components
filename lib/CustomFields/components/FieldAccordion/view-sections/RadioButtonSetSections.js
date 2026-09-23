import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HelpTextValue,
  NameValue,
  Options,
  DisplayInAccordion,
  CustomFieldSection,
  HiddenValue,
  RequiredValue,
} from './shared-values';

const propTypes = {
  displayInAccordion: PropTypes.string,
  customFieldSectionOptions: PropTypes.arrayOf(PropTypes.object),
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  sectionId: PropTypes.string,
  hasDisplayInAccordionField: PropTypes.bool,
  visible: PropTypes.bool.isRequired,
  required: PropTypes.bool.isRequired,
  helpText: PropTypes.string,
  name: PropTypes.string.isRequired,
  selectField: PropTypes.shape({
    defaults: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.shape({
      sorted: PropTypes.arrayOf(PropTypes.string),
      values: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }),
};

const RadioButtonSetSections = ({
  name,
  hasDisplayInAccordionField,
  helpText,
  selectField,
  displayInAccordion,
  displayInAccordionOptions,
  customFieldSectionOptions,
  sectionId,
  visible,
  required,
}) => (
  <>
    <Row>
      <NameValue value={name} />
      <HelpTextValue value={helpText} />
      {hasDisplayInAccordionField && (
        <DisplayInAccordion
          value={displayInAccordion}
          dataOptions={displayInAccordionOptions}
        />
      )}
      {customFieldSectionOptions && (
        <CustomFieldSection
          value={sectionId}
          dataOptions={customFieldSectionOptions}
        />
      )}
      <HiddenValue value={visible} />
      <RequiredValue value={required} />
    </Row>
    <Row>
      <Options selectField={selectField} />
    </Row>
  </>
);

RadioButtonSetSections.propTypes = propTypes;

export default RadioButtonSetSections;

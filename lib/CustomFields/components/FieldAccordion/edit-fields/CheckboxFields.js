import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  DisplayInAccordion,
  CustomFieldSection,
} from './shared-fields';

const propTypes = {
  customFieldSectionOptions: PropTypes.arrayOf(PropTypes.object),
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool.isRequired,
};

const CheckboxFields = ({
  fieldNamePrefix,
  displayInAccordionOptions,
  hasDisplayInAccordionField,
  customFieldSectionOptions,
}) => {
  return (
    <Row>
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
      {hasDisplayInAccordionField && (
        <DisplayInAccordion
          fieldNamePrefix={fieldNamePrefix}
          dataOptions={displayInAccordionOptions}
        />
      )}
      {customFieldSectionOptions && (
        <CustomFieldSection
          fieldNamePrefix={fieldNamePrefix}
          dataOptions={customFieldSectionOptions}
        />
      )}
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
    </Row>
  );
};

CheckboxFields.propTypes = propTypes;

export default CheckboxFields;

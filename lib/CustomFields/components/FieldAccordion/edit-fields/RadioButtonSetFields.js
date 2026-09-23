import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  OptionsField,
  DisplayInAccordion,
  CustomFieldSection,
  RequiredField,
} from './shared-fields';

const propTypes = {
  changeFieldValue: PropTypes.func.isRequired,
  customFieldSectionOptions: PropTypes.arrayOf(PropTypes.object),
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool.isRequired,
  onOptionDelete: PropTypes.func.isRequired,
  optionsStatsLoaded: PropTypes.bool.isRequired,
  usedOptions: PropTypes.arrayOf(PropTypes.string),
};

const RadioButtonSetFields = ({
  fieldNamePrefix,
  changeFieldValue,
  usedOptions,
  optionsStatsLoaded,
  onOptionDelete,
  displayInAccordionOptions,
  hasDisplayInAccordionField,
  customFieldSectionOptions,
}) => {
  return (
    <>
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
        <RequiredField fieldNamePrefix={fieldNamePrefix} />
      </Row>
      <Row>
        <OptionsField
          fieldNamePrefix={fieldNamePrefix}
          maxOptionsNumber={5}
          changeFieldValue={changeFieldValue}
          usedOptions={usedOptions}
          optionsStatsLoaded={optionsStatsLoaded}
          onOptionDelete={onOptionDelete}
        />
      </Row>
    </>
  );
};

RadioButtonSetFields.propTypes = propTypes;

export default RadioButtonSetFields;

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Col,
  Row,
  Select,
} from '@folio/stripes-components';

import { getLookupRefEntityTypeOptions } from '../../../lookup';
import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  DisplayInAccordion,
} from './shared-fields';

const propTypes = {
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object),
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool,
};

const LookupFields = ({
  fieldNamePrefix,
  displayInAccordionOptions,
  hasDisplayInAccordionField,
}) => {
  const { formatMessage } = useIntl();

  return (
    <Row>
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
      <Col xs={3}>
        <Field
          name={`${fieldNamePrefix}.lookupField.refEntityType`}
          label={formatMessage({ id: 'stripes-smart-components.customFields.lookup.refEntityType' })}
          component={Select}
          dataOptions={getLookupRefEntityTypeOptions(formatMessage)}
          required
          vertical
        />
      </Col>
      {hasDisplayInAccordionField && (
        <DisplayInAccordion
          fieldNamePrefix={fieldNamePrefix}
          dataOptions={displayInAccordionOptions}
        />
      )}
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <RequiredField fieldNamePrefix={fieldNamePrefix} />
    </Row>
  );
};

LookupFields.propTypes = propTypes;

export default LookupFields;

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Select,
  Col,
} from '@folio/stripes-components';

import { CUSTOM_FIELD_SECTION_ID_PROPERTY } from '../../../../../constants';

const CustomFieldSection = ({
  fieldNamePrefix,
  dataOptions,
}) => {
  const intl = useIntl();

  return (
    <Col xs={3}>
      <Field
        name={`${fieldNamePrefix}.${CUSTOM_FIELD_SECTION_ID_PROPERTY}`}
        label={intl.formatMessage({ id: 'stripes-smart-components.customFields.sections.name' })}
        component={Select}
        dataOptions={dataOptions}
        vertical
      />
    </Col>
  );
};

CustomFieldSection.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
};

export default CustomFieldSection;

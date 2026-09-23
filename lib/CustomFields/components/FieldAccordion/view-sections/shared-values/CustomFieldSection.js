import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

const CustomFieldSection = ({
  value,
  dataOptions,
}) => {
  // a missing or unknown section id means the default "Custom fields" accordion, the first option
  const label = dataOptions.find(option => option.value === value)?.label || dataOptions[0]?.label;

  return (
    <Col xs={3}>
      <KeyValue
        label={<FormattedMessage id="stripes-smart-components.customFields.sections.name" />}
        value={label}
      />
    </Col>
  );
};

CustomFieldSection.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.string,
};

export default CustomFieldSection;

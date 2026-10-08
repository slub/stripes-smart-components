import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

import { getAccordionOptionValue } from '../../../../utils/accordionOptionValue';

const DisplayInAccordion = ({
  value,
  sectionId,
  dataOptions,
}) => {
  const optionValue = getAccordionOptionValue({ displayInAccordion: value, sectionId }, dataOptions);
  const label = dataOptions.find(option => option.value === optionValue)?.label;

  return (
    <Col xs={3}>
      <KeyValue
        label={<FormattedMessage id="stripes-smart-components.customFields.displayInAccordion" />}
        value={label || <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName" />}
      />
    </Col>
  );
};

DisplayInAccordion.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  sectionId: PropTypes.string,
  value: PropTypes.string,
};

export default DisplayInAccordion;

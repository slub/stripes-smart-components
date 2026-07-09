import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Col,
  KeyValue,
  NoValue,
  Row,
} from '@folio/stripes-components';

import { getLookupSourceAdapter } from '../../../lookup';
import {
  HelpTextValue,
  NameValue,
  RequiredValue,
  DisplayInAccordion,
  HiddenValue,
} from './shared-values';

const propTypes = {
  displayInAccordion: PropTypes.string,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  hasDisplayInAccordionField: PropTypes.bool,
  helpText: PropTypes.string,
  lookupField: PropTypes.shape({
    source: PropTypes.string,
  }),
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired,
};

const LookupSection = (props) => {
  const { formatMessage } = useIntl();
  const adapter = getLookupSourceAdapter(props.lookupField?.source);

  return (
    <Row>
      <NameValue value={props.name} />
      <HelpTextValue value={props.helpText} />
      <Col xs={3}>
        <KeyValue
          label={<FormattedMessage id="stripes-smart-components.customFields.lookup.source" />}
          value={adapter ? formatMessage({ id: adapter.labelId }) : <NoValue />}
        />
      </Col>
      {props.hasDisplayInAccordionField && (
        <DisplayInAccordion
          value={props.displayInAccordion}
          dataOptions={props.displayInAccordionOptions}
        />
      )}
      <HiddenValue value={props.visible} />
      <RequiredValue value={props.required} />
    </Row>
  );
};

LookupSection.propTypes = propTypes;

export default LookupSection;

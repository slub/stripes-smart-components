import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Col,
  KeyValue,
  NoValue,
  Row,
} from '@folio/stripes-components';

import { getLookupAdapter } from '../../../lookup';
import {
  HelpTextValue,
  NameValue,
  RequiredValue,
  DisplayInAccordion,
  CustomFieldSection,
  HiddenValue,
} from './shared-values';

const propTypes = {
  customFieldSectionOptions: PropTypes.arrayOf(PropTypes.object),
  displayInAccordion: PropTypes.string,
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  hasDisplayInAccordionField: PropTypes.bool,
  helpText: PropTypes.string,
  lookupField: PropTypes.shape({
    refEntityType: PropTypes.string,
  }),
  name: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  sectionId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
};

const LookupSection = (props) => {
  const { formatMessage } = useIntl();
  const adapter = getLookupAdapter(props.lookupField?.refEntityType);

  return (
    <Row>
      <NameValue value={props.name} />
      <HelpTextValue value={props.helpText} />
      <Col xs={3}>
        <KeyValue
          label={<FormattedMessage id="stripes-smart-components.customFields.lookup.refEntityType" />}
          value={adapter ? formatMessage({ id: adapter.labelId }) : <NoValue />}
        />
      </Col>
      {props.hasDisplayInAccordionField && (
        <DisplayInAccordion
          value={props.displayInAccordion}
          dataOptions={props.displayInAccordionOptions}
        />
      )}
      {props.customFieldSectionOptions && (
        <CustomFieldSection
          value={props.sectionId}
          dataOptions={props.customFieldSectionOptions}
        />
      )}
      <HiddenValue value={props.visible} />
      <RequiredValue value={props.required} />
    </Row>
  );
};

LookupSection.propTypes = propTypes;

export default LookupSection;

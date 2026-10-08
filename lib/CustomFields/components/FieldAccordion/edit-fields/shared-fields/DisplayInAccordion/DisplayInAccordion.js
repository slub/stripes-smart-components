import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
  Field,
  useField,
  useForm,
} from 'react-final-form';

import {
  Select,
  Col,
} from '@folio/stripes-components';

import {
  CUSTOM_FIELDS_SECTION_ID,
  CUSTOM_FIELD_SECTION_ID_PROPERTY,
} from '../../../../../constants';
import {
  getAccordionOptionValue,
  isSectionOptionValue,
  parseAccordionOptionValue,
} from '../../../../../utils/accordionOptionValue';

const renderOptions = (options) => options.map(option => (
  <option
    key={option.value}
    value={option.value}
  >
    {option.label}
  </option>
));

// One select for the host accordions (`displayInAccordion`) and the custom field sections
// (`sectionId`): choosing one of them resets the other.
const DisplayInAccordion = ({
  fieldNamePrefix,
  dataOptions,
}) => {
  const intl = useIntl();
  const form = useForm();
  const sectionIdFieldName = `${fieldNamePrefix}.${CUSTOM_FIELD_SECTION_ID_PROPERTY}`;
  const { input: { value: sectionId } } = useField(sectionIdFieldName, { subscription: { value: true } });

  // with sections, the list is grouped: the default accordion, the sections, the host accordions
  const sectionOptions = dataOptions.filter(option => isSectionOptionValue(option.value));
  const hostOptions = dataOptions.filter(option => (
    !isSectionOptionValue(option.value) && option.value !== CUSTOM_FIELDS_SECTION_ID
  ));
  const isGrouped = sectionOptions.length > 0;

  return (
    <Col xs={3}>
      <Field name={`${fieldNamePrefix}.displayInAccordion`}>
        {({ input }) => (
          <Select
            name={input.name}
            label={intl.formatMessage({ id: 'stripes-smart-components.customFields.displayInAccordion' })}
            dataOptions={isGrouped ? dataOptions.filter(option => option.value === CUSTOM_FIELDS_SECTION_ID) : dataOptions}
            value={getAccordionOptionValue({ displayInAccordion: input.value, sectionId }, dataOptions)}
            onChange={(event) => {
              const parsed = parseAccordionOptionValue(event.target.value);

              input.onChange(parsed.displayInAccordion);
              form.change(sectionIdFieldName, parsed.sectionId);
            }}
            vertical
          >
            {isGrouped && (
              <optgroup label={intl.formatMessage({ id: 'stripes-smart-components.customFields.sections' })}>
                {renderOptions(sectionOptions)}
              </optgroup>
            )}
            {isGrouped && hostOptions.length > 0 && (
              <optgroup label={intl.formatMessage({ id: 'stripes-smart-components.customFields.displayInAccordion.systemAccordions' })}>
                {renderOptions(hostOptions)}
              </optgroup>
            )}
          </Select>
        )}
      </Field>
    </Col>
  );
};

DisplayInAccordion.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  fieldNamePrefix: PropTypes.string.isRequired,
};

export default DisplayInAccordion;

import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Pluggable } from '@folio/stripes-core';
import {
  IconButton,
  Label,
} from '@folio/stripes-components';

import {
  deserializeLookupValue,
  getLookupSourceAdapter,
  serializeLookupValue,
  unwrapSelectedRecord,
} from '../../lookup';
import LookupLabel from '../LookupLabel';

import css from './LookupField.css';

const propTypes = {
  disabled: PropTypes.bool,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  label: PropTypes.node,
  meta: PropTypes.shape({
    error: PropTypes.node,
    touched: PropTypes.bool,
  }),
  required: PropTypes.bool,
  source: PropTypes.string,
};

/**
 * Edit control for a lookup custom field. The displayed name is never editable by
 * hand: typing over it would leave the stored reference pointing somewhere else.
 */
const LookupField = ({
  input,
  meta = {},
  label,
  source,
  required = false,
  disabled = false,
}) => {
  const adapter = getLookupSourceAdapter(source);
  const reference = deserializeLookupValue(input.value);

  if (!adapter) {
    return (
      <div>
        <Label required={required}>{label}</Label>
        <FormattedMessage
          id="stripes-smart-components.customFields.lookup.unknownSource"
          values={{ source }}
        />
      </div>
    );
  }

  const handleSelect = (selection) => {
    input.onChange(serializeLookupValue(unwrapSelectedRecord(selection)));
  };

  const handleClear = () => {
    input.onChange('');
  };

  const validationError = meta.touched && meta.error;

  return (
    <div data-test-lookup-field>
      <Label
        htmlFor={input.name}
        required={required}
      >
        {label}
      </Label>

      <div className={css.controls}>
        <span
          className={css.value}
          id={input.name}
        >
          <LookupLabel
            source={source}
            id={reference?.id}
          />
        </span>

        {!disabled && (
          <Pluggable
            aria-haspopup="true"
            dataKey={source}
            id={`${input.name}-plugin`}
            searchButtonStyle="link"
            searchLabel={<FormattedMessage id={adapter.searchLabelId} />}
            type={adapter.pluginType}
            {...{ [adapter.selectProp]: handleSelect }}
          >
            <FormattedMessage id="stripes-smart-components.customFields.lookup.noPlugin" />
          </Pluggable>
        )}

        {!disabled && reference && (
          <FormattedMessage id="stripes-smart-components.customFields.lookup.clear">
            {([message]) => (
              <IconButton
                icon="times-circle-solid"
                aria-label={message}
                onClick={handleClear}
                data-test-lookup-clear
              />
            )}
          </FormattedMessage>
        )}
      </div>

      {validationError && (
        <div
          className={css.error}
          role="alert"
        >
          {meta.error}
        </div>
      )}
    </div>
  );
};

LookupField.propTypes = propTypes;

export default LookupField;

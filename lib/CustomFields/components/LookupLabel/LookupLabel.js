import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Icon,
  NoValue,
} from '@folio/stripes-components';

// Imported directly rather than through `utils/index` to keep this file out of the
// import cycle that `constants.js` would otherwise form via `fieldComponents`.
import useLookupRecord from '../../utils/useLookupRecord';

const propTypes = {
  asLink: PropTypes.bool,
  id: PropTypes.string,
  source: PropTypes.string.isRequired,
};

/**
 * Renders the display label for a referenced record. A missing record and a record
 * the user may not read are distinct outcomes and must stay distinguishable, so the
 * raw UUID is shown as a fallback rather than an empty field.
 */
const LookupLabel = ({
  source,
  id,
  asLink = false,
}) => {
  const {
    label,
    isLoadingRecord,
    isForbidden,
    isNotFound,
    viewPath,
  } = useLookupRecord({ source, id });

  if (!id) return <NoValue />;

  if (isLoadingRecord) return <Icon icon="spinner-ellipsis" width="60px" />;

  if (isForbidden) {
    return (
      <span data-test-lookup-forbidden>
        <FormattedMessage id="stripes-smart-components.customFields.lookup.noPermission" />
      </span>
    );
  }

  if (isNotFound || !label) {
    return (
      <span data-test-lookup-not-found>
        <FormattedMessage
          id="stripes-smart-components.customFields.lookup.notFound"
          values={{ id }}
        />
      </span>
    );
  }

  if (asLink && viewPath) {
    return <Link to={viewPath}>{label}</Link>;
  }

  return <span data-test-lookup-label>{label}</span>;
};

LookupLabel.propTypes = propTypes;

export default LookupLabel;

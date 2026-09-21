import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import useLookupRecord from '../../utils/useLookupRecord';
import LookupLabel from './LookupLabel';

jest.mock('../../utils/useLookupRecord', () => jest.fn());

const id = 'f0c5e5d2-0000-4000-8000-000000000001';

const recordState = (state = {}) => ({
  label: null,
  isLoadingRecord: false,
  isUnknownSource: false,
  isForbidden: false,
  isNotFound: false,
  hasLoadError: false,
  viewPath: `/organizations/view/${id}`,
  ...state,
});

const renderLookupLabel = (props = {}) => render(
  <MemoryRouter>
    <LookupLabel
      refEntityType="organization"
      id={id}
      {...props}
    />
  </MemoryRouter>,
);

describe('LookupLabel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the resolved label', () => {
    useLookupRecord.mockReturnValue(recordState({ label: 'Amazon.com' }));

    renderLookupLabel();

    expect(screen.getByText('Amazon.com')).toBeInTheDocument();
  });

  it('should report a deleted record', () => {
    useLookupRecord.mockReturnValue(recordState({ isNotFound: true }));

    renderLookupLabel();

    expect(screen.getByText('stripes-smart-components.customFields.lookup.notFound')).toBeInTheDocument();
  });

  it('should name the unknown source instead of claiming the record is missing', () => {
    useLookupRecord.mockReturnValue(recordState({ isUnknownSource: true }));

    renderLookupLabel({ refEntityType: 'vendor' });

    expect(screen.getByText('stripes-smart-components.customFields.lookup.unknownRefEntityType')).toBeInTheDocument();
  });

  it('should keep a failed request apart from a missing record', () => {
    useLookupRecord.mockReturnValue(recordState({ hasLoadError: true }));

    renderLookupLabel();

    expect(screen.getByText('stripes-smart-components.customFields.lookup.loadFailed')).toBeInTheDocument();
  });
});

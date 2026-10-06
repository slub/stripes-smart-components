import { useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';
import uniqueId from 'lodash/uniqueId';

import {
  Button,
  ConfirmationModal,
  IconButton,
  Pane,
  PaneFooter,
  TextField,
} from '@folio/stripes-components';
import stripesFinalForm from '@folio/stripes-final-form';

import { permissionsShape } from '../../shapes';

import styles from './CustomFieldSectionsForm.css';

// same limit as for custom field names (custom.fields.definition.name.length in the backend)
const NAME_LENGTH_LIMIT = 65;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  paneTitle: PropTypes.node.isRequired,
  permissions: permissionsShape.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const isSameName = (a, b) => a.trim().localeCompare(b.trim(), undefined, { sensitivity: 'base' }) === 0;

const validate = ({ sections = [] }) => {
  const errors = [];

  sections.forEach((section, index) => {
    const name = section.name || '';

    if (!name.trim()) {
      errors[index] = { name: <FormattedMessage id="stripes-core.label.missingRequiredField" /> };
    } else if (name.length > NAME_LENGTH_LIMIT) {
      errors[index] = { name: <FormattedMessage id="stripes-smart-components.customFields.fieldName.lengthLimit" /> };
    } else if (sections.some((other, otherIndex) => otherIndex !== index && isSameName(other.name || '', name))) {
      errors[index] = {
        name: (
          <FormattedMessage
            id="stripes-smart-components.error.name.duplicate"
            values={{ fieldLabel: <FormattedMessage id="stripes-smart-components.customFields.sections.name" /> }}
          />
        ),
      };
    }
  });

  return errors.length ? { sections: errors } : {};
};

/**
 * Form to add, rename, delete and reorder the custom field sections of one entity type.
 * Nothing is sent before the form is saved, the list position of a section becomes its display order.
 */
const CustomFieldSectionsForm = ({
  handleSubmit,
  id,
  onCancel,
  paneTitle,
  permissions,
  pristine,
  submitting,
}) => {
  const intl = useIntl();
  const [lastAddedKey, setLastAddedKey] = useState(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const nameLabel = intl.formatMessage({ id: 'stripes-smart-components.customFields.sections.name' });

  // cancelling doesn't leave the route, so the navigation check of the form doesn't ask
  const cancel = () => {
    if (pristine) {
      onCancel();
    } else {
      setIsConfirmingCancel(true);
    }
  };

  const renderRow = (fields, name, index) => {
    const section = fields.value[index];
    const isAssigned = section.fieldsCount > 0;

    return (
      <Draggable
        key={section.key}
        draggableId={section.key}
        index={index}
        isDragDisabled={fields.length < 2}
        // the drag handle is a button, which react-beautiful-dnd would not drag otherwise
        disableInteractiveElementBlocking
      >
        {(provided, snapshot) => {
          const row = (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={classnames(styles.row, { [styles['row--dragging']]: snapshot.isDragging })}
              data-test-custom-field-section-row
            >
              <IconButton
                icon="drag-drop"
                aria-label={intl.formatMessage({ id: 'stripes-smart-components.customFields.sections.dragDrop' })}
                {...provided.dragHandleProps}
              />
              <Field
                name={`${name}.name`}
                component={TextField}
                aria-label={nameLabel}
                autoFocus={section.key === lastAddedKey}
                marginBottom0
              />
              <div className={styles.fieldsCount}>
                {section.fieldsCount}
              </div>
              {(permissions.canDelete || !section.id) && (
                <IconButton
                  icon="trash"
                  aria-label={intl.formatMessage({ id: 'stripes-smart-components.customFields.sections.delete' })}
                  disabled={isAssigned}
                  onClick={() => fields.remove(index)}
                />
              )}
            </div>
          );

          // the pane is a scroll container, so the dragged row is rendered outside of it
          return snapshot.isDragging
            ? ReactDOM.createPortal(row, document.getElementById('ModuleContainer'))
            : row;
        }}
      </Draggable>
    );
  };

  const footer = (
    <PaneFooter
      renderStart={(
        <Button
          marginBottom0
          disabled={submitting}
          onClick={cancel}
        >
          <FormattedMessage id="stripes-smart-components.customFields.cancel" />
        </Button>
      )}
      renderEnd={(
        <Button
          marginBottom0
          buttonStyle="primary"
          disabled={pristine || submitting}
          onClick={handleSubmit}
        >
          <FormattedMessage id="stripes-smart-components.customFields.save&Close" />
        </Button>
      )}
    />
  );

  return (
    <Pane
      id={`${id}-edit-pane`}
      paneTitle={paneTitle}
      defaultWidth="fill"
      dismissible
      onClose={cancel}
      footer={footer}
    >
      <form
        id={`${id}-form`}
        className={styles.content}
        onSubmit={handleSubmit}
      >
        <FieldArray name="sections">
          {({ fields }) => {
            const addSection = () => {
              const key = uniqueId('unsaved_');

              setLastAddedKey(key);
              fields.push({ key, name: '', fieldsCount: 0 });
            };

            const onDragEnd = ({ source, destination }) => {
              if (destination && destination.index !== source.index) {
                fields.move(source.index, destination.index);
              }
            };

            return (
              <>
                {fields.length > 0
                  ? (
                    <>
                      <div className={styles.header}>
                        <span />
                        <span>{nameLabel}</span>
                        <FormattedMessage id="stripes-smart-components.customFields.sections.fieldsCount" />
                      </div>
                      <DragDropContext
                        onDragStart={() => setLastAddedKey(null)}
                        onDragEnd={onDragEnd}
                      >
                        <Droppable droppableId={`${id}-droppable`}>
                          {(droppableProvided) => (
                            <div
                              ref={droppableProvided.innerRef}
                              {...droppableProvided.droppableProps}
                            >
                              {fields.map((name, index) => renderRow(fields, name, index))}
                              {droppableProvided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </>
                  )
                  : <FormattedMessage id="stripes-smart-components.customFields.sections.empty" />
                }
                <div className={styles.addButton}>
                  <Button onClick={addSection}>
                    <FormattedMessage id="stripes-smart-components.customFields.sections.add" />
                  </Button>
                </div>
              </>
            );
          }}
        </FieldArray>
      </form>
      <ConfirmationModal
        id={`${id}-cancel-confirmation`}
        open={isConfirmingCancel}
        heading={<FormattedMessage id="stripes-form.areYouSure" />}
        message={<FormattedMessage id="stripes-form.unsavedChanges" />}
        confirmLabel={<FormattedMessage id="stripes-form.keepEditing" />}
        cancelLabel={<FormattedMessage id="stripes-form.closeWithoutSaving" />}
        onConfirm={() => setIsConfirmingCancel(false)}
        onCancel={onCancel}
      />
    </Pane>
  );
};

CustomFieldSectionsForm.propTypes = propTypes;

export default stripesFinalForm({
  navigationCheck: true,
  validate,
  subscription: {
    pristine: true,
    submitting: true,
  },
})(CustomFieldSectionsForm);

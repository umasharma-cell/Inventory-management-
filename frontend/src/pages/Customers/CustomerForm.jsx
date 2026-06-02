import { useState } from 'react';

import Button from '../../components/common/Button.jsx';

const initialState = {
  full_name: '',
  email: '',
  phone: '',
};

export default function CustomerForm({ onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.full_name.trim()) nextErrors.full_name = 'Customer name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = 'Enter a valid email';
    if (!/^\+?[0-9][0-9\s()-]{6,29}$/.test(values.phone)) {
      nextErrors.phone = 'Enter a valid phone number';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        <span>Name</span>
        <input
          value={values.full_name}
          onChange={(event) => updateField('full_name', event.target.value)}
        />
        {errors.full_name ? <small>{errors.full_name}</small> : null}
      </label>
      <label>
        <span>Email</span>
        <input value={values.email} onChange={(event) => updateField('email', event.target.value)} />
        {errors.email ? <small>{errors.email}</small> : null}
      </label>
      <label>
        <span>Phone</span>
        <input value={values.phone} onChange={(event) => updateField('phone', event.target.value)} />
        {errors.phone ? <small>{errors.phone}</small> : null}
      </label>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
